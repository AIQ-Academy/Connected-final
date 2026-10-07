"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import { CheckboxField, SelectField, TextField } from "@/components/form/field";
import { ProgressBar } from "@/components/app/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { countries, experienceOptions } from "@/lib/countries";
import { formatCurrency, formatCompactCurrency, cn } from "@/lib/utils";
import { fieldErrors } from "@/lib/validation";
import { registrationStepSchemas } from "@/lib/validation/registration";

export type WizardTier = {
  id: string;
  code: string;
  name: string;
  accountSize: number;
  price: number;
  phase1TargetPct: number;
  phase2TargetPct: number;
  maxDailyDrawdownPct: number;
  maxOverallDrawdownPct: number;
  minTradingDays: number;
  profitSplitPct: number;
  payoutFrequency: string;
  maxLeverage: string;
  isFeatured: boolean;
};

type Values = {
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

const emptyValues: Values = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  country: "",
  experience: "",
  tierCode: "",
  acceptTerms: false,
  marketingOptIn: false,
};

const steps = [
  { title: "Your details", blurb: "How we reach you and secure the account." },
  { title: "Trading profile", blurb: "Residency and experience, for compliance." },
  { title: "Choose your account", blurb: "Capital, target and profit split." },
  { title: "Review & confirm", blurb: "Check everything, then we go live." },
] as const;

/** Which step owns which field, so a server-side error lands on the right screen. */
const fieldStep: Record<string, number> = {
  fullName: 0,
  email: 0,
  phone: 0,
  password: 0,
  confirmPassword: 0,
  country: 1,
  experience: 1,
  tierCode: 2,
  acceptTerms: 3,
  marketingOptIn: 3,
};

