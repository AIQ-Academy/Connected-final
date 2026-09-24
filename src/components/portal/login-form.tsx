"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  TriangleAlert,
} from "lucide-react";

import { TextField } from "@/components/form/field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { demoAccounts } from "@/lib/demo";
import { signupUrl } from "@/lib/site";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setFormError(null);
    setErrors({});

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password, next }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        redirectTo?: string;
        message?: string;
        errors?: Record<string, string>;
      };

      if (response.ok && payload.redirectTo) {
        router.replace(payload.redirectTo);
        router.refresh();
        return;
      }

      if (payload.errors) setErrors(payload.errors);
      setFormError(payload.message ?? "We could not sign you in. Try again.");
    } catch {
      setFormError("We could not reach the server. Check your connection.");
    } finally {
      setPending(false);
    }
  }

  function fillFromDemoAccount(account: (typeof demoAccounts)[number]) {
    setEmail(account.email);
    setPassword(account.password);
    setFormError(null);
    setErrors({});
  }

  return (
    <div className="flex flex-col gap-7">
      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        {formError && (
          <div
            role="alert"
            className="border-loss/40 bg-loss/10 text-loss flex items-start gap-2.5 rounded-xl border px-4 py-3 text-[0.8125rem]"
          >
            <TriangleAlert
              className="mt-px size-4 shrink-0"
              aria-hidden="true"
            />
            <span>{formError}</span>
          </div>
        )}

        <TextField
          label="Email address"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          value={email}
          error={errors.email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="relative">
          <TextField
            label="Password"
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="Your portal password"
            value={password}
            error={errors.password}
            onChange={(e) => setPassword(e.target.value)}
            className="[&_input]:pr-11"
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="text-faint hover:text-ink absolute top-[2.15rem] right-3 grid size-7 place-items-center rounded-md transition-colors"
          >
            {visible ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>

        <Button type="submit" size="lg" block disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="animate-spin" />
              Signing you in
            </>
          ) : (
            <>
              Sign in
              <ArrowRight />
            </>
          )}
        </Button>

        <p className="text-faint text-center text-[0.8125rem]">
          No account yet?{" "}
          <Link
            href={signupUrl}
            className="text-brand-light underline-offset-4 hover:underline"
          >
            Create account
          </Link>
        </p>
      </form>

      <div className="border-brand/30 bg-brand/[0.06] rounded-[var(--radius-md)] border p-4">
        <div className="mb-3 flex items-center gap-2">
          <KeyRound className="text-brand-light size-4" aria-hidden="true" />
          <p className="font-display text-[0.875rem] font-semibold">
            Demo access
          </p>
          <Badge tone="brand" className="ml-auto">
            Sandbox
          </Badge>
        </div>
        <p className="text-muted mb-4 text-[0.8125rem]">
          This build runs on seeded data. Use either profile to walk through the
          product — one click fills the form.
        </p>

        <ul className="flex flex-col gap-2.5">
          {demoAccounts.map((account) => (
            <li
              key={account.email}
              className="border-line-soft bg-panel flex flex-wrap items-center gap-3 rounded-xl border p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[0.8125rem] font-medium">{account.label}</p>
                <p className="text-faint truncate font-mono text-[0.75rem]">
                  {account.email}
                </p>
                <p className="text-faint truncate font-mono text-[0.75rem]">
                  {account.password}
                </p>
              </div>
              <Button
                type="button"
                variant="soft"
                size="sm"
                onClick={() => fillFromDemoAccount(account)}
              >
                Use this
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
