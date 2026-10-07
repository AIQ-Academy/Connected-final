"use client";

import { AlertTriangle, CheckCircle2, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useId, useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/locale-provider";
import type { DictionaryKey } from "@/lib/i18n/dictionaries";

const topics = ["support", "sales", "partnerships", "careers", "general"] as const;

type Topic = (typeof topics)[number];
const topicTranslationKeys: Record<Topic, DictionaryKey> = {
  support: "contact.accountSupport",
  sales: "contact.fundingPricing",
  partnerships: "contact.partnerships",
  careers: "contact.careers",
  general: "contact.other",
};
type FieldName = "fullName" | "email" | "topic" | "message";
type Status = "idle" | "submitting" | "success" | "error";

const MESSAGE_MIN = 20;
const MESSAGE_MAX = 4000;

/** Deliberately permissive: the server is the authority on deliverability. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const controlBase =
  "border-line bg-raised text-ink placeholder:text-faint w-full border px-4 text-[0.9375rem] outline-none transition-[border-color,box-shadow] duration-200 focus:border-brand-light focus:shadow-[0_0_0_3px_rgb(var(--cf-brand-glow)/0.16)] disabled:opacity-60";

/** Single-line controls are pills — the radius is half their fixed height. */
const singleLineControl = `${controlBase} rounded-full`;
/**
 * The message box grows past twice the corner radius, so its corners are real
 * corners and must stay a fixed size rather than follow the pill.
 */
const multiLineControl = `${controlBase} rounded-xl`;

type Values = Record<FieldName, string> & { company: string };

const emptyValues: Values = {
  fullName: "",
  email: "",
  topic: "",
  message: "",
  company: "",
};

export function ContactForm({ defaultTopic }: { defaultTopic?: Topic }) {
  const { t, formatNumber, direction } = useLocale();
  const [values, setValues] = useState<Values>(() => ({
    ...emptyValues,
    topic: defaultTopic ?? "",
  }));
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [notice, setNotice] = useState("");

  const uid = useId();
  const fieldRefs = useRef<Partial<Record<FieldName, HTMLElement | null>>>({});

  const idFor = (field: FieldName) => `${uid}-${field}`;
  const describedBy = (field: FieldName) => `${uid}-${field}-desc`;

  function setValue(field: FieldName, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  }

  function validate(input: Values) {
    const next: Partial<Record<FieldName, string>> = {};

    if (input.fullName.trim().length < 2) {
      next.fullName = t("contact.nameError");
    }
    if (!EMAIL_PATTERN.test(input.email.trim())) {
      next.email = t("contact.emailError");
    }
    if (!input.topic) {
      next.topic = t("contact.topicError");
    }

    const message = input.message.trim();
    if (message.length < MESSAGE_MIN) {
      next.message = t("contact.messageMinError").replace("{count}", formatNumber(MESSAGE_MIN));
    } else if (message.length > MESSAGE_MAX) {
      next.message = t("contact.messageMaxError").replace("{count}", formatNumber(MESSAGE_MAX));
    }

    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const found = validate(values);
    if (Object.keys(found).length) {
      setErrors(found);
      setStatus("error");
      setNotice(t("contact.validationNotice"));
      const first = (Object.keys(found) as FieldName[])[0];
      fieldRefs.current[first]?.focus();
      return;
    }

    setErrors({});
    setStatus("submitting");
    setNotice(t("contact.sending"));

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fullName: values.fullName.trim(),
          email: values.email.trim(),
          topic: values.topic,
          message: values.message.trim(),
          company: values.company,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        message?: string;
        errors?: Record<string, string>;
      } | null;

      if (!response.ok) {
        if (payload?.errors) {
          const mapped: Partial<Record<FieldName, string>> = {};
          for (const field of ["fullName", "email", "topic", "message"] as const) {
            const serverError = payload.errors[field];
            if (serverError) mapped[field] = serverError;
          }
          setErrors(mapped);
          const first = (Object.keys(mapped) as FieldName[])[0];
          if (first) fieldRefs.current[first]?.focus();
        }
        setStatus("error");
        setNotice(
          t("contact.sendError"),
        );
        return;
      }

      setStatus("success");
      setNotice(
        t("contact.success"),
      );
      setValues({ ...emptyValues, topic: defaultTopic ?? "" });
    } catch {
      setStatus("error");
      setNotice(
        t("contact.networkError"),
      );
    }
  }

  const submitting = status === "submitting";
  const remaining = MESSAGE_MAX - values.message.length;

  return (
    <form onSubmit={handleSubmit} noValidate className="relative flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={idFor("fullName")}
            className="text-muted text-[0.8125rem] font-medium"
          >
            {t("contact.fullName")} <RequiredMark />
          </label>
          <input
            id={idFor("fullName")}
            ref={(node) => {
              fieldRefs.current.fullName = node;
            }}
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Jordan Malik"
            value={values.fullName}
            onChange={(event) => setValue("fullName", event.target.value)}
            disabled={submitting}
            aria-required="true"
            aria-invalid={errors.fullName ? true : undefined}
            aria-describedby={errors.fullName ? describedBy("fullName") : undefined}
            className={cn(
              singleLineControl,
              "h-12",
              errors.fullName && "border-loss/70",
            )}
          />
          <FieldError id={describedBy("fullName")} message={errors.fullName} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={idFor("email")}
            className="text-muted text-[0.8125rem] font-medium"
          >
            {t("forms.email.label")} <RequiredMark />
          </label>
          <input
            id={idFor("email")}
            ref={(node) => {
              fieldRefs.current.email = node;
            }}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={values.email}
            onChange={(event) => setValue("email", event.target.value)}
            disabled={submitting}
            aria-required="true"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? describedBy("email") : undefined}
            className={cn(singleLineControl, "h-12", errors.email && "border-loss/70")}
          />
          <FieldError id={describedBy("email")} message={errors.email} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={idFor("topic")}
          className="text-muted text-[0.8125rem] font-medium"
        >
          {t("contact.topic")} <RequiredMark />
        </label>
        <select
          id={idFor("topic")}
          ref={(node) => {
            fieldRefs.current.topic = node;
          }}
          name="topic"
          value={values.topic}
          onChange={(event) => setValue("topic", event.target.value)}
          disabled={submitting}
          aria-required="true"
          aria-invalid={errors.topic ? true : undefined}
          aria-describedby={errors.topic ? describedBy("topic") : undefined}
          className={cn(
            singleLineControl,
            "h-12 appearance-none bg-[length:1rem] bg-no-repeat pe-10",
            errors.topic && "border-loss/70",
          )}
          style={{
            backgroundPosition: direction === "rtl" ? "left 1rem center" : "right 1rem center",
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23878da8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          }}
        >
          <option value="" disabled>
            {t("contact.chooseTopic")}
          </option>
          {topics.map((topic) => (
            <option key={topic} value={topic}>
              {t(topicTranslationKeys[topic])}
            </option>
          ))}
        </select>
        <FieldError id={describedBy("topic")} message={errors.topic} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={idFor("message")}
          className="text-muted text-[0.8125rem] font-medium"
        >
          {t("contact.message")} <RequiredMark />
        </label>
        <textarea
          id={idFor("message")}
          ref={(node) => {
            fieldRefs.current.message = node;
          }}
          name="message"
          rows={6}
          placeholder={t("contact.messagePlaceholder")}
          value={values.message}
          onChange={(event) => setValue("message", event.target.value)}
          disabled={submitting}
          maxLength={MESSAGE_MAX}
          aria-required="true"
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={
            errors.message ? describedBy("message") : `${uid}-message-hint`
          }
          className={cn(
            multiLineControl,
            "min-h-36 resize-y py-3 leading-relaxed",
            errors.message && "border-loss/70",
          )}
        />
        {errors.message ? (
          <FieldError id={describedBy("message")} message={errors.message} />
        ) : (
          <p id={`${uid}-message-hint`} className="text-faint text-[0.78125rem]">
            {formatNumber(MESSAGE_MIN)} {t("contact.charactersMinimum")} {formatNumber(remaining)} {t("contact.remaining")}
          </p>
        )}
      </div>

      {/* Honeypot. Real people never see it, and bots that fill it are accepted
          silently by the API so they learn nothing. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${uid}-company`}>{t("contact.company")}</label>
        <input
          id={`${uid}-company`}
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.company}
          onChange={(event) =>
            setValues((current) => ({ ...current, company: event.target.value }))
          }
        />
      </div>

      <Button type="submit" size="lg" block disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" />
            {t("contact.submitting")}
          </>
        ) : (
          <>
            <Send aria-hidden="true" />
            {t("contact.submit")}
          </>
        )}
      </Button>

      <div role="status" aria-live="polite" className="min-h-6">
        {notice && status !== "idle" && (
          <p
            className={cn(
              "flex items-start gap-2 rounded-xl border px-4 py-3 text-[0.8125rem] leading-relaxed",
              status === "success" && "border-mint/35 bg-mint/10 text-mint",
              status === "error" && "border-loss/35 bg-loss/10 text-loss",
              status === "submitting" && "border-line text-muted",
            )}
          >
            {status === "success" && (
              <CheckCircle2 className="mt-px size-4 shrink-0" aria-hidden="true" />
            )}
            {status === "error" && (
              <AlertTriangle className="mt-px size-4 shrink-0" aria-hidden="true" />
            )}
            {status === "submitting" && (
              <Loader2 className="mt-px size-4 shrink-0 animate-spin" aria-hidden="true" />
            )}
            {notice}
          </p>
        )}
      </div>

      <p className="text-faint text-[0.78125rem] leading-relaxed">
        {t("contact.privacyBody")}{" "}
        <Link
          href="/legal/privacy"
          className="text-brand-light font-medium hover:underline"
        >
          {t("contact.privacyPolicy")}
        </Link>{" "}
        {" "}{t("contact.privacyRetention")}
      </p>
    </form>
  );
}

function RequiredMark() {
  return (
    <span className="text-brand-light" aria-hidden="true">
      *
    </span>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-loss flex items-start gap-1.5 text-[0.78125rem]">
      <AlertTriangle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}
