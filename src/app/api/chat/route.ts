import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
  type UIMessageStreamWriter,
} from "ai";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getDb, hasDatabase } from "@/db";
import { getAccountTiers, getUpcomingEvents } from "@/db/queries";
import { crmLeads } from "@/db/schema";
import { recordAudit } from "@/lib/audit";
import { buildSystemPrompt } from "@/lib/chat/knowledge";
import { cmsKnowledgeSummary } from "@/lib/cms/discovery";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { emailField, fullNameField } from "@/lib/validation/registration";

// Node runtime. Streaming works here, and the tools need the Postgres driver.
export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Routed through the Vercel AI Gateway by passing a bare "provider/model"
 * string — no provider package, no provider API key. Override with CHAT_MODEL
 * to A/B a different model without a deploy.
 */
const MODEL = process.env.CHAT_MODEL ?? "google/gemini-3.6-flash";

/** Keep the context window predictable and the bill small. */
const MAX_TURNS = 24;

const FALLBACK_REPLY =
  "I cannot reach the assistant service at the moment, so I do not want to guess at anything. " +
  "Deposits, withdrawals and first-payout rules are on the funding FAQ at /faq, trading terms are in the glossary at /glossary, and the desk answers " +
  "support@connectfunded.com within one business hour during market sessions.";

const INTERRUPTED_REPLY =
  "I lost the connection partway through that answer. Ask me again, or reach the desk at support@connectfunded.com.";

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = rateLimit(`chat:${ip}`, { limit: 30, windowMs: 10 * 60_000 });

  if (!limit.ok) {
    return NextResponse.json(
      { message: "You have sent a lot of messages. Give me a minute to catch up." },
      { status: 429, headers: { "retry-after": String(limit.retryAfter) } },
    );
  }

  let messages: UIMessage[];
  try {
    const body = (await request.json()) as { messages?: UIMessage[] };
    messages = Array.isArray(body.messages) ? body.messages.slice(-MAX_TURNS) : [];
  } catch {
    return NextResponse.json(
      { message: "We could not read that request." },
      { status: 400 },
    );
  }

  if (!messages.length) {
    return NextResponse.json({ message: "Send a message first." }, { status: 400 });
  }

  // The gateway authenticates with an API key, or with the Vercel OIDC token
  // that `vercel env pull` writes locally. Without either, answer helpfully
  // instead of returning a 500 the visitor would see as a broken widget.
  const hasGatewayCredentials = Boolean(
    process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN,
  );
  if (!hasGatewayCredentials) {
    console.warn("[api/chat] no AI Gateway credentials found, serving fallback");
    return plainReply(FALLBACK_REPLY);
  }

  const origin = new URL(request.url).origin;
  const modelMessages = await convertToModelMessages(messages);

  /**
   * The model stream is forwarded chunk by chunk rather than handed straight
   * to `toUIMessageStreamResponse`, so a gateway outage becomes an ordinary
   * assistant message instead of an error state. The visitor sees a useful
   * reply and a working widget either way.
   */
  // Ground the assistant in the copy that is actually published. A CMS read
  // failure degrades to the static prompt rather than dropping the reply.
  const cmsSummary = await cmsKnowledgeSummary().catch((error) => {
    console.error("[api/chat] CMS summary failed", error);
    return undefined;
  });

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      let failed = false;
      let deliveredText = false;

      try {
        const result = streamText({
          model: MODEL,
          system: buildSystemPrompt(cmsSummary),
          messages: modelMessages,
          temperature: 0.4,
          stopWhen: stepCountIs(5),
          tools: buildTools(origin),
        });

        const reader = result
          .toUIMessageStream({
            onError: (error) => {
              console.error("[api/chat] stream error", error);
              return "upstream-failure";
            },
          })
          .getReader();

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;

          if (value.type === "error") {
            failed = true;
            continue;
          }

          writer.write(value);
          if (value.type === "text-delta") deliveredText = true;
        }
      } catch (error) {
        console.error("[api/chat] failed to start stream", error);
        failed = true;
      }

      if (failed) {
        writeText(writer, deliveredText ? INTERRUPTED_REPLY : FALLBACK_REPLY);
        writer.write({ type: "finish" });
      }
    },
  });

  return createUIMessageStreamResponse({ stream });
}

/** A single assistant message delivered over the UI message stream protocol. */
function plainReply(text: string) {
  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      // No model stream to borrow the envelope from, so frame it ourselves.
      writer.write({ type: "start" });
      writeText(writer, text);
      writer.write({ type: "finish" });
    },
  });

  return createUIMessageStreamResponse({ stream });
}

function writeText(writer: UIMessageStreamWriter, text: string) {
  const id = `desk-${Date.now()}`;
  writer.write({ type: "text-start", id });
  writer.write({ type: "text-delta", id, delta: text });
  writer.write({ type: "text-end", id });
}

