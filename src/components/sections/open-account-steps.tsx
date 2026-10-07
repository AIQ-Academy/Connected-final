"use client";

import { ArrowRight, BadgeCheck, CreditCard, LineChart, UserPlus } from "lucide-react";
import { useState } from "react";
import type { CSSProperties } from "react";

import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { useLocale } from "@/components/i18n/locale-provider";
import type { DictionaryKey } from "@/lib/i18n/dictionaries";
import { signupUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: UserPlus,
    accent: "#3d83b8",
    title: "home.steps.register.title",
    duration: "home.steps.register.duration",
    body: "home.steps.register.body",
    detail: ["home.steps.register.detail1", "home.steps.register.detail2", "home.steps.register.detail3"],
  },
  {
    icon: BadgeCheck,
    accent: "#07834f",
    title: "home.steps.verify.title",
    duration: "home.steps.verify.duration",
    body: "home.steps.verify.body",
    detail: ["home.steps.verify.detail1", "home.steps.verify.detail2", "home.steps.verify.detail3"],
  },
  {
    icon: CreditCard,
    accent: "#a87932",
    title: "home.steps.fund.title",
    duration: "home.steps.fund.duration",
    body: "home.steps.fund.body",
    detail: ["home.steps.fund.detail1", "home.steps.fund.detail2", "home.steps.fund.detail3"],
  },
  {
    icon: LineChart,
    accent: "#3156b8",
    title: "home.steps.trade.title",
    duration: "home.steps.trade.duration",
    body: "home.steps.trade.body",
    detail: ["home.steps.trade.detail1", "home.steps.trade.detail2", "home.steps.trade.detail3"],
  },
] as const;

export function OpenAccountSteps({ id = "open-account" }: { id?: string }) {
  const { t } = useLocale();
  const [active, setActive] = useState(0);
  const current = steps[active];

  return (
    <Section id={id} size="spacious" className="section-wash bg-bg scroll-mt-28 isolate">
      <Container>
        <SectionHeading
          eyebrow={t("home.steps.eyebrow")}
          title={t("home.steps.title")}
          lead={t("home.steps.lead")}
          align="center"
        />

        {/* Step rail — click or tab through; the panel below follows. */}
        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const isActive = index === active;
            return (
              <button
                key={step.title}
                type="button"
                data-step={index === 1 ? "verification" : undefined}
                onClick={() => setActive(index)}
                aria-pressed={isActive}
                style={{ "--step-accent": step.accent } as CSSProperties}
                className={cn(
                  "signup-step-card group relative overflow-hidden rounded-2xl border p-5 text-start transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2",
                  isActive ? "is-active -translate-y-0.5" : "hover:-translate-y-0.5",
                )}
              >
                {/* Progress hairline along the top of each step. */}
                <span
                  aria-hidden
                    className="signup-step-accent-line absolute inset-x-0 top-0 h-0.5 transition-colors duration-300"
                />
                <div className="flex items-center justify-between gap-3">
                  <span
                    className="signup-step-icon grid size-10 place-items-center rounded-xl border transition-colors"
                  >
                    <step.icon className="size-[18px]" />
                  </span>
                  <span
                    className={cn(
                      "readout text-2xl font-semibold transition-colors",
                      "signup-step-number",
                    )}
                  >
                    0{index + 1}
                  </span>
                </div>
                <p className="font-display text-ink mt-4 text-base font-semibold">
                  {t(step.title as DictionaryKey)}
                </p>
                <p className="text-faint mt-1 font-mono text-[0.625rem] tracking-[0.12em] uppercase">
                  {t(step.duration as DictionaryKey)}
                </p>
              </button>
            );
          })}
        </div>

        <Reveal key={active} direction="none" amount={0} className="mt-5">
          <div
            className="step-detail-surface surface grid gap-8 p-6 transition-colors duration-500 sm:p-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]"
            data-step={active === 1 ? "verification" : undefined}
            style={{ "--step-accent": current.accent } as CSSProperties}
          >
            <div>
              <p className="eyebrow">
                {t("home.steps.panelCount").replace("{step}", String(active + 1)).replace("{total}", String(steps.length))}
              </p>
              <h3 className="font-display text-ink mt-3 text-2xl font-semibold">
                {t(current.title as DictionaryKey)}
              </h3>
              <p className="text-muted mt-4 leading-relaxed">{t(current.body as DictionaryKey)}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink href={signupUrl} size="lg">
                  {t("home.steps.openAccount")}
                  <ArrowRight />
                </ButtonLink>
                <ButtonLink
                  href="/trading/how-it-works"
                  variant="outline"
                  size="lg"
                >
                  {t("home.steps.readDetail")}
                </ButtonLink>
              </div>
            </div>

            <ul className="border-line-soft space-y-px self-start rounded-2xl border p-1">
            {current.detail.map((item) => (
                <li
                  key={item}
                  className="border-line-soft text-muted flex gap-3 border-b px-4 py-3.5 text-sm leading-relaxed last:border-b-0"
                >
                  <span className="signup-step-bullet mt-[0.45rem] size-1.5 shrink-0 rounded-full" />
                  {t(item as DictionaryKey)}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
