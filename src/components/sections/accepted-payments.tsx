"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { GridBackdrop } from "@/components/ui/aurora";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { useLocale } from "@/components/i18n/locale-provider";
import type { DictionaryKey } from "@/lib/i18n/dictionaries";

/**
 * Headline rails on the home page. Processing details live on /payments so
 * this stays a quick visual summary rather than a second copy of that page.
 */
const rails = [
  { name: "Visa", image: "/images/payments/visa.jpeg", timingKey: "home.payments.instant", instant: true, color: "#2857a5" },
  { name: "Mastercard", image: "/images/payments/mastercard.jpeg", timingKey: "home.payments.instant", instant: true, color: "#a83e43" },
  { name: "Bank transfer", image: "/images/payments/bank-transfer.png", timingKey: "home.payments.bankTiming", instant: false, color: "#526b91" },
  { name: "USDT", image: "/images/payments/usdt.jpeg", timingKey: "home.payments.instant", instant: true, color: "#18816f" },
  { name: "Bitcoin", image: "/images/payments/bitcoin.jpeg", timingKey: "home.payments.confirmations", instant: false, color: "#b66b2b" },
  { name: "OMT", image: "/images/payments/omt.jpeg", timingKey: "home.payments.instant", instant: true, color: "#a94238" },
  { name: "BOB Finance", image: "/images/payments/bob-finance.jpeg", timingKey: "home.payments.instant", instant: true, color: "#bd702b" },
  { name: "Whish Money", image: "/images/payments/whish-money.jpeg", timingKey: "home.payments.instant", instant: true, color: "#75449a" },
];

export function AcceptedPaymentsSection() {
  const { t } = useLocale();
  return (
    <Section
      id="accepted-payments"
      size="spacious"
      className="section-wash border-line-soft bg-sunken/50 overflow-hidden border-y"
    >
      <GridBackdrop className="opacity-50" />

      <Container className="relative">
        <SectionHeading
          eyebrow={t("home.payments.eyebrow")}
          title={t("home.payments.title")}
          lead={t("home.payments.lead")}
          action={
            <ButtonLink href="/payments" variant="outline">
              {t("home.payments.processingTimes")}
              <ArrowRight />
            </ButtonLink>
          }
        />

        <div className="relative mt-12 sm:mt-16 lg:mt-20">
          <p className="text-faint mb-3 font-mono text-[0.625rem] tracking-[0.14em] uppercase sm:hidden">
            {t("home.payments.swipe")}
          </p>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 start-0 z-10 w-10 bg-gradient-to-r from-[color-mix(in_oklab,var(--cf-bg-sunken)_92%,transparent)] to-transparent rtl:bg-gradient-to-l sm:hidden"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 end-0 z-10 w-10 bg-gradient-to-l from-[color-mix(in_oklab,var(--cf-bg-sunken)_92%,transparent)] to-transparent rtl:bg-gradient-to-r sm:hidden"
          />

          <StaggerGroup
            role="list"
            className="mobile-snap-rail gap-4 sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-4"
          >
            {rails.map((rail) => (
              <StaggerItem
                role="listitem"
                aria-label={rail.name}
                key={rail.name}
                className="mobile-snap-card group flex w-[13rem] flex-col rounded-3xl border border-white/20 p-4 text-white shadow-[0_16px_36px_rgb(0_0_0/0.16)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_44px_rgb(0_0_0/0.24)] sm:w-auto sm:p-4 lg:p-5"
                style={{ background: `linear-gradient(145deg, color-mix(in srgb, ${rail.color} 95%, white 5%), color-mix(in srgb, ${rail.color} 60%, #101a2b))` }}
              >
                <span className="relative grid h-32 w-full place-items-center overflow-hidden rounded-2xl border border-slate-900/10 bg-white p-2.5 shadow-[0_8px_22px_rgb(8_20_38/0.14)] transition-transform duration-300 group-hover:scale-[1.025] sm:h-36 sm:p-3">
                  <Image src={rail.image} alt={`${rail.name} payment method`} width={240} height={160} sizes="(min-width: 1024px) 240px, (min-width: 640px) 220px, 200px" className="h-full w-full object-contain" />
                </span>
                <div className="mt-4 flex min-h-11 items-center justify-between gap-2">
                  <span className="text-sm font-semibold leading-tight text-white">{rail.name}</span>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-black/10 px-2 py-1 font-mono text-[0.55rem] tracking-wide text-white/85">
                    <span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_rgb(110_231_183/0.75)]" />
                    {t(rail.timingKey as DictionaryKey)}
                  </span>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>

        <p className="text-muted mt-8 max-w-2xl text-sm leading-relaxed">
          {t("home.payments.finePrint")}
        </p>
      </Container>
    </Section>
  );
}
