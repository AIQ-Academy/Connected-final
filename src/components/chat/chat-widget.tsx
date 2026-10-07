"use client";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  getToolName,
  isToolUIPart,
  type DynamicToolUIPart,
  type ToolUIPart,
  type UIMessage,
} from "ai";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import {
  ArrowUp,
  BadgeCheck,
  CalendarClock,
  Check,
  Loader2,
  MessageSquare,
  RefreshCcw,
  Square,
  TrendingUp,
  UserPlus,
  X,
} from "lucide-react";

import { LogoMark } from "@/components/brand/logo";
import { suggestedPrompts } from "@/lib/chat/knowledge";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/locale-provider";

const toolIcons: Record<string, typeof TrendingUp> = {
  getAccountTiers: BadgeCheck,
  getQuote: TrendingUp,
  getUpcomingEvents: CalendarClock,
  captureLead: UserPlus,
};

const subscribeToHydration = () => () => {};
const clientIsHydrated = () => true;
const serverIsHydrated = () => false;

export function ChatWidget() {
  const { t, locale } = useLocale();
  // Start as a floating launcher; opening the panel never changes page layout.
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    clientIsHydrated,
    serverIsHydrated,
  );
  const [input, setInput] = useState("");

  const reduced = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const pinnedToBottom = useRef(true);

  // Built once: a fresh transport on every render would reset the connection.
  const [transport] = useState(
    () => new DefaultChatTransport({ api: "/api/chat" }),
  );

  const { messages, sendMessage, status, error, stop, regenerate } = useChat({
    transport,
    experimental_throttle: 40,
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    const openFromMarket = () => setOpen(true);
    window.addEventListener("cf:open-chat", openFromMarket);
    return () => window.removeEventListener("cf:open-chat", openFromMarket);
  }, [setOpen]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        launcherRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open, mounted]);

  // Follow the stream, but stop fighting the user if they scroll up to read.
  useEffect(() => {
    if (!open || !pinnedToBottom.current) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: reduced ? "auto" : "smooth",
    });
  }, [messages, status, open, reduced]);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    pinnedToBottom.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 90;
  }, []);

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    pinnedToBottom.current = true;
    void sendMessage({ text: trimmed });
    setInput("");
  }

  if (!mounted) return null;

  return createPortal((
    <>
      <motion.button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="cf-chat-panel"
        aria-label={
          open
            ? t("chat.launcherClose")
            : t("chat.launcherOpen")
        }
        style={{
          position: "fixed",
          right: "clamp(1rem, 2vw, 1.5rem)",
          left: "auto",
          bottom: "max(1rem, env(safe-area-inset-bottom))",
          top: "auto",
          zIndex: 70,
        }}
        className={cn(
          "bg-brand btn-glow fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[70] grid size-14 place-items-center rounded-full text-white transition-colors sm:right-6 sm:bottom-6",
          "hover:bg-[var(--cf-brand-hover)] focus-visible:outline-2 focus-visible:outline-offset-4",
          open && "invisible",
        )}
        // Neutralised by value, never by dropping the prop: Motion manages
        // this element's tabindex only while a tap gesture is declared, and the
        // server cannot know the motion preference, so removing it on the
        // client is a hydration mismatch on that attribute.
        whileTap={{ scale: reduced ? 1 : 0.94 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "open"}
            initial={{
              opacity: 0,
              rotate: reduced ? 0 : -35,
              scale: reduced ? 1 : 0.7,
            }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={
              reduced ? { opacity: 0 } : { opacity: 0, rotate: 35, scale: 0.7 }
            }
            transition={{ duration: 0.18 }}
            className="grid place-items-center"
          >
            {open ? (
              <X className="size-6" />
            ) : (
              <MessageSquare className="size-[22px]" />
            )}
          </motion.span>
        </AnimatePresence>
        {!open && (
          <span
            aria-hidden="true"
            className="bg-mint border-bg absolute -top-0.5 -end-0.5 size-3.5 rounded-full border-2"
          />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label={t("chat.launcherClose")}
              className="fixed inset-0 z-[64] bg-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                setOpen(false);
                launcherRef.current?.focus();
              }}
            />

            <motion.div
              id="cf-chat-panel"
              role="dialog"
              aria-label={t("chat.panelLabel")}
              aria-modal="true"
              style={{
                position: "fixed",
                right: "clamp(0.75rem, 2vw, 1.5rem)",
                left: "auto",
                bottom: "calc(max(1rem, env(safe-area-inset-bottom)) + 5rem)",
                top: "auto",
                width: "min(22rem, calc(100vw - 1.5rem))",
                height: "min(36rem, calc(100dvh - 8rem))",
                zIndex: 65,
              }}
              className={cn(
                "bg-raised fixed right-3 bottom-[5.25rem] z-[65] flex h-[min(36rem,calc(100dvh-7rem))] w-[min(22rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-line shadow-[0_18px_54px_-16px_rgb(var(--cf-shadow-color)/0.55)]",
                "origin-bottom-right sm:right-6 sm:bottom-24 sm:h-[min(36rem,calc(100dvh-8rem))] sm:w-[min(22rem,calc(100vw-3rem))]",
              )}
            initial={
                reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.99 }}
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            >
              <header className="flex items-center gap-3 border-b border-white/15 bg-brand px-4 py-3 text-white">
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-white/25 bg-white/15">
                  <LogoMark className="h-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[0.9375rem] leading-tight font-semibold">
                    {t("chat.panelLabel")}
                  </p>
                  <p className="flex items-center gap-1.5 text-[0.75rem] text-white/75">
                    <span
                      className="bg-mint size-1.5 rounded-full"
                      aria-hidden="true"
                    />
                    {t("chat.status")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    launcherRef.current?.focus();
                  }}
                  aria-label={t("chat.dismiss")}
                  className="grid size-8 place-items-center rounded-lg text-white/85 transition-colors hover:bg-white/15 hover:text-white"
                >
                  <X className="size-4" />
                </button>
              </header>

              <div
                ref={scrollRef}
                onScroll={onScroll}
                className="bg-bg flex-1 overflow-y-auto px-4 py-4"
                aria-live="polite"
                aria-atomic="false"
              >
              {messages.length === 0 ? (
        <Greeting onPick={submit} disabled={busy} prompts={suggestedPrompts(locale)} />
              ) : (
                <ul className="flex flex-col gap-4">
                  {messages.map((message) => (
                    <li key={message.id}>
                      <MessageBubble message={message} />
                    </li>
                  ))}
                </ul>
              )}

              {status === "submitted" && <TypingIndicator />}

              {error && (
                <div
                  role="alert"
                  className="border-line-soft bg-panel mt-4 rounded-[var(--radius-md)] border px-3.5 py-3"
                >
                  <p className="text-muted text-[0.8125rem]">
                    {t("chat.disconnected")}
                  </p>
                  <button
                    type="button"
                    onClick={() => void regenerate()}
                    className="text-brand-light mt-2 inline-flex items-center gap-1.5 text-[0.8125rem] underline-offset-4 hover:underline"
                  >
                    <RefreshCcw className="size-3.5" />
                    {t("chat.retry")}
                  </button>
                </div>
              )}
            </div>

            <form
              className="border-line-soft bg-panel border-t px-3 py-3"
              onSubmit={(event) => {
                event.preventDefault();
                submit(input);
              }}
            >
              <div className="border-line bg-raised focus-within:border-brand-light focus-within:ring-brand/15 flex items-end gap-2 rounded-xl border px-3 py-2 shadow-sm ring-0 transition-[border-color,box-shadow] focus-within:ring-2">
                <label htmlFor="cf-chat-input" className="sr-only">
                  {t("chat.messageLabel")}
                </label>
                <textarea
                  id="cf-chat-input"
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={(event) => {
                    setInput(event.target.value);
                    const el = event.target;
                    el.style.height = "auto";
                    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      submit(input);
                    }
                  }}
                  placeholder={t("chat.promptPlaceholder")}
                  className="text-ink placeholder:text-faint max-h-30 min-h-6 flex-1 resize-none bg-transparent py-1 text-[0.875rem] outline-none"
                />
                {busy ? (
                  <button
                    type="button"
                    onClick={() => stop()}
                    aria-label={t("chat.stop")}
                    className="border-line text-muted hover:text-ink grid size-8 shrink-0 place-items-center rounded-lg border transition-colors"
                  >
                    <Square className="size-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    aria-label={t("chat.sendMessage")}
                    className="bg-brand hover:bg-[var(--cf-brand-hover)] grid size-8 shrink-0 place-items-center rounded-lg text-white transition-colors disabled:opacity-40"
                  >
                    <ArrowUp className="size-4" />
                  </button>
                )}
              </div>
              <p className="text-faint mt-2 px-1 text-[0.6875rem] leading-relaxed">
                {t("chat.disclaimerFull")}
              </p>
            </form>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  ), document.body);
}

