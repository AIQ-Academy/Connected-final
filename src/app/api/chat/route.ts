import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  safeValidateUIMessages,
  tool,
  type UIMessage,
  type UIMessageStreamWriter,
} from "ai";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getDb, hasDatabase } from "@/db";
import { getAccountTiers, getInstruments, getUpcomingEvents } from "@/db/queries";
import { crmLeads } from "@/db/schema";
import { recordAudit } from "@/lib/audit";
import { detectChatLanguage, isUnsupportedChatLanguage, type ChatLanguage } from "@/lib/chat/language";
import { buildSystemPrompt } from "@/lib/chat/knowledge";
import {
  isClearlyOffTopic,
  offTopicReply,
  allKnowledgeDocuments,
  retrieveKnowledge,
  unknownInformation,
} from "@/lib/chat/knowledge-retrieval";
import { generateLocalAnswer } from "@/lib/chat/local-assistant";
import { synchronizeKnowledge } from "@/lib/chat/knowledge-sync";
import { isSensitiveChatRequest } from "@/lib/chat/request-safety";
import { isContextualFollowUp, understandQuestion } from "@/lib/chat/question-understanding";
import { findFixedResponse } from "@/lib/chat/response-rules";
import { recordKnowledgeGap } from "@/lib/chat/knowledge-gaps";
import { cmsKnowledgeDocuments } from "@/lib/cms/discovery";
import { loadQuotes } from "@/lib/quotes.server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { emailField, fullNameField } from "@/lib/validation/registration";

// Local model inference runs on the Node runtime and can take longer on CPU.
export const runtime = "nodejs";
export const maxDuration = 120;

/** Keep the context window predictable and the bill small. */
const MAX_TURNS = 24;
const MAX_MESSAGE_CHARS = 4_000;
const MAX_BODY_BYTES = 80_000;

class BodyTooLargeError extends Error {}

