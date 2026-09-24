"use client";

import { useActionState, useEffect, useId, useOptimistic, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { CornerDownLeft, Loader2, TriangleAlert } from "lucide-react";

import { replyToTicket, type ActionResult } from "@/app/portal/actions";
import { Button } from "@/components/ui/button";
import { formatDateTime, relativeTime } from "@/lib/trading";
import { cn } from "@/lib/utils";

export type ThreadMessage = {
  id: string;
  senderType: "user" | "agent";
  message: string;
  createdAt: Date;
};

type RenderedMessage = ThreadMessage & { sending?: boolean };

const MAX_LENGTH = 4000;

export function TicketThread({
  ticketId,
  messages,
  traderName,
  closed,
}: {
  ticketId: string;
  messages: ThreadMessage[];
  traderName: string;
  closed: boolean;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    replyToTicket,
    null,
  );

  const [draft, setDraft] = useState("");
  const [optimistic, addOptimistic] = useOptimistic<RenderedMessage[], string>(
    messages,
    (current, text) => [
      ...current,
      {
        id: `sending-${current.length}`,
        senderType: "user",
        message: text,
        createdAt: new Date(),
        sending: true,
      },
    ],
  );

  const reduced = useReducedMotion();
  const fieldId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const lastSent = useRef("");
  const seen = useRef(messages.length);

  // Only follow the conversation once something new arrives, so opening the
  // page does not yank the viewport away from the ticket header.
  useEffect(() => {
    if (optimistic.length > seen.current) {
      endRef.current?.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "nearest",
      });
    }
    seen.current = optimistic.length;
  }, [optimistic.length, reduced]);

  // A rejected reply hands the text back rather than losing it.
  useEffect(() => {
    if (state && !state.ok && lastSent.current) {
      setDraft(lastSent.current);
      lastSent.current = "";
    }
  }, [state]);

  const trimmed = draft.trim();
  const tooLong = draft.length > MAX_LENGTH;
  const canSend = trimmed.length >= 2 && !tooLong && !pending;

  return (
    <div className="flex flex-col">
      <ol className="flex flex-col gap-5 px-5 py-6 sm:px-6">
        {optimistic.map((message) => (
          <Bubble key={message.id} message={message} traderName={traderName} />
        ))}
        <div ref={endRef} aria-hidden="true" />
      </ol>

      <div className="border-line-soft bg-sunken/40 border-t px-5 py-5 sm:px-6">
        <form
          ref={formRef}
          action={(formData) => {
            const text = String(formData.get("message") ?? "").trim();
            if (text.length < 2) return;
            lastSent.current = text;
            addOptimistic(text);
            setDraft("");
            formAction(formData);
          }}
          className="flex flex-col gap-3"
        >
          <input type="hidden" name="ticketId" value={ticketId} />

          {state && !state.ok && (
            <p
              role="alert"
              className="border-loss/40 bg-loss/10 text-loss flex items-start gap-2.5 rounded-[var(--radius-md)] border px-4 py-3 text-[0.8125rem]"
            >
              <TriangleAlert className="mt-px size-4 shrink-0" aria-hidden="true" />
              <span>{state.message}</span>
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={fieldId}
              className="text-muted text-[0.8125rem] font-medium"
            >
              {closed
                ? "Reply to reopen this conversation"
                : "Reply to Connect Funded support"}
            </label>
            <textarea
              id={fieldId}
              name="message"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                  event.preventDefault();
                  if (canSend) formRef.current?.requestSubmit();
                }
              }}
              rows={3}
              maxLength={MAX_LENGTH}
              placeholder="Add the account login if your question is about a specific account."
              aria-describedby={`${fieldId}-help`}
              className={cn(
                "border-line bg-raised text-ink placeholder:text-faint min-h-28 w-full resize-y rounded-xl border px-4 py-3 text-[0.9375rem] leading-relaxed outline-none transition-[border-color,box-shadow] duration-200",
                "focus:border-brand-light focus:shadow-[0_0_0_3px_rgb(var(--cf-brand-glow)/0.16)]",
                tooLong && "border-loss/70",
              )}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p id={`${fieldId}-help`} className="text-faint text-[0.78125rem]">
              {closed
                ? "This thread is closed. Sending a reply reopens it for the desk."
                : "Press Command or Control and Enter to send."}
              <span className="tabular ml-2">
                {draft.length}/{MAX_LENGTH}
              </span>
            </p>
            <Button type="submit" disabled={!canSend}>
              {pending ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" />
                  Sending
                </>
              ) : (
                <>
                  <CornerDownLeft aria-hidden="true" />
                  Send reply
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Bubble({
  message,
  traderName,
}: {
  message: RenderedMessage;
  traderName: string;
}) {
  const fromTrader = message.senderType === "user";

  return (
    <li
      className={cn(
        "flex max-w-full gap-3",
        fromTrader ? "flex-row-reverse self-end" : "self-start",
        "sm:max-w-[85%]",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "font-display grid size-8 shrink-0 place-items-center rounded-full border text-[0.6875rem] font-semibold",
          fromTrader
            ? "border-line-soft bg-sunken text-muted"
            : "border-brand/35 bg-brand/12 text-brand-light",
        )}
      >
        {fromTrader ? initials(traderName) : "CF"}
      </span>

      <div className="min-w-0">
        <div
          className={cn(
            "flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5",
            fromTrader && "justify-end",
          )}
        >
          <span className="text-[0.8125rem] font-medium">
            {fromTrader ? "You" : "Connect Funded support"}
          </span>
          <time
            dateTime={message.createdAt.toISOString()}
            title={`${formatDateTime(message.createdAt)} UTC`}
            className="text-faint text-[0.75rem]"
          >
            {message.sending ? "Sending" : relativeTime(message.createdAt)}
          </time>
        </div>

        <div
          className={cn(
            "mt-1.5 rounded-[var(--radius-md)] border px-4 py-3 text-[0.875rem] leading-relaxed whitespace-pre-wrap",
            fromTrader
              ? "border-brand/30 bg-brand/10"
              : "border-line-soft bg-panel",
            message.sending && "opacity-60",
          )}
        >
          {message.message}
        </div>
      </div>
    </li>
  );
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "You"
  );
}
