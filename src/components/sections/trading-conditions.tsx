"use client";

import {
  ArrowRight,
} from "lucide-react";

import { Counter } from "@/components/motion/counter";
import { Reveal } from "@/components/motion/reveal";
import { GridBackdrop } from "@/components/ui/aurora";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { useLocale } from "@/components/i18n/locale-provider";

/**
 * The commercial terms, stated as numbers. Every figure here is also published
 * per-symbol on `/trading/conditions` — this section is the summary, not the
 * source of truth.
 */
const metrics: {
  value: number;
  decimals: number;
  suffix: string;
  label: string;
  detail: string;
  displayValue?: string;
}[] = [
  {
    value: 0,
    decimals: 0,
    suffix: "",
    label: "",
    detail: "",
    displayValue: "Tight Spread",
  },
  {
    value: 0,
    decimals: 0,
    suffix: "%",
    label: "Commission",
    detail: "",
  },
  {
    value: 0,
    decimals: 0,
    suffix: "",
    label: "Median execution",
    detail: "",
    displayValue: "Instant",
  },
  {
    value: 0,
    decimals: 0,
    suffix: "",
    label: "Fill rate",
    detail: "",
    displayValue: "Instant",
  },
] as const;

export function TradingConditionsSection({
  id = "conditions",
}: {
  id?: string;
}) {
  const { t } = useLocale();
  return (
    <Section
      id={id}
      size="spacious"
      className="section-wash bg-sunken scroll-mt-28 isolate overflow-hidden"
    >
      <GridBackdrop className="opacity-60" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgb(var(--cf-brand-glow)/0.16),transparent_65%)]"
      />

      <Container className="relative">
        <SectionHeading
          eyebrow={t("home.conditions.eyebrow")}
          title={t("home.conditions.title")}
          lead={t("home.conditions.lead")}
          action={
            <ButtonLink href="/trading/accounts" variant="soft" size="lg">
              {t("home.conditions.choose")}
              <ArrowRight />
            </ButtonLink>
          }
        />

        <Reveal delay={0.06}>
          <dl className="border-line bg-line mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border lg:grid-cols-4">
            {metrics.map((metric, index) => (
              <div
                key={metric.label}
                className="widget-wash bg-panel group px-5 py-7 transition-colors duration-300 hover:bg-raised sm:px-7 sm:py-9"
              >
                {metric.label ? (
                  <dt className="text-faint font-mono text-[0.625rem] tracking-[0.14em] uppercase">
                    {index === 1 ? t("home.conditions.commission") : index === 2 ? t("home.conditions.execution") : t("home.conditions.fill")}
                  </dt>
                ) : null}
                <dd className={`font-display readout text-ink mt-3 font-semibold ${metric.label ? "text-3xl sm:text-[2.5rem]" : "text-2xl sm:text-[2rem]"}`}>
                  {index === 0 ? t("home.accounts.tightSpread") : metric.displayValue ?? <Counter
                    to={metric.value}
                    decimals={metric.decimals}
                    suffix={metric.suffix}
                  />}
                </dd>
                {metric.detail ? (
                  <p className="text-muted mt-3 text-[0.8125rem] leading-relaxed">
                    {metric.detail}
                  </p>
                ) : null}
              </div>
            ))}
          </dl>
        </Reveal>

      </Container>
    </Section>
  );
}
