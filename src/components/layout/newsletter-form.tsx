"use client";

import { ArrowRight, Check, Loader2 } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Status = "idle" | "submitting" | "success" | "error";

export function NewsletterForm({
  className,
  tone = "default",
}: {
  className?: string;
  tone?: "default" | "onDark";
}) {
  const inputId = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();

    if (!EMAIL_PATTERN.test(value)) {
      setStatus("error");
      setMessage("Enter a valid email address.");
      return;
    }

    // Optimistic: confirm immediately, then reconcile if the request fails.
    setStatus("success");
    setMessage("You're on the list. First issue lands Sunday.");
    setEmail("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "Subscription failed");
      }
    } catch {
      setStatus("error");
      setMessage("We could not save that just now. Please try again.");
      setEmail(value);
    }
  }

  const succeeded = status === "success";

  return (
    <form
      onSubmit={onSubmit}
      className={cn("w-full max-w-xl", className)}
      noValidate
    >
      <label htmlFor={inputId} className="sr-only">
        Email address
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <input
            id={inputId}
            type="email"
            name="email"
            value={email}
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={status === "error"}
            aria-describedby={message ? `${inputId}-status` : undefined}
            onChange={(event) => {
              setEmail(event.target.value);
              if (status === "error") {
                setStatus("idle");
                setMessage("");
              }
            }}
            className={cn(
              "h-11 w-full rounded-full border px-4 text-sm transition-colors",
              "focus:border-brand-light focus:outline-none",
              tone === "onDark"
                ? "border-white/18 bg-white/[0.06] text-white placeholder:text-white/40"
                : "border-line bg-sunken text-ink placeholder:text-faint",
              status === "error" && "border-loss/70",
            )}
          />
        </div>
        <Button
          type="submit"
          disabled={status === "submitting"}
          className="sm:w-auto"
        >
          {status === "submitting" ? (
            <Loader2 className="animate-spin" />
          ) : succeeded ? (
            <Check />
          ) : null}
          {succeeded ? "Subscribed" : "Subscribe"}
          {!succeeded && status !== "submitting" && <ArrowRight />}
        </Button>
      </div>

      <p
        id={`${inputId}-status`}
        role="status"
        aria-live="polite"
        className={cn(
          "mt-2.5 min-h-[1.25rem] text-xs",
          status === "error"
            ? "text-loss"
            : tone === "onDark"
              ? "text-mint"
              : "text-mint",
        )}
      >
        {message}
      </p>
      <p className={cn("text-xs", tone === "onDark" ? "text-white/40" : "text-faint")}>
        No spam. Unsubscribe in one click, any time.
      </p>
    </form>
  );
}
