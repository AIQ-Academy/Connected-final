"use client";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  getToolName,
  isToolUIPart,
  type UIMessage,
} from "ai";
import {
  ArrowUp,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  Square,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CheckboxField, SelectField, TextField } from "@/components/form/field";
import type { WizardTier } from "@/components/register/register-wizard";
import { Button, ButtonLink } from "@/components/ui/button";
import { onboardingStarters } from "@/lib/chat/onboarding-prompt";
import { countries, experienceOptions } from "@/lib/countries";
import { cn, formatCompactCurrency, formatCurrency } from "@/lib/utils";
import { fieldErrors } from "@/lib/validation";
import {
  registrationFormSchema,
  registrationStepSchemas,
} from "@/lib/validation/registration";

export type OnboardingValues = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  country: string;
  experience: string;
  tierCode: string;
  acceptTerms: boolean;
  marketingOptIn: boolean;
};

type FormStep = "identity" | "profile" | "tier" | "consent" | "summary";

const emptyValues = (defaultTier: string): OnboardingValues => ({
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  country: "",
  experience: "",
  tierCode: defaultTier,
  acceptTerms: false,
  marketingOptIn: false,
});

function draftSnapshot(values: OnboardingValues) {
  const identityOk = registrationStepSchemas[0].safeParse(values).success;
  const profileOk = registrationStepSchemas[1].safeParse(values).success;
  const tierOk = registrationStepSchemas[2].safeParse(values).success;
  const consentOk = registrationStepSchemas[3].safeParse(values).success;

  return {
    fullName: values.fullName.trim().length >= 2,
    email: values.email.includes("@"),
    phone: values.phone.trim().length >= 7,
    password: values.password.length >= 10,
    country: Boolean(values.country),
    experience: Boolean(values.experience),
    tierCode: values.tierCode || null,
    acceptTerms: values.acceptTerms,
    readyToSubmit: identityOk && profileOk && tierOk && consentOk,
  };
}

function latestFormStep(messages: UIMessage[]): FormStep | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role !== "assistant") continue;
    for (let j = message.parts.length - 1; j >= 0; j--) {
      const part = message.parts[j];
      if (!isToolUIPart(part)) continue;
      if (getToolName(part) !== "presentForm") continue;
      if (part.state !== "output-available") continue;
      const output = part.output as { step?: FormStep } | undefined;
      if (
        output?.step === "identity" ||
        output?.step === "profile" ||
        output?.step === "tier" ||
        output?.step === "consent" ||
        output?.step === "summary"
      ) {
        return output.step;
      }
    }
  }
  return null;
}