export function RegisterWizard({ tiers }: { tiers: WizardTier[] }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [values, setValues] = useState<Values>(() => ({
    ...emptyValues,
    tierCode: tiers.find((t) => t.isFeatured)?.code ?? tiers[0]?.code ?? "",
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ reference: string; tier: WizardTier | null } | null>(
    null,
  );

  const reduced = useReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const selectedTier = tiers.find((t) => t.code === values.tierCode) ?? null;

  const set = useCallback(<K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  }, []);

  // Move focus to the step heading so screen readers and keyboard users are
  // not stranded at the bottom of the previous step.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step, done]);

  function validateStep(index: number) {
    const result = registrationStepSchemas[index].safeParse(values);
    if (result.success) {
      setErrors({});
      return true;
    }
    const next = fieldErrors(result.error);
    setErrors(next);
    focusFirstError(next);
    return false;
  }

  function focusFirstError(map: Record<string, string>) {
    const first = Object.keys(map)[0];
    if (!first) return;
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(`[data-field="${first}"]`);
      el?.focus();
    });
  }

  function goNext() {
    if (!validateStep(step)) return;
    setFormError(null);
    setDirection(1);
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function goBack() {
    setFormError(null);
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function submit() {
    if (!validateStep(3)) return;

    setSubmitting(true);
    setFormError(null);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          password: values.password,
          country: values.country,
          experience: values.experience,
          tierCode: values.tierCode,
          acceptTerms: values.acceptTerms,
          marketingOptIn: values.marketingOptIn,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        reference?: string;
        message?: string;
        errors?: Record<string, string>;
      };

      if (response.ok) {
        setDone({ reference: payload.reference ?? "", tier: selectedTier });
        return;
      }

      if (payload.errors && Object.keys(payload.errors).length) {
        setErrors(payload.errors);
        const earliest = Math.min(
          ...Object.keys(payload.errors).map((key) => fieldStep[key] ?? 3),
        );
        setDirection(-1);
        setStep(earliest);
        setFormError(payload.message ?? "Check the highlighted fields and try again.");
        focusFirstError(payload.errors);
        return;
      }

      setFormError(
        payload.message ??
          "We could not create your account just now. Try again in a moment.",
      );
    } catch {
      setFormError(
        "We could not reach the server. Check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return <SuccessPanel email={values.email} tier={done.tier} headingRef={headingRef} />;
  }

  const slide = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, x: direction * 28 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: direction * -28 },
      };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start lg:gap-10">
      <div className="surface overflow-hidden">
        <StepRail step={step} />

        <form
          className="px-5 py-7 sm:px-8 sm:py-8"
          onSubmit={(event) => {
            event.preventDefault();
            if (step === steps.length - 1) void submit();
            else goNext();
          }}
        >
          <div className="mb-6">
            <p className="text-faint font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
              Step {step + 1} of {steps.length}
            </p>
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="font-display mt-2 text-[1.375rem] font-semibold tracking-[-0.02em] outline-none sm:text-[1.5rem]"
            >
              {steps[step].title}
            </h2>
            <p className="text-muted mt-1.5 text-sm">{steps[step].blurb}</p>
          </div>

          {formError && (
            <div
              role="alert"
              className="border-loss/40 bg-loss/10 text-loss mb-6 flex items-start gap-2.5 rounded-xl border px-4 py-3 text-[0.8125rem]"
            >
              <TriangleAlert className="mt-px size-4 shrink-0" aria-hidden="true" />
              <span>{formError}</span>
            </div>
          )}

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={slide.initial}
              animate={slide.animate}
              exit={slide.exit}
              transition={{ duration: reduced ? 0.15 : 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              {step === 0 && (
                <IdentityStep values={values} errors={errors} set={set} />
              )}
              {step === 1 && <ProfileStep values={values} errors={errors} set={set} />}
              {step === 2 && (
                <TierStep
                  tiers={tiers}
                  selected={values.tierCode}
                  error={errors.tierCode}
                  onSelect={(code) => set("tierCode", code)}
                />
              )}
              {step === 3 && (
                <ReviewStep
                  values={values}
                  tier={selectedTier}
                  errors={errors}
                  set={set}
                  onEdit={(target) => {
                    setDirection(-1);
                    setStep(target);
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>

          <div className="border-line-soft mt-8 flex items-center justify-between gap-3 border-t pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={goBack}
              disabled={step === 0 || submitting}
              className={cn(step === 0 && "invisible")}
            >
              <ArrowLeft />
              Back
            </Button>

            {step < steps.length - 1 ? (
              <Button type="submit" size="lg">
                Continue
                <ArrowRight />
              </Button>
            ) : (
              <Button type="submit" size="lg" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Creating your account
                  </>
                ) : (
                  <>
                    Create my account
                    <ArrowRight />
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>

      <OrderSummary tier={selectedTier} step={step} />
    </div>
  );
}

/* ---------------------------------------------------------------------- */

function StepRail({ step }: { step: number }) {
  return (
    <div className="border-line-soft bg-sunken/60 border-b px-5 py-4 sm:px-8">
      <ol className="flex items-center gap-2 sm:gap-3">
        {steps.map((entry, index) => {
          const state =
            index < step ? "complete" : index === step ? "current" : "upcoming";
          return (
            <li key={entry.title} className="flex min-w-0 flex-1 items-center gap-2.5">
              <span
                aria-hidden="true"
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full border font-mono text-[0.6875rem] transition-colors",
                  state === "complete" && "border-mint/50 bg-mint/15 text-mint",
                  state === "current" && "border-brand bg-brand text-white",
                  state === "upcoming" && "border-line text-faint",
                )}
              >
                {state === "complete" ? <Check className="size-3.5" /> : index + 1}
              </span>
              <span
                className={cn(
                  "hidden truncate text-[0.8125rem] sm:block",
                  state === "upcoming" ? "text-faint" : "text-ink font-medium",
                )}
              >
                {entry.title}
              </span>
              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "hidden h-px flex-1 sm:block",
                    index < step ? "bg-mint/50" : "bg-line",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
      <div className="mt-4 sm:hidden">
        <ProgressBar
          value={((step + 1) / steps.length) * 100}
          label={`Registration progress, step ${step + 1} of ${steps.length}`}
        />
      </div>
    </div>
  );
}

type StepProps = {
  values: Values;
  errors: Record<string, string>;
  set: <K extends keyof Values>(key: K, value: Values[K]) => void;
};

function IdentityStep({ values, errors, set }: StepProps) {
  const [visible, setVisible] = useState(false);
  const strength = passwordStrength(values.password);

  return (
    <div className="flex flex-col gap-5">
      <TextField
        label="Full legal name"
        required
        data-field="fullName"
        autoComplete="name"
        placeholder="As it appears on your ID"
        value={values.fullName}
        error={errors.fullName}
        onChange={(e) => set("fullName", e.target.value)}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Email address"
          required
          type="email"
          inputMode="email"
          data-field="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          error={errors.email}
          onChange={(e) => set("email", e.target.value)}
        />
        <TextField
          label="Phone number"
          required
          type="tel"
          inputMode="tel"
          data-field="phone"
          autoComplete="tel"
          placeholder="+971 50 000 0000"
          value={values.phone}
          error={errors.phone}
          onChange={(e) => set("phone", e.target.value)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <div className="relative">
            <TextField
              label="Password"
              required
              type={visible ? "text" : "password"}
              data-field="password"
              autoComplete="new-password"
              placeholder="At least 10 characters"
              value={values.password}
              error={errors.password}
              onChange={(e) => set("password", e.target.value)}
              className="[&_input]:pe-11"
            />
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? "Hide password" : "Show password"}
              className="text-faint hover:text-ink absolute top-[2.15rem] end-3 grid size-7 place-items-center rounded-md transition-colors"
            >
              {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {values.password.length > 0 && !errors.password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex flex-1 gap-1" aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      i < strength.score ? strength.color : "bg-line",
                    )}
                  />
                ))}
              </div>
              <span className="text-faint text-[0.75rem]">{strength.label}</span>
            </div>
          )}
        </div>

        <TextField
          label="Confirm password"
          required
          type={visible ? "text" : "password"}
          data-field="confirmPassword"
          autoComplete="new-password"
          placeholder="Type it once more"
          value={values.confirmPassword}
          error={errors.confirmPassword}
          onChange={(e) => set("confirmPassword", e.target.value)}
        />
      </div>

      <p className="text-faint flex items-start gap-2 text-[0.78125rem]">
        <ShieldCheck className="text-mint mt-px size-4 shrink-0" aria-hidden="true" />
        Your details are used to run KYC and to pay you. We never sell them, and we
        never place trades on your behalf.
      </p>
    </div>
  );
}

function ProfileStep({ values, errors, set }: StepProps) {
  return (
    <div className="flex flex-col gap-6">
      <SelectField
        label="Country of residence"
        required
        data-field="country"
        autoComplete="country-name"
        value={values.country}
        error={errors.country}
        hint="This determines which entity your funded account sits under."
        onChange={(e) => set("country", e.target.value)}
      >
        <option value="">Select a country</option>
        {countries.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </SelectField>

      <fieldset>
        <legend className="text-muted mb-3 text-[0.8125rem] font-medium">
          Trading experience <span className="text-brand-light">*</span>
        </legend>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {experienceOptions.map((option, index) => {
            const active = values.experience === option.value;
            return (
              <label
                key={option.value}
                className={cn(
                  "group relative flex cursor-pointer flex-col gap-1 rounded-xl border px-4 py-3.5 transition-colors",
                  active
                    ? "border-brand bg-brand-dim/35"
                    : "border-line hover:border-brand-light/60 hover:bg-sunken",
                )}
              >
                <input
                  type="radio"
                  name="experience"
                  value={option.value}
                  data-field={index === 0 ? "experience" : undefined}
                  checked={active}
                  onChange={() => set("experience", option.value)}
                  className="sr-only"
                />
                <span className="flex items-center justify-between gap-2 text-[0.875rem] font-medium">
                  {option.label}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid size-4 shrink-0 place-items-center rounded-full border",
                      active ? "border-brand bg-brand" : "border-line",
                    )}
                  >
                    {active && <Check className="size-2.5 text-white" />}
                  </span>
                </span>
                <span className="text-faint text-[0.78125rem]">{option.hint}</span>
              </label>
            );
          })}
        </div>
        {errors.experience && (
          <p className="text-loss mt-2 text-[0.78125rem]" role="alert">
            {errors.experience}
          </p>
        )}
      </fieldset>
    </div>
  );
}

function TierStep({
  tiers,
  selected,
  error,
  onSelect,
}: {
  tiers: WizardTier[];
  selected: string;
  error?: string;
  onSelect: (code: string) => void;
}) {
  if (!tiers.length) {
    return (
      <p className="text-muted text-sm">
        Account tiers are temporarily unavailable. Contact support and we will set
        your evaluation up manually.
      </p>
    );
  }

  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Account size"
        className="flex flex-col gap-3"
      >
        {tiers.map((tier, index) => {
          const active = selected === tier.code;
          return (
            <label
              key={tier.code}
              className={cn(
                "relative flex cursor-pointer flex-col gap-4 rounded-[var(--radius-md)] border p-4 transition-[border-color,background-color] sm:flex-row sm:items-center sm:gap-5",
                active
                  ? "border-brand bg-brand-dim/30"
                  : "border-line hover:border-brand-light/60 hover:bg-sunken",
              )}
            >
              <input
                type="radio"
                name="tierCode"
                value={tier.code}
                data-field={index === 0 ? "tierCode" : undefined}
                checked={active}
                onChange={() => onSelect(tier.code)}
                className="sr-only"
              />

              <span className="flex min-w-0 flex-1 items-center gap-4">
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-full border",
                    active ? "border-brand bg-brand" : "border-line",
                  )}
                >
                  {active && <Check className="size-3 text-white" />}
                </span>
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-[1.0625rem] font-semibold">
                      {formatCompactCurrency(tier.accountSize)} {tier.name}
                    </span>
                    {tier.isFeatured && <Badge tone="brand">Most chosen</Badge>}
                  </span>
                  <span className="text-muted mt-1 block text-[0.8125rem]">
                    {tier.phase1TargetPct}% then {tier.phase2TargetPct}% target ·{" "}
                    {tier.maxDailyDrawdownPct}% daily / {tier.maxOverallDrawdownPct}%
                    overall drawdown · {tier.profitSplitPct}% split
                  </span>
                </span>
              </span>

              <span className="shrink-0 text-start sm:text-end">
                <span className="font-display tabular block text-[1.25rem] leading-none font-semibold">
                  {formatCurrency(tier.price)}
                </span>
                <span className="text-faint text-[0.75rem]">
                  one-off · refunded on first payout
                </span>
              </span>
            </label>
          );
        })}
      </div>

      {error && (
        <p className="text-loss mt-3 text-[0.78125rem]" role="alert">
          {error}
        </p>
      )}

      <p className="text-faint mt-4 text-[0.78125rem]">
        Every tier trades the same instruments on MT5, cTrader or the Web Terminal,
        with no time limit on either evaluation phase.
      </p>
    </div>
  );
}