export async function POST(request: Request) {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json({ message: "That message is too large." }, { status: 413 });
  }

  let rawMessages: unknown[];
  try {
    const body = z.object({ messages: z.array(z.unknown()).min(1).max(80) }).parse(
      JSON.parse(await readBodyLimited(request)),
    );
    rawMessages = body.messages.slice(-MAX_TURNS);
  } catch (error) {
    if (error instanceof BodyTooLargeError) {
      return NextResponse.json({ message: "That message is too large." }, { status: 413 });
    }
    return NextResponse.json(
      { message: "We could not read that chat request." },
      { status: 400 },
    );
  }

  const tools = buildTools();
  let validated: Awaited<ReturnType<typeof safeValidateUIMessages<UIMessage>>>;
  try {
    type ValidationTools = NonNullable<Parameters<typeof safeValidateUIMessages<UIMessage>>[0]["tools"]>;
    validated = await safeValidateUIMessages<UIMessage>({
      messages: rawMessages,
      tools: tools as unknown as ValidationTools,
    });
  } catch {
    return NextResponse.json({ message: "That chat request is not valid." }, { status: 400 });
  }
  if (!validated.success) {
    return NextResponse.json({ message: "That chat request is not valid." }, { status: 400 });
  }

  // Only plain user/assistant text is accepted into the prompt. Client-supplied
  // tool results and arbitrary data parts are not trusted as server facts.
  const messages = validated.data
    .filter((message) => message.role === "user" || message.role === "assistant")
    .map((message) => ({
      id: message.id,
      role: message.role as "user" | "assistant",
      parts: message.parts.flatMap((part) =>
        part.type === "text" && part.text.trim()
          ? [{ type: "text" as const, text: part.text.slice(0, MAX_MESSAGE_CHARS + 1) }]
          : [],
      ),
    }))
    .filter((message) => message.parts.length > 0);

  const latest = [...messages].reverse().find((message) => message.role === "user");
  const currentText = latest?.parts.map((part) => part.text).join("\n").trim() ?? "";
  const language = detectChatLanguage(currentText);
  if (!currentText) {
    return NextResponse.json({ message: "Send a message first." }, { status: 400 });
  }
  const ip = clientIp(request);
  const limit = rateLimit(`chat:${ip}`, { limit: 30, windowMs: 10 * 60_000 });
  if (!limit.ok) {
    return plainReply(rateLimitReply(language), { "retry-after": String(limit.retryAfter) });
  }
  if (currentText.length > MAX_MESSAGE_CHARS) {
    return plainReply(tooLongReply(language));
  }
  if (isUnsupportedChatLanguage(currentText)) return plainReply(unsupportedLanguageReply(language));
  if (isSensitiveChatRequest(currentText)) return plainReply(securityReply(language));

  // Curated, multilingual answers are always first in the response chain.
  const fixed = await findFixedResponse(currentText, language);
  if (fixed) return plainReply(fixed.text);

  const isFollowUp = isContextualFollowUp(currentText);
  const retrievalQuery = retrievalQueryFor(messages, currentText);
  const questionUnderstanding = understandQuestion(currentText, language);
  const cmsDocuments = await cmsKnowledgeDocuments().catch((error) => {
    console.error("[api/chat] live CMS retrieval failed", error);
    return [];
  });
  // Request-time hash checks keep CMS edits fresh without rebuilding unchanged
  // documents. Embeddings are recalculated only for changed language versions.
  await synchronizeKnowledge([...await allKnowledgeDocuments(), ...cmsDocuments]).catch((error) => {
    console.error("[api/chat] knowledge synchronization failed", error);
  });
  const retrieved = await retrieveKnowledge(retrievalQuery, language, 8, cmsDocuments);
  if (retrieved.length === 0) {
    if (!isClearlyOffTopic(currentText)) {
      const pathname = request.headers.get("referer")
        ? new URL(request.headers.get("referer")!, request.url).pathname
        : undefined;
      await recordKnowledgeGap(currentText, language, pathname).catch((error) => {
        console.error("[api/chat] knowledge gap recording failed", error);
      });
    }
    return plainReply(isClearlyOffTopic(currentText)
      ? offTopicReply(language)
      : unknownInformation(language));
  }

  const runtimeFacts = await runtimeFactsFor(retrievalQuery, retrieved.some((document) => document.id === "funded-evaluation-accounts"), questionUnderstanding.intent).catch((error) => {
    console.error("[api/chat] local live-data lookup failed", error);
    return undefined;
  });
  const answer = await generateLocalAnswer({
    language,
    documents: retrieved,
    systemPrompt: buildSystemPrompt({ language, documents: retrieved, runtimeFacts, understanding: questionUnderstanding }),
    messages: (isFollowUp ? messages.slice(-6) : messages.slice(-1)).map((message) => ({
      role: message.role,
      content: message.parts.map((part) => part.text).join("\n"),
    })),
    query: retrievalQuery,
    runtimeFacts,
  });
  return plainReply(answer);
}

