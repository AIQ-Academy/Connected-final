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
import { NextResponse } from "next/server";
import { z } from "zod";

import { getAccountTiers } from "@/db/queries";
import {
  buildOnboardingSystemPrompt,
  type OnboardingDraftSnapshot,
} from "@/lib/chat/onboarding-prompt";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODEL = process.env.CHAT_MODEL ?? "google/gemini-3.6-flash";
const MAX_TURNS = 32;

const FALLBACK_REPLY =
  "I cannot reach the assistant right now. You can still finish registration with the classic form — use the toggle at the top of this page — or email support@connectfunded.com.";

const INTERRUPTED_REPLY =
  "I lost the connection mid-reply. Send that again, or switch to the classic registration form above.";

const draftSchema = z.object({
  fullName: z.boolean(),
  email: z.boolean(),
  phone: z.boolean(),
  password: z.boolean(),
  country: z.boolean(),
  experience: z.boolean(),
  tierCode: z.string().nullable(),
  acceptTerms: z.boolean(),
  readyToSubmit: z.boolean(),
});

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = rateLimit(`onboarding:${ip}`, {
    limit: 40,
    windowMs: 10 * 60_000,
  });

  if (!limit.ok) {
    return NextResponse.json(
      { message: "Slow down for a minute — too many onboarding messages." },
      { status: 429, headers: { "retry-after": String(limit.retryAfter) } },
    );
  }

  let messages: UIMessage[] = [];
  let draft: OnboardingDraftSnapshot = {
    fullName: false,
    email: false,
    phone: false,
    password: false,
    country: false,
    experience: false,
    tierCode: null,
    acceptTerms: false,
    readyToSubmit: false,
  };

  try {
    const body = (await request.json()) as {
      messages?: UIMessage[];
      draft?: unknown;
    };
    messages = Array.isArray(body.messages)
      ? body.messages.slice(-MAX_TURNS)
      : [];
    const parsedDraft = draftSchema.safeParse(body.draft);
    if (parsedDraft.success) draft = parsedDraft.data;
  } catch {
    return NextResponse.json(
      { message: "We could not read that request." },
      { status: 400 },
    );
  }

  if (!messages.length) {
    return NextResponse.json({ message: "Send a message first." }, { status: 400 });
  }

  const hasGatewayCredentials = Boolean(
    process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN,
  );
  if (!hasGatewayCredentials) {
    console.warn("[api/onboarding/chat] no AI Gateway credentials, fallback");
    return plainReply(FALLBACK_REPLY);
  }

  const modelMessages = await convertToModelMessages(messages);

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      let failed = false;
      let deliveredText = false;

      try {
        const result = streamText({
          model: MODEL,
          system: buildOnboardingSystemPrompt(draft),
          messages: modelMessages,
          temperature: 0.35,
          stopWhen: stepCountIs(6),
          tools: {
            getAccountTiers: tool({
              description:
                "Live account catalogue with fees, targets, drawdowns and profit splits.",
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
                    isFeatured: tier.isFeatured,
                  })),
                };
              },
            }),

            recommendTier: tool({
              description:
                "Recommend an account tier from experience level and optional budget (evaluation fee ceiling in USD).",
              inputSchema: z.object({
                experience: z
                  .enum(["none", "under_1y", "1_3y", "3_5y", "over_5y"])
                  .describe("How long they have been trading."),
                budgetUsd: z
                  .number()
                  .min(0)
                  .nullish()
                  .describe("Max evaluation fee they are comfortable with."),
                preferredSize: z
                  .number()
                  .min(0)
                  .nullish()
                  .describe("Desired account size if they named one."),
              }),
              execute: async ({ experience, budgetUsd, preferredSize }) => {
                const tiers = await getAccountTiers();
                const sorted = [...tiers].sort(
                  (a, b) => Number(a.accountSize) - Number(b.accountSize),
                );

                let pick = sorted.find((t) => t.isFeatured) ?? sorted[1] ?? sorted[0];

                if (preferredSize && sorted.length) {
                  pick = sorted.reduce((best, tier) =>
                    Math.abs(Number(tier.accountSize) - preferredSize) <
                    Math.abs(Number(best.accountSize) - preferredSize)
                      ? tier
                      : best,
                  );
                } else if (budgetUsd != null) {
                  const affordable = sorted.filter(
                    (t) => Number(t.price) <= budgetUsd,
                  );
                  pick =
                    affordable[affordable.length - 1] ??
                    sorted[0] ??
                    pick;
                } else if (experience === "none" || experience === "under_1y") {
                  pick = sorted[0] ?? pick;
                } else if (experience === "over_5y") {
                  pick = sorted[sorted.length - 1] ?? pick;
                }

                if (!pick) {
                  return { found: false as const };
                }

                return {
                  found: true as const,
                  code: pick.code,
                  name: pick.name,
                  accountSize: Number(pick.accountSize),
                  price: Number(pick.price),
                  profitSplitPct: Number(pick.profitSplitPct),
                  rationale:
                    experience === "none" || experience === "under_1y"
                      ? "Smaller capital keeps the fee and risk surface lower while you learn the rulebook."
                      : preferredSize
                        ? "Closest published size to what you asked for."
                        : budgetUsd != null
                          ? "Largest catalogue size within your fee budget."
                          : "Balanced size most traders choose for this experience band.",
                };
              },
            }),

            presentForm: tool({
              description:
                "Open an inline onboarding form card in the UI. Use this instead of asking for passwords or terms in chat text.",
              inputSchema: z.object({
                step: z.enum([
                  "identity",
                  "profile",
                  "tier",
                  "consent",
                  "summary",
                ]),
                reason: z
                  .string()
                  .nullish()
                  .describe("One short line shown above the card."),
              }),
              execute: async ({ step, reason }) => ({
                step,
                reason: reason ?? null,
                opened: true,
              }),
            }),
          },
        });

        const reader = result
          .toUIMessageStream({
            onError: (error) => {
              console.error("[api/onboarding/chat] stream error", error);
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
        console.error("[api/onboarding/chat] failed", error);
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

function plainReply(text: string) {
  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      writer.write({ type: "start" });
      writeText(writer, text);
      writer.write({ type: "finish" });
    },
  });
  return createUIMessageStreamResponse({ stream });
}

function writeText(writer: UIMessageStreamWriter, text: string) {
  const id = `onboard-${Date.now()}`;
  writer.write({ type: "text-start", id });
  writer.write({ type: "text-delta", id, delta: text });
  writer.write({ type: "text-end", id });
}