function ReviewStep({
  values,
  tier,
  errors,
  set,
  onEdit,
}: StepProps & { tier: WizardTier | null; onEdit: (step: number) => void }) {
  const experience = experienceOptions.find((o) => o.value === values.experience);

  const rows: { label: string; value: string; step: number }[] = [
    { label: "Name", value: values.fullName, step: 0 },
    { label: "Email", value: values.email, step: 0 },
    { label: "Phone", value: values.phone, step: 0 },
    { label: "Country", value: values.country, step: 1 },
    { label: "Experience", value: experience?.label ?? "—", step: 1 },
    {
      label: "Account",
      value: tier
        ? `${formatCompactCurrency(tier.accountSize)} ${tier.name} — ${formatCurrency(tier.price)}`
        : "—",
      step: 2,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <dl className="border-line-soft divide-line-soft divide-y overflow-hidden rounded-[var(--radius-md)] border">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 px-4 py-3"
          >
            <dt className="text-faint shrink-0 text-[0.78125rem]">{row.label}</dt>
            <dd className="flex min-w-0 items-center gap-3">
              <span className="truncate text-[0.875rem]">{row.value}</span>
              <button
                type="button"
                onClick={() => onEdit(row.step)}
                className="text-brand-light shrink-0 text-[0.75rem] underline-offset-4 hover:underline"
              >
                Edit
                <span className="sr-only"> {row.label}</span>
              </button>
            </dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-col gap-4">
        <CheckboxField
          data-field="acceptTerms"
          checked={values.acceptTerms}
          error={errors.acceptTerms}
          onChange={(e) => set("acceptTerms", e.target.checked)}
          label={
            <>
              I have read and accept the{" "}
              <Link href="/legal/terms" className="text-brand-light hover:underline">
                Terms &amp; Conditions
              </Link>
              ,{" "}
              <Link href="/legal/privacy" className="text-brand-light hover:underline">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link
                href="/legal/risk-disclosure"
                className="text-brand-light hover:underline"
              >
                Risk Disclosure
              </Link>
              . I understand that trading carries a significant risk of loss.
            </>
          }
        />
        <CheckboxField
          checked={values.marketingOptIn}
          onChange={(e) => set("marketingOptIn", e.target.checked)}
          label="Send me the desk's weekly market note and payout updates. You can unsubscribe at any time."
        />
      </div>
    </div>
  );
}

function OrderSummary({ tier, step }: { tier: WizardTier | null; step: number }) {
  return (
    <aside className="surface lg:sticky lg:top-28">
      <div className="border-line-soft border-b px-5 py-4">
        <p className="font-display text-[0.9375rem] font-semibold">
          {tier ? "Your evaluation" : "Choose an account"}
        </p>
      </div>
      <div className="flex flex-col gap-4 px-5 py-5">
        {tier ? (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-muted text-[0.8125rem]">Account size</span>
              <span className="font-display tabular text-[1.25rem] font-semibold">
                {formatCurrency(tier.accountSize)}
              </span>
            </div>
            <dl className="text-[0.8125rem]">
              {[
                ["Phase 1 target", `${tier.phase1TargetPct}%`],
                ["Phase 2 target", `${tier.phase2TargetPct}%`],
                ["Max daily drawdown", `${tier.maxDailyDrawdownPct}%`],
                ["Max overall drawdown", `${tier.maxOverallDrawdownPct}%`],
                ["Minimum trading days", `${tier.minTradingDays}`],
                ["Profit split", `${tier.profitSplitPct}%`],
                ["Payout cycle", tier.payoutFrequency],
                ["Max leverage", tier.maxLeverage],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="border-line-soft flex items-center justify-between gap-3 border-b py-2 last:border-0"
                >
                  <dt className="text-faint">{label}</dt>
                  <dd className="tabular font-medium">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="border-line-soft flex items-baseline justify-between gap-3 border-t pt-4">
              <span className="text-[0.8125rem] font-medium">Due today</span>
              <span className="font-display tabular text-[1.375rem] font-semibold">
                {formatCurrency(tier.price)}
              </span>
            </div>
            <p className="text-faint text-[0.75rem]">
              The fee is refunded in full with your first payout. Payment is collected
              after your account is created, from the client portal.
            </p>
          </>
        ) : (
          <p className="text-muted text-[0.8125rem]">
            Pick an account at step three and the full rule set for that tier appears
            here before you commit.
          </p>
        )}

        <div className="border-line-soft mt-1 border-t pt-4">
          <ul className="text-muted flex flex-col gap-2 text-[0.78125rem]">
            {[
              "No time limit on either evaluation phase",
              "Weekend and news holding allowed on every tier",
              "Expert advisors and algorithmic execution permitted",
            ].map((point) => (
              <li key={point} className="flex items-start gap-2">
                <Check className="text-mint mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-faint text-[0.75rem]" aria-live="polite">
          {step < 3
            ? "Nothing is submitted until you confirm at step four."
            : "One click away. We create the account immediately."}
        </p>
      </div>
    </aside>
  );
}

function SuccessPanel({
  email,
  tier,
  headingRef,
}: {
  email: string;
  tier: WizardTier | null;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="surface mx-auto max-w-2xl overflow-hidden text-center"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="from-brand/15 relative bg-gradient-to-b to-transparent px-6 pt-12 pb-8">
        <motion.span
          className="border-mint/40 bg-mint/12 relative mx-auto grid size-16 place-items-center rounded-full border"
          initial={reduced ? {} : { scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <Check className="text-mint size-8" aria-hidden="true" />
          <span className="border-mint/30 absolute inset-0 animate-ping rounded-full border" />
        </motion.span>

        <h2
          ref={headingRef}
          tabIndex={-1}
          className="font-display mt-6 text-[1.75rem] font-semibold tracking-[-0.02em] outline-none"
        >
          Your account is live
        </h2>
        <p className="text-muted mx-auto mt-3 max-w-md text-[0.9375rem]">
          We have created your Connect Funded profile
          {tier ? (
            <>
              {" "}
              and reserved a {formatCompactCurrency(tier.accountSize)} {tier.name}{" "}
              evaluation
            </>
          ) : null}
          . A confirmation is on its way to{" "}
          <span className="text-ink font-medium">{email}</span>.
        </p>
      </div>

      <div className="border-line-soft border-t px-6 py-7 text-start">
        <p className="eyebrow mb-4">
          <span className="chev" />
          What happens next
        </p>
        <ol className="flex flex-col gap-4">
          {[
            {
              title: "Sign in to the client portal",
              body: "Your dashboard, KYC upload and payout tools are all in one place.",
            },
            {
              title: "Settle the evaluation fee",
              body: "Card, bank transfer, e-wallet or crypto. Card and crypto activate instantly.",
            },
            {
              title: "Receive your platform credentials",
              body: "MetaTrader 5, cTrader and the Web Terminal all connect to the same account.",
            },
          ].map((item, index) => (
            <li key={item.title} className="flex gap-3.5">
              <span className="border-brand/40 bg-brand/10 text-brand-light grid size-7 shrink-0 place-items-center rounded-full border font-mono text-[0.6875rem]">
                {index + 1}
              </span>
              <span>
                <span className="block text-[0.875rem] font-medium">{item.title}</span>
                <span className="text-muted block text-[0.8125rem]">{item.body}</span>
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/portal/login" size="lg" className="flex-1">
            Go to the client portal
            <ArrowRight />
          </ButtonLink>
          <ButtonLink href="/faq" variant="soft" size="lg" className="flex-1">
            Read the rulebook
          </ButtonLink>
        </div>
      </div>
    </motion.div>
  );
}

function passwordStrength(password: string) {
  let score = 0;
  if (password.length >= 10) score += 1;
  if (password.length >= 14) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;

  const scale = [
    { label: "Weak", color: "bg-loss" },
    { label: "Fair", color: "bg-amber" },
    { label: "Good", color: "bg-amber" },
    { label: "Strong", color: "bg-mint" },
    { label: "Excellent", color: "bg-mint" },
  ];

  return { score, ...scale[score] };
}