async function runtimeFactsFor(query: string, referencesFundedEvaluations: boolean, intent: ReturnType<typeof understandQuestion>["intent"]) {
  const facts: string[] = [];
  if (referencesFundedEvaluations || /funded|evaluation|challenge|phase\s*[12]|profit split|profit target/iu.test(query)) {
    const tiers = await getAccountTiers();
    const wantsSize = /account size|size|capital|taille|capital|حجم الحساب|رأس المال/iu.test(query);
    const wantsPrice = /\b(price|pricing|cost|tarif|prix|coût)\b|سعر|تكلفة|ثمن/iu.test(query);
    const wantsDrawdown = /drawdown|loss limit|perte maximale|baisse maximale|السحب|التراجع/iu.test(query);
    const wantsTargets = /profit target|target|objective|objectif|هدف الربح|الهدف/iu.test(query);
    const wantsSplit = /profit split|profit share|partage des bénéfices|répartition des profits|نسبة الأرباح|تقاسم الأرباح/iu.test(query);
    const wantsPayout = /payout frequency|payout schedule|payment frequency|fréquence de paiement|موعد الدفعة|تكرار الدفعات/iu.test(query);
    const wantsDays = /minimum days|trading days|jours minimum|jours de trading|أيام التداول|الحد الأدنى للأيام/iu.test(query);
    const wantsLeverage = /leverage|levier|الرافعة/iu.test(query);
    const detailsRequested = wantsSize || wantsPrice || wantsDrawdown || wantsTargets || wantsSplit || wantsPayout || wantsDays || wantsLeverage;
    const normalizedQuery = query.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
    const requestedTiers = tiers.filter((tier) => [tier.name, tier.code].some((value) => {
      const name = value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
      return name.length > 1 && normalizedQuery.includes(name);
    }));
    const selectedTiers = requestedTiers.length ? requestedTiers : tiers;
    if (detailsRequested || intent === "list" || /which (?:funded )?(?:accounts|evaluations|packages)|quels comptes|ما هي الحسابات/iu.test(query)) {
      facts.push("Current funded evaluation data (not live broker accounts):", ...selectedTiers.map((tier) => {
        const fields = [
          wantsSize || (!detailsRequested && intent === "list") ? `account size $${tier.accountSize}` : "",
          wantsPrice || (!detailsRequested && intent === "list") ? `price $${tier.price}` : "",
          wantsTargets ? `phase targets ${tier.phase1TargetPct}%/${tier.phase2TargetPct}%` : "",
          wantsDrawdown ? `daily/overall drawdown ${tier.maxDailyDrawdownPct}%/${tier.maxOverallDrawdownPct}%` : "",
          wantsDays ? `minimum trading days ${tier.minTradingDays}` : "",
          wantsSplit ? `profit split ${tier.profitSplitPct}%` : "",
          wantsPayout ? `payout frequency ${tier.payoutFrequency}` : "",
          wantsLeverage ? `maximum leverage ${tier.maxLeverage}` : "",
        ].filter(Boolean);
        return `${tier.name}: ${fields.join("; ") || `account size $${tier.accountSize}`}.`;
      }));
    }
  }
  if (/calendar|economic event|upcoming release|next release/iu.test(query)) {
    const events = await getUpcomingEvents(8);
    facts.push("Current published economic calendar:", ...events.map((event) =>
      `${event.eventTime.toISOString()} · ${event.currency} · ${event.title} · ${event.impact} impact · forecast ${event.forecast ?? "not listed"} · previous ${event.previous ?? "not listed"}.`,
    ));
  }
  const hasAccountContext = /account|evaluation|funded|package|compte|évaluation|حساب|تقييم|باقة/iu.test(query);
  const currentPriceQuestion = !hasAccountContext && /\b(price|quote|market price|trading at|current value|how much is|ticker)\b|\b(cours|cotation|prix du marché)\b|سعر|كم يبلغ|السعر الحالي/iu.test(query);
  if (currentPriceQuestion) {
    const instruments = await getInstruments();
    const normalized = query.toLocaleUpperCase().replace(/\s+/gu, "");
    const matches = instruments.filter((item) => item.isActive && [item.symbol, item.displayName, item.tvSymbol]
      .some((name) => normalized.includes(name.toLocaleUpperCase().replace(/\s+/gu, ""))));
    if (matches.length) {
      const quotes = await loadQuotes({ symbols: matches.slice(0, 3).map((item) => item.symbol) });
      facts.push("Current market feed values (only when present; may be unavailable outside market hours):", ...quotes.quotes.map((quote) =>
        `${quote.symbol}: ${quote.price} ${quote.changePct >= 0 ? "+" : ""}${quote.changePct}%`,
      ));
    }
  }
  return facts.length ? facts.join("\n") : undefined;
}