export function AiOnboarding({
  tiers,
  initialTierCode,
}: {
  tiers: WizardTier[];
  initialTierCode?: string;
}) {
  const defaultTier =
    initialTierCode && tiers.some((t) => t.code === initialTierCode)
      ? initialTierCode
      : (tiers.find((t) => t.isFeatured)?.code ?? tiers[0]?.code ?? "");

  const [values, setValues] = useState<OnboardingValues>(() =>
    emptyValues(defaultTier),
  );
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [input, setInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ reference: string } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [manualStep, setManualStep] = useState<FormStep | null>(
    initialTierCode ? "tier" : null,
  );

  const progress = useMemo(() => draftSnapshot(values), [values]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const pinnedToBottom = useRef(true);

  const transport = useMemo(
    () => new DefaultChatTransport({
        api: "/api/onboarding/chat",
        prepareSendMessagesRequest: ({ messages, id, body }) => ({
          body: {
            ...body,
            id,
            messages,
            draft: progress,
          },
        }),
      }),
    [progress],
  );

  const { messages, sendMessage, status, stop } = useChat({
    transport,
    experimental_throttle: 40,
  });

  const busy = status === "submitted" || status === "streaming";
  const activeStep = manualStep ?? latestFormStep(messages);
  const selectedTier = tiers.find((t) => t.code === values.tierCode) ?? null;
  useEffect(() => {
    if (!pinnedToBottom.current) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, status, activeStep]);

  const setField = useCallback(
    <K extends keyof OnboardingValues>(key: K, value: OnboardingValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setFormErrors((prev) => {
        if (!(key in prev)) return prev;
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    },
    [],
  );

  function submitChat(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    pinnedToBottom.current = true;
    void sendMessage({ text: trimmed });
    setInput("");
  }

  function notifyFormSaved(label: string) {
    pinnedToBottom.current = true;
    void sendMessage({
      text: `I filled in the ${label} form. Continue from what's still missing.`,
    });
  }

  function saveIdentity() {
    const result = registrationStepSchemas[0].safeParse(values);
    if (!result.success) {
      setFormErrors(fieldErrors(result.error));
      return;
    }
    setFormErrors({});
    setManualStep("profile");
    notifyFormSaved("identity");
  }

  function saveProfile() {
    const result = registrationStepSchemas[1].safeParse(values);
    if (!result.success) {
      setFormErrors(fieldErrors(result.error));
      return;
    }
    setFormErrors({});
    setManualStep("tier");
    notifyFormSaved("trading profile");
  }

  function saveTier() {
    const result = registrationStepSchemas[2].safeParse(values);
    if (!result.success) {
      setFormErrors(fieldErrors(result.error));
      return;
    }
    setFormErrors({});
    setManualStep("consent");
    notifyFormSaved(
      `${selectedTier?.name ?? "account"} tier (${formatCompactCurrency(selectedTier?.accountSize ?? 0)})`,
    );
  }

  function saveConsent() {
    const result = registrationStepSchemas[3].safeParse(values);
    if (!result.success) {
      setFormErrors(fieldErrors(result.error));
      return;
    }
    setFormErrors({});
    setManualStep("summary");
    notifyFormSaved("terms");
  }

  async function createAccount() {
    const parsed = registrationFormSchema.safeParse(values);
    if (!parsed.success) {
      setFormErrors(fieldErrors(parsed.error));
      setFormError("Some details still need a look before we can create the account.");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fullName: parsed.data.fullName,
          email: parsed.data.email,
          phone: parsed.data.phone,
          password: parsed.data.password,
          country: parsed.data.country,
          experience: parsed.data.experience,
          tierCode: parsed.data.tierCode,
          acceptTerms: parsed.data.acceptTerms,
          marketingOptIn: parsed.data.marketingOptIn,
        }),
      });
      const data = (await response.json()) as {
        message?: string;
        reference?: string;
        errors?: Record<string, string>;
      };

      if (!response.ok) {
        if (data.errors) setFormErrors(data.errors);
        setFormError(data.message ?? "Registration failed.");
        return;
      }

      setDone({ reference: data.reference ?? "OK" });
    } catch {
      setFormError("Network error. Try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  }

  const checklist = useMemo(
    () => [
      { label: "Identity", done: progress.fullName && progress.email && progress.phone && progress.password },
      { label: "Profile", done: progress.country && progress.experience },
      { label: "Account", done: Boolean(progress.tierCode) },
      { label: "Terms", done: progress.acceptTerms },
    ],
    [progress],
  );

  if (done) {
    return (
      <div className="border-line-soft bg-panel mx-auto max-w-lg rounded-3xl border p-8 text-center">
        <div className="bg-mint/15 text-mint mx-auto grid size-12 place-items-center rounded-2xl">
          <Check className="size-6" />
        </div>
        <h2 className="font-display text-ink mt-5 text-2xl font-semibold">
          Account created
        </h2>
        <p className="text-muted mt-3 text-sm leading-relaxed">
          Reference{" "}
          <span className="text-ink font-mono font-semibold">{done.reference}</span>.
          Sign in to the portal to continue KYC and payment for your evaluation.
        </p>
        <ButtonLink href="/portal/login" size="lg" className="mt-7">
          Go to client portal
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-8">
      <div className="border-line-soft bg-panel flex min-h-[min(42rem,78dvh)] flex-col overflow-hidden rounded-3xl border">
        <header className="border-line-soft flex items-center gap-3 border-b px-5 py-4">
          <span className="bg-brand/15 text-brand-light grid size-10 place-items-center rounded-xl">
            <Sparkles className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-ink text-sm font-semibold">
              AI onboarding
            </p>
            <p className="text-faint text-[0.75rem]">
              Guided signup with secure form cards — not free-text passwords
            </p>
          </div>
        </header>

        <div
          ref={scrollRef}
          onScroll={() => {
            const el = scrollRef.current;
            if (!el) return;
            pinnedToBottom.current =
              el.scrollHeight - el.scrollTop - el.clientHeight < 100;
          }}
          className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5"
        >
          {messages.length === 0 && (
            <div className="border-line-soft bg-raised/50 rounded-2xl border px-4 py-4">
              <p className="text-ink text-[0.9375rem] leading-relaxed">
                I will walk you through opening an evaluation: who you are, your
                trading profile, which account size fits, then terms. Ask anything
                about the rulebook along the way.
              </p>
              <ul className="mt-4 flex flex-col gap-2">
                {onboardingStarters.map((prompt) => (
                  <li key={prompt}>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => submitChat(prompt)}
                      className="border-line hover:border-brand-light/70 hover:bg-brand-dim/20 w-full rounded-xl border px-3.5 py-2.5 text-start text-[0.8125rem] transition-colors disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {status === "submitted" && (
            <div className="text-muted flex items-center gap-2 text-sm">
              <Loader2 className="size-4 animate-spin" />
              Thinking…
            </div>
          )}

          {activeStep && (
            <div className="border-brand/25 bg-brand/[0.04] rounded-2xl border p-4 sm:p-5">
              {activeStep === "identity" && (
                <IdentityCard
                  values={values}
                  errors={formErrors}
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword((v) => !v)}
                  onChange={setField}
                  onSave={saveIdentity}
                />
              )}
              {activeStep === "profile" && (
                <ProfileCard
                  values={values}
                  errors={formErrors}
                  onChange={setField}
                  onSave={saveProfile}
                />
              )}
              {activeStep === "tier" && (
                <TierCard
                  tiers={tiers}
                  values={values}
                  errors={formErrors}
                  onChange={setField}
                  onSave={saveTier}
                />
              )}
              {activeStep === "consent" && (
                <ConsentCard
                  values={values}
                  errors={formErrors}
                  onChange={setField}
                  onSave={saveConsent}
                />
              )}
              {activeStep === "summary" && (
                <SummaryCard
                  values={values}
                  tier={selectedTier}
                  submitting={submitting}
                  error={formError}
                  onSubmit={createAccount}
                />
              )}
            </div>
          )}
        </div>

        <form
          className="border-line-soft border-t px-3 py-3 sm:px-4"
          onSubmit={(event) => {
            event.preventDefault();
            submitChat(input);
          }}
        >
          <div className="border-line bg-raised focus-within:border-brand-light flex items-end gap-2 rounded-xl border px-3 py-2">
            <textarea
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
                  submitChat(input);
                }
              }}
              placeholder="Ask about tiers, or tell me what you want…"
              className="text-ink placeholder:text-faint max-h-30 min-h-6 flex-1 resize-none bg-transparent py-1 text-[0.875rem] outline-none"
            />
            {busy ? (
              <button
                type="button"
                onClick={() => stop()}
                aria-label="Stop"
                className="border-line text-muted grid size-8 place-items-center rounded-lg border"
              >
                <Square className="size-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                aria-label="Send"
                className="bg-brand hover:bg-[var(--cf-brand-hover)] grid size-8 place-items-center rounded-lg text-white disabled:opacity-40"
              >
                <ArrowUp className="size-4" />
              </button>
            )}
          </div>
        </form>
      </div>

      <aside className="border-line-soft bg-panel h-fit rounded-3xl border p-5 lg:sticky lg:top-24">
        <p className="eyebrow">
          <span className="chev" />
          Progress
        </p>
        <ul className="mt-4 space-y-3">
          {checklist.map((item) => (
            <li key={item.label} className="flex items-center gap-2.5 text-sm">
              <span
                className={cn(
                  "grid size-5 place-items-center rounded-full border",
                  item.done
                    ? "border-mint bg-mint/15 text-mint"
                    : "border-line text-faint",
                )}
              >
                {item.done ? <Check className="size-3" /> : null}
              </span>
              <span className={item.done ? "text-ink" : "text-muted"}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>
        {selectedTier && (
          <div className="border-line-soft mt-5 border-t pt-5">
            <p className="text-faint font-mono text-[0.6875rem] tracking-[0.12em] uppercase">
              Selected
            </p>
            <p className="font-display text-ink mt-1 text-lg font-semibold">
              {selectedTier.name}
            </p>
            <p className="text-muted mt-1 text-[0.8125rem]">
              {formatCompactCurrency(selectedTier.accountSize)} ·{" "}
              {formatCurrency(selectedTier.price, { decimals: 0 })} fee
            </p>
          </div>
        )}
        <div className="mt-5 flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setManualStep("identity")}
          >
            Open identity form
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setManualStep("summary")}
            disabled={!progress.readyToSubmit}
          >
            Review & create
          </Button>
        </div>
      </aside>
    </div>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[92%] rounded-2xl px-3.5 py-2.5 text-[0.875rem] leading-relaxed",
          isUser
            ? "bg-brand rounded-br-md text-white"
            : "border-line-soft bg-raised rounded-bl-md border",
        )}
      >
        {message.parts.map((part, index) => {
          if (part.type === "text" && part.text.trim()) {
            return (
              <p key={index} className="whitespace-pre-wrap">
                {part.text}
              </p>
            );
          }
          if (isToolUIPart(part)) {
            const name = getToolName(part);
            const running = part.state !== "output-available";
            const label =
              name === "presentForm"
                ? running
                  ? "Opening a form"
                  : "Form ready"
                : name === "recommendTier"
                  ? running
                    ? "Matching a tier"
                    : "Tier recommendation ready"
                  : name === "getAccountTiers"
                    ? running
                      ? "Reading the catalogue"
                      : "Catalogue checked"
                    : running
                      ? "Working"
                      : "Done";
            return (
              <p
                key={index}
                className={cn(
                  "my-1 font-mono text-[0.6875rem] tracking-[0.06em] uppercase",
                  isUser ? "text-white/70" : "text-muted",
                )}
              >
                {running ? "…" : "✓"} {label}
              </p>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

function IdentityCard({
  values,
  errors,
  showPassword,
  onTogglePassword,
  onChange,
  onSave,
}: {
  values: OnboardingValues;
  errors: Record<string, string>;
  showPassword: boolean;
  onTogglePassword: () => void;
  onChange: <K extends keyof OnboardingValues>(
    key: K,
    value: OnboardingValues[K],
  ) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-display text-ink text-base font-semibold">Your details</p>
        <p className="text-muted mt-1 text-[0.8125rem]">
          Stored securely — passwords never go through the chat transcript.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          label="Full legal name"
          required
          value={values.fullName}
          error={errors.fullName}
          data-field="fullName"
          onChange={(e) => onChange("fullName", e.target.value)}
          className="sm:col-span-2"
        />
        <TextField
          label="Email"
          type="email"
          required
          value={values.email}
          error={errors.email}
          data-field="email"
          onChange={(e) => onChange("email", e.target.value)}
        />
        <TextField
          label="Phone"
          required
          value={values.phone}
          error={errors.phone}
          data-field="phone"
          onChange={(e) => onChange("phone", e.target.value)}
        />
        <div className="relative sm:col-span-2">
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            required
            value={values.password}
            error={errors.password}
            hint="At least 10 characters with a letter and a number."
            data-field="password"
            onChange={(e) => onChange("password", e.target.value)}
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="text-faint hover:text-ink absolute top-9 end-3"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <TextField
          label="Confirm password"
          type={showPassword ? "text" : "password"}
          required
          value={values.confirmPassword}
          error={errors.confirmPassword}
          data-field="confirmPassword"
          onChange={(e) => onChange("confirmPassword", e.target.value)}
          className="sm:col-span-2"
        />
      </div>
      <Button type="button" onClick={onSave}>
        Save and continue
      </Button>
    </div>
  );
}

function ProfileCard({
  values,
  errors,
  onChange,
  onSave,
}: {
  values: OnboardingValues;
  errors: Record<string, string>;
  onChange: <K extends keyof OnboardingValues>(
    key: K,
    value: OnboardingValues[K],
  ) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-display text-ink text-base font-semibold">
          Trading profile
        </p>
        <p className="text-muted mt-1 text-[0.8125rem]">
          Used for compliance residency checks and sizing guidance.
        </p>
      </div>
      <SelectField
        label="Country of residence"
        required
        value={values.country}
        error={errors.country}
        data-field="country"
        onChange={(e) => onChange("country", e.target.value)}
      >
        <option value="">Select country</option>
        {countries.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </SelectField>
      <SelectField
        label="Trading experience"
        required
        value={values.experience}
        error={errors.experience}
        data-field="experience"
        onChange={(e) => onChange("experience", e.target.value)}
      >
        <option value="">Select experience</option>
        {experienceOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectField>
      <Button type="button" onClick={onSave}>
        Save profile
      </Button>
    </div>
  );
}

function TierCard({
  tiers,
  values,
  errors,
  onChange,
  onSave,
}: {
  tiers: WizardTier[];
  values: OnboardingValues;
  errors: Record<string, string>;
  onChange: <K extends keyof OnboardingValues>(
    key: K,
    value: OnboardingValues[K],
  ) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-display text-ink text-base font-semibold">
          Choose your account
        </p>
        <p className="text-muted mt-1 text-[0.8125rem]">
          Same rulebook on every size. Only capital, fee and split change.
        </p>
      </div>
      {errors.tierCode && (
        <p className="text-loss text-[0.8125rem]" role="alert">
          {errors.tierCode}
        </p>
      )}
      <ul className="grid gap-2 sm:grid-cols-2">
        {tiers.map((tier) => {
          const selected = values.tierCode === tier.code;
          return (
            <li key={tier.code}>
              <button
                type="button"
                onClick={() => onChange("tierCode", tier.code)}
                aria-pressed={selected}
                className={cn(
                  "w-full rounded-xl border p-3.5 text-start transition-colors",
                  selected
                    ? "border-brand bg-brand/10"
                    : "border-line hover:border-brand-light/60",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-ink text-sm font-semibold">{tier.name}</span>
                  {tier.isFeatured && (
                    <span className="text-brand-light font-mono text-[0.625rem] uppercase">
                      Popular
                    </span>
                  )}
                </div>
                <p className="font-display text-ink mt-2 text-xl font-semibold">
                  {formatCompactCurrency(tier.accountSize)}
                </p>
                <p className="text-muted mt-1 text-[0.75rem]">
                  {formatCurrency(tier.price, { decimals: 0 })} · {tier.profitSplitPct}%
                  split
                </p>
              </button>
            </li>
          );
        })}
      </ul>
      <Button type="button" onClick={onSave}>
        Use this account
      </Button>
    </div>
  );
}

function ConsentCard({
  values,
  errors,
  onChange,
  onSave,
}: {
  values: OnboardingValues;
  errors: Record<string, string>;
  onChange: <K extends keyof OnboardingValues>(
    key: K,
    value: OnboardingValues[K],
  ) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-display text-ink text-base font-semibold">
          Terms & consent
        </p>
        <p className="text-muted mt-1 text-[0.8125rem]">
          Required before we create the portal login.
        </p>
      </div>
      <CheckboxField
        checked={values.acceptTerms}
        error={errors.acceptTerms}
        data-field="acceptTerms"
        onChange={(e) => onChange("acceptTerms", e.target.checked)}
        label={
          <span>
            I accept the{" "}
            <Link href="/legal/terms" className="text-brand-light underline-offset-2 hover:underline">
              terms
            </Link>{" "}
            and{" "}
            <Link
              href="/legal/risk-disclosure"
              className="text-brand-light underline-offset-2 hover:underline"
            >
              risk disclosure
            </Link>
            .
          </span>
        }
      />
      <CheckboxField
        checked={values.marketingOptIn}
        onChange={(e) => onChange("marketingOptIn", e.target.checked)}
        label="Send me product updates and desk notes (optional)."
      />
      <Button type="button" onClick={onSave}>
        Continue to review
      </Button>
    </div>
  );
}

function SummaryCard({
  values,
  tier,
  submitting,
  error,
  onSubmit,
}: {
  values: OnboardingValues;
  tier: WizardTier | null;
  submitting: boolean;
  error: string | null;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-display text-ink text-base font-semibold">
          Review & create
        </p>
        <p className="text-muted mt-1 text-[0.8125rem]">
          Confirm the details, then we open your portal account.
        </p>
      </div>
      <dl className="border-line-soft divide-line-soft divide-y rounded-xl border text-sm">
        <Row label="Name" value={values.fullName} />
        <Row label="Email" value={values.email} />
        <Row label="Phone" value={values.phone} />
        <Row label="Country" value={values.country} />
        <Row
          label="Experience"
          value={
            experienceOptions.find((o) => o.value === values.experience)?.label ??
            values.experience
          }
        />
        <Row
          label="Account"
          value={
            tier
              ? `${tier.name} · ${formatCompactCurrency(tier.accountSize)} · ${formatCurrency(tier.price, { decimals: 0 })}`
              : values.tierCode
          }
        />
      </dl>
      {error && (
        <p className="text-loss text-[0.8125rem]" role="alert">
          {error}
        </p>
      )}
      <Button type="button" size="lg" disabled={submitting} onClick={onSubmit}>
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Creating account…
          </>
        ) : (
          "Create account"
        )}
      </Button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-3.5 py-2.5">
      <dt className="text-faint">{label}</dt>
      <dd className="text-ink text-end font-medium">{value || "—"}</dd>
    </div>
  );
}