function buildTools(origin: string) {
  return {
    getAccountTiers: tool({
      description:
        "The live Connect Funded account catalogue: size, price, phase targets, drawdown limits, minimum trading days and profit split. Use for any pricing or rules question.",
      inputSchema: z.object({}),
      execute: async () => {
        const tiers = await getAccountTiers();
        return {
          tiers: tiers.map((tier) => ({
            code: tier.code,
            name: tier.name,
            accountSize: Number(tier.accountSize),
            price: Number(tier.price),
            phase1TargetPct: Number(tier.phase1TargetPct),
            phase2TargetPct: Number(tier.phase2TargetPct),
            maxDailyDrawdownPct: Number(tier.maxDailyDrawdownPct),
            maxOverallDrawdownPct: Number(tier.maxOverallDrawdownPct),
            minTradingDays: Number(tier.minTradingDays),
            profitSplitPct: Number(tier.profitSplitPct),
            payoutFrequency: tier.payoutFrequency,
            maxLeverage: tier.maxLeverage,
          })),
        };
      },
    }),

    getQuote: tool({
      description:
        "Live mid price for one instrument, for example XAU/USD, EUR/USD, NAS100 or BTC/USD. Returns unavailable:true when the market feed cannot be reached.",
      inputSchema: z.object({
        symbol: z
          .string()
          .describe("Instrument symbol as shown on the site, e.g. 'XAU/USD'."),
      }),
      execute: async ({ symbol }) => {
        try {
          const response = await fetch(
            `${origin}/api/market/quotes?symbols=${encodeURIComponent(symbol)}`,
            { headers: { accept: "application/json" }, cache: "no-store" },
          );

          if (!response.ok) {
            return {
              unavailable: true,
              symbol,
              reason: `The market feed answered ${response.status}.`,
            };
          }

          const data: unknown = await response.json();
          return { symbol, data };
        } catch {
          return {
            unavailable: true,
            symbol,
            reason: "The market feed did not respond.",
          };
        }
      },
    }),

    getUpcomingEvents: tool({
      description:
        "Scheduled economic releases with currency, impact, forecast and previous readings. Use for calendar and news-risk questions.",
      inputSchema: z.object({
        limit: z.number().int().min(1).max(20).default(8),
        impact: z.enum(["low", "medium", "high"]).nullish(),
      }),
      execute: async ({ limit, impact }) => {
        const events = await getUpcomingEvents(20);
        const filtered = impact
          ? events.filter((event) => event.impact === impact)
          : events;

        return {
          events: filtered.slice(0, limit).map((event) => ({
            time: event.eventTime.toISOString(),
            currency: event.currency,
            title: event.title,
            impact: event.impact,
            forecast: event.forecast,
            previous: event.previous,
          })),
        };
      },
    }),

    captureLead: tool({
      description:
        "Hand the visitor to the Connect Funded sales desk. Call once, only after they have voluntarily given both a full name and an email address and want to be contacted.",
      inputSchema: z.object({
        fullName: z.string().describe("The visitor's full name as they gave it."),
        email: z.string().describe("The visitor's email address."),
        interestedTier: z
          .string()
          .nullish()
          .describe("Tier code they are interested in, e.g. 'growth'."),
        note: z
          .string()
          .nullish()
          .describe("One line on what they are looking for."),
      }),
      execute: async ({ fullName, email, interestedTier, note }) => {
        const parsed = z
          .object({ fullName: fullNameField, email: emailField })
          .safeParse({ fullName, email });

        if (!parsed.success) {
          return {
            saved: false,
            reason:
              "That name or email did not look right. Ask the visitor to confirm it.",
          };
        }

        if (!hasDatabase()) {
          return { saved: false, reason: "The CRM is temporarily unreachable." };
        }

        try {
          const db = getDb();

          const [existing] = await db
            .select({ id: crmLeads.id })
            .from(crmLeads)
            .where(eq(crmLeads.email, parsed.data.email))
            .orderBy(desc(crmLeads.createdAt))
            .limit(1);

          if (existing) {
            return {
              saved: true,
              alreadyKnown: true,
              message: "This visitor is already on the desk's list.",
            };
          }

          const [lead] = await db
            .insert(crmLeads)
            .values({
              fullName: parsed.data.fullName,
              email: parsed.data.email,
              source: "ai_chatbot",
              interestedTier: interestedTier ?? null,
              status: "new",
              notes: note ?? "Captured by the website assistant.",
            })
            .returning({ id: crmLeads.id });

          await recordAudit({
            action: "lead.captured",
            entityType: "crm_lead",
            entityId: lead.id,
            metadata: { source: "ai_chatbot", interestedTier: interestedTier ?? null },
          });

          return {
            saved: true,
            message:
              "Saved. The desk follows up within one business hour during market sessions.",
          };
        } catch (error) {
          console.error("[api/chat] captureLead failed", error);
          return { saved: false, reason: "The CRM did not accept that just now." };
        }
      },
    }),
  };
}