async function readBodyLimited(request: Request) {
  if (!request.body) throw new Error("Missing request body");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new BodyTooLargeError("Request body is too large");
    }
    chunks.push(value);
  }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(body);
}

function tooLongReply(language: ChatLanguage) {
  const replies: Record<ChatLanguage, string> = {
    en: "That message is too long. Please shorten it and try again.",
    fr: "Votre message est trop long. Veuillez le raccourcir et réessayer.",
    ar: "رسالتك طويلة جداً. يرجى اختصارها ثم المحاولة مجدداً.",
  };
  return replies[language];
}

function rateLimitReply(language: ChatLanguage) {
  const replies: Record<ChatLanguage, string> = {
    en: "You’ve sent several messages in a short time. Please wait a few minutes and try again.",
    fr: "Vous avez envoyé plusieurs messages en peu de temps. Patientez quelques minutes avant de réessayer.",
    ar: "أرسلت عدة رسائل خلال وقت قصير. يرجى الانتظار بضع دقائق ثم المحاولة مجدداً.",
  };
  return replies[language];
}

function unsupportedLanguageReply(language: ChatLanguage) {
  return {
    en: "I can currently assist in English, French, or Arabic. Please resend your question in one of those languages.",
    fr: "Je peux répondre en anglais, en français ou en arabe. Veuillez reformuler votre question dans l’une de ces langues.",
    ar: "يمكنني المساعدة حالياً بالإنجليزية أو الفرنسية أو العربية. يرجى إعادة صياغة سؤالك بإحدى هذه اللغات.",
  }[language];
}

function securityReply(language: ChatLanguage) {
  return {
    en: "I can’t provide internal instructions, credentials, private data, or account records. I can help with information published on the Connect Funded website.",
    fr: "Je ne peux pas communiquer d’instructions internes, d’identifiants, de données privées ni de dossiers de compte. Je peux vous aider avec les informations publiées sur le site Connect Funded.",
    ar: "لا يمكنني مشاركة التعليمات الداخلية أو بيانات الدخول أو المعلومات الخاصة أو سجلات الحسابات. يمكنني المساعدة بمعلومات Connect Funded المنشورة على الموقع.",
  }[language];
}

function retrievalQueryFor(
  messages: Array<{ role: "user" | "assistant"; parts: Array<{ type: "text"; text: string }> }>,
  currentText: string,
) {
  // Keep independent questions isolated from older topics. Only join history
  // when the latest message is clearly elliptical ("what about its price?").
  if (!isContextualFollowUp(currentText)) return currentText;
  const previousUserText = messages
    .slice(0, -1)
    .reverse()
    .find((message) => message.role === "user")
    ?.parts.map((part) => part.text).join(" ");
  return previousUserText ? `${previousUserText} ${currentText}` : currentText;
}

/** A single assistant message delivered over the UI message stream protocol. */
function plainReply(text: string, headers?: Record<string, string>) {
  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      // No model stream to borrow the envelope from, so frame it ourselves.
      writer.write({ type: "start" });
      writeText(writer, text);
      writer.write({ type: "finish" });
    },
  });

  return createUIMessageStreamResponse({ stream, headers });
}

function writeText(writer: UIMessageStreamWriter, text: string) {
  const id = `desk-${Date.now()}`;
  writer.write({ type: "text-start", id });
  writer.write({ type: "text-delta", id, delta: text });
  writer.write({ type: "text-end", id });
}

function buildTools() {
  return {
    getAccountTiers: tool({
      description:
        "The funded-evaluation account catalogue: size, price, phase targets, drawdown limits, minimum trading days and profit split. These are separate from live-broker accounts. Use for funded evaluation pricing or rules questions.",
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
          const response = await loadQuotes({ symbols: [symbol] });
          const quote = response.quotes.find(
            (item) => item.symbol.toLocaleUpperCase() === symbol.toLocaleUpperCase(),
          );
          return quote ? { symbol, quote } : { unavailable: true, symbol };
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