function Greeting({
  onPick,
  disabled,
  prompts,
}: {
  onPick: (text: string) => void;
  disabled: boolean;
  prompts: readonly string[];
}) {
  const { t } = useLocale();
  return (
    <div>
      <div className="border-line-soft bg-panel rounded-[var(--radius-md)] border px-4 py-3.5 shadow-sm">
        <p className="text-ink text-[0.875rem] leading-relaxed">
          {t("chat.greeting")}
        </p>
      </div>

      <p className="text-faint mt-5 mb-2.5 px-1 font-mono text-[0.6875rem] tracking-[0.12em] uppercase">
        {t("chat.popularQuestions")}
      </p>
      <ul className="flex flex-col gap-2">
        {prompts.map((prompt) => (
          <li key={prompt}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onPick(prompt)}
              className="border-line bg-panel text-ink hover:border-brand/45 hover:bg-brand-dim/20 w-full rounded-xl border px-3.5 py-2.5 text-start text-[0.8125rem] shadow-sm transition-colors disabled:opacity-50"
            >
              {prompt}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const { t } = useLocale();
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[92%] min-w-0", isUser && "max-w-[85%]")}>
        <p className="sr-only">
          {isUser ? t("chat.youSaid") : t("chat.assistantReplied")}
        </p>
        <div
          className={cn(
            "rounded-[var(--radius-md)] px-3.5 py-2.5 text-[0.875rem] leading-relaxed",
            isUser
              ? "bg-brand rounded-br-md text-white shadow-[0_8px_20px_-12px_rgb(var(--cf-brand-glow)/0.9)]"
              : "border-line-soft bg-panel rounded-bl-md border shadow-sm",
          )}
        >
          {message.parts.map((part, index) => {
            if (part.type === "text") {
              return (
                <RichText key={index} text={part.text} inverted={isUser} />
              );
            }
            if (isToolUIPart(part)) {
              return <ToolTrace key={index} part={part} />;
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}

function ToolTrace({ part }: { part: ToolUIPart | DynamicToolUIPart }) {
  const { t } = useLocale();
  const name = getToolName(part);
  const Icon = toolIcons[name] ?? BadgeCheck;
  const toolKeys: Record<string, { running: "chat.accountRunning" | "chat.quoteRunning" | "chat.calendarRunning" | "chat.leadRunning"; done: "chat.accountDone" | "chat.quoteDone" | "chat.calendarDone" | "chat.leadDone" }> = {
    getAccountTiers: { running: "chat.accountRunning", done: "chat.accountDone" },
    getQuote: { running: "chat.quoteRunning", done: "chat.quoteDone" },
    getUpcomingEvents: { running: "chat.calendarRunning", done: "chat.calendarDone" },
    captureLead: { running: "chat.leadRunning", done: "chat.leadDone" },
  };
  const keys = toolKeys[name];

  const failed =
    part.state === "output-error" || part.state === "output-denied";
  const finished = part.state === "output-available";
  const label = failed
    ? t("chat.lookupFailed")
    : finished
      ? t(keys?.done ?? "chat.lookupDone")
      : t(keys?.running ?? "chat.lookupRunning");

  return (
    <div
      className={cn(
        "border-line-soft bg-sunken/70 my-1 flex items-center gap-2 rounded-lg border px-2.5 py-1.5 font-mono text-[0.6875rem] tracking-[0.04em]",
        failed ? "text-amber" : finished ? "text-mint" : "text-muted",
      )}
    >
      {failed ? (
        <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      ) : finished ? (
        <Check className="size-3.5 shrink-0" aria-hidden="true" />
      ) : (
        <Loader2
          className="size-3.5 shrink-0 animate-spin"
          aria-hidden="true"
        />
      )}
      <span className="truncate uppercase">{label}</span>
    </div>
  );
}

function TypingIndicator() {
  const { t } = useLocale();
  return (
    <div
      className="mt-4 flex items-center gap-2"
      aria-label={t("chat.typing")}
    >
      <span className="border-line-soft bg-panel flex items-center gap-1 rounded-full border px-3 py-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="bg-faint size-1.5 animate-bounce rounded-full"
            style={{ animationDelay: `${i * 140}ms`, animationDuration: "1s" }}
          />
        ))}
      </span>
    </div>
  );
}

/**
 * The model answers in light markdown. Rather than pull in a renderer for four
 * constructs, handle exactly what the system prompt asks it to produce:
 * paragraphs, hyphen bullets and bold spans.
 */
function RichText({ text, inverted }: { text: string; inverted: boolean }) {
  const blocks: { type: "p" | "ul"; lines: string[] }[] = [];

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trimEnd();
    const bullet = /^\s*[-*•]\s+(.*)$/.exec(line);
    const last = blocks.at(-1);

    if (bullet) {
      if (last?.type === "ul") last.lines.push(bullet[1]);
      else blocks.push({ type: "ul", lines: [bullet[1]] });
      continue;
    }

    if (!line.trim()) {
      if (last?.type === "p") blocks.push({ type: "p", lines: [] });
      continue;
    }

    if (last?.type === "p" && last.lines.length) last.lines.push(line);
    else blocks.push({ type: "p", lines: [line] });
  }

  return (
    <div className="flex flex-col gap-2">
      {blocks
        .filter((block) => block.lines.length)
        .map((block, index) =>
          block.type === "ul" ? (
            <ul key={index} className="flex flex-col gap-1 ps-1">
              {block.lines.map((line, i) => (
                <li key={i} className="flex gap-2">
                  <span
                    className={cn(
                      "mt-[0.55em] size-1 shrink-0 rounded-full",
                      inverted ? "bg-white/70" : "bg-brand-light",
                    )}
                    aria-hidden="true"
                  />
                  <span>{withBold(line)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p key={index}>{withBold(block.lines.join(" "))}</p>
          ),
        )}
    </div>
  );
}

function withBold(line: string) {
  return line.split(/(\*\*[^*]+\*\*)/g).map((chunk, index) =>
    chunk.startsWith("**") && chunk.endsWith("**") ? (
      <strong key={index} className="font-semibold">
        {chunk.slice(2, -2)}
      </strong>
    ) : (
      <span key={index}>{chunk.replace(/`/g, "")}</span>
    ),
  );
}

export default ChatWidget;
