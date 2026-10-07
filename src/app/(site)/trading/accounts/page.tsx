import type { Metadata } from "next";
import {
  ArrowRight,
  Check,
  Gauge,
  Layers3,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { BrokerAccountCard } from "@/components/sections/broker-account-types";
import { Aurora, GridBackdrop } from "@/components/ui/aurora";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Table, TableShell, Td, Th, Tr } from "@/components/ui/data-table";
import { brokerAccountTiers } from "@/lib/landing/broker";
import { guardProduct } from "@/lib/product-guard";
import { signupUrl } from "@/lib/site";
import { formatCurrency } from "@/lib/utils";
import { getServerLocale } from "@/lib/i18n/server";
import { routeCopy } from "@/lib/i18n/route-copy";

export const metadata: Metadata = {
  title: "Live Trading Account Types",
  description:
    "Compare Standard, Pro and VIP live trading accounts — minimum deposits and included benefits — then open the account that matches your volume.",
};

const heroStats = [
  { value: "From $100", label: "Minimum deposit" },
  { value: "$1,000", label: "Pro from" },
  { value: "$50,000", label: "VIP from" },
  { value: "No split", label: "Keep 100% of profit" },
] as const;

const guidance = [
  {
    icon: Sparkles,
    title: "Getting started",
    body: "Standard keeps spreads predictable and commission at zero. Ideal when you want a live book without managing lot-based fees.",
    tier: "Standard",
  },
  {
    icon: Gauge,
    title: "Active discretionary trader",
    body: "Pro tightens the spread profile while keeping commission-free execution — the usual step once your size and frequency grow.",
    tier: "Pro",
  },
  {
    icon: Zap,
    title: "High-volume or systematic",
    body: "VIP from $50,000 — super-tight spreads, institutional liquidity, a personal trading advisor and custom solutions.",
    tier: "VIP",
  },
] as const;

const shared = [
  "MetaTrader 5 and Web Terminal on every account type",
  "Segregated client funds and tier-1 liquidity routing",
  "Cards, bank transfer, e-wallets and stablecoins",
  "Withdrawals reviewed within 24 hours on open market days",
] as const;

export default async function TradingAccountsPage() {
  await guardProduct("broker");
  const locale = await getServerLocale();
  const t = (key: Parameters<typeof routeCopy>[1]) => routeCopy(locale, key);
  const stats = locale === "en" ? heroStats : locale === "fr"
    ? [{ value: "Dès 100 $", label: t("accounts.minimum") }, { value: "1 000 $", label: t("accounts.proFrom") }, { value: "50 000 $", label: t("accounts.vipFrom") }, { value: t("accounts.noSplit"), label: t("accounts.keepProfit") }]
    : [{ value: "ابتداءً من 100 $", label: t("accounts.minimum") }, { value: "1,000 $", label: t("accounts.proFrom") }, { value: "50,000 $", label: t("accounts.vipFrom") }, { value: t("accounts.noSplit"), label: t("accounts.keepProfit") }];
  const guidanceCopy = locale === "en" ? guidance : locale === "fr"
    ? [{ ...guidance[0], title: "Bien débuter", body: "Standard offre des spreads prévisibles sans commission. Un bon choix pour un compte réel sans frais calculés par lot." }, { ...guidance[1], title: "Trader actif", body: "Pro réduit les spreads tout en conservant une exécution sans commission : une formule adaptée lorsque votre volume et votre fréquence augmentent." }, { ...guidance[2], title: "Volume élevé ou systématique", body: "VIP dès 50 000 $ : spreads très serrés, liquidité institutionnelle, conseiller dédié et solutions personnalisées." }]
    : [{ ...guidance[0], title: "للبداية", body: "يوفر Standard سبريدًا واضحًا من دون عمولة، وهو مناسب للتداول المباشر من دون متابعة رسوم اللوت." }, { ...guidance[1], title: "للمتداول النشط", body: "يخفض Pro السبريد مع تنفيذ بلا عمولة، وهو خيار مناسب عند زيادة حجم التداول وتكراره." }, { ...guidance[2], title: "لأحجام التداول الكبيرة أو الآلية", body: "VIP ابتداءً من 50,000 دولار، مع سبريد فائق الضيق وسيولة مؤسسية ومستشار تداول شخصي وحلول مخصصة." }];
  const sharedCopy = locale === "en" ? shared : locale === "fr"
    ? ["MetaTrader 5 et Web Terminal pour chaque compte", "Fonds des clients ségrégués et acheminement vers une liquidité de premier rang", "Cartes, virements, portefeuilles électroniques et stablecoins", "Retraits examinés sous 24 heures pendant les jours de marché"]
    : ["MetaTrader 5 وWeb Terminal لجميع أنواع الحسابات", "أموال العملاء مفصولة وتوجيه إلى سيولة من المستوى الأول", "بطاقات وتحويلات مصرفية ومحافظ إلكترونية وعملات مستقرة", "مراجعة طلبات السحب خلال 24 ساعة في أيام فتح الأسواق"];

  return (
    <>
      <PageHero locale={locale} stats={stats} />

      <Section id="tiers" className="pt-4 sm:pt-6 lg:pt-8">
        <Container>
          <SectionHeading
            eyebrow={t("accounts.headingEyebrow")}
            title={t("accounts.heading")}
            lead={t("accounts.headingLead")}
          />

          <StaggerGroup className="mt-12 grid items-stretch gap-5 lg:grid-cols-3">
            {brokerAccountTiers.map((tier) => (
              <StaggerItem
                key={tier.code}
                preset="card"
                delay={tier.isFeatured ? 0.3 : 0}
                className="h-full"
              >
                <BrokerAccountCard tier={tier} />
              </StaggerItem>
            ))}
          </StaggerGroup>

          <Reveal className="border-line-soft bg-panel mt-10 rounded-3xl border p-6 sm:p-8">
            <div className="flex items-center gap-2.5">
              <Layers3 className="text-brand-light size-4" aria-hidden />
              <h3 className="text-ink font-display text-base font-semibold">
                {t("accounts.shared")}
              </h3>
            </div>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {sharedCopy.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <Check
                    className="text-mint mt-0.5 size-3.5 shrink-0"
                    aria-hidden
                  />
                  <span className="text-muted text-sm leading-snug">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </Section>

      <Section id="compare" className="border-line-soft bg-raised/40 border-y">
        <Container>
          <SectionHeading
            eyebrow={t("accounts.sideBySide")}
            title={t("accounts.tableTitle")}
            lead={t("accounts.tableLead")}
          />
          <Reveal className="mt-12">
            <TableShell>
              <Table>
                <thead>
                  <Tr>
                    <Th>{t("accounts.account")}</Th>
                    <Th>{t("accounts.minDeposit")}</Th>
                    <Th>{t("accounts.spreads")}</Th>
                    <Th>{t("accounts.commission")}</Th>
                    <Th>{t("accounts.leverage")}</Th>
                  </Tr>
                </thead>
                <tbody>
                  {brokerAccountTiers.map((tier) => (
                    <Tr key={tier.code}>
                      <Td className="text-ink font-medium">{tier.name}</Td>
                      <Td>
                        {formatCurrency(tier.minDeposit, { decimals: 0 })}
                      </Td>
                      <Td>{tier.spreadFrom ?? "—"}</Td>
                      <Td>{tier.commission ?? "—"}</Td>
                      <Td>{tier.leverage ?? "—"}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableShell>
          </Reveal>
        </Container>
      </Section>

      <Section id="choosing">
        <Container>
          <SectionHeading
            eyebrow={t("accounts.choosing")}
            title={t("accounts.choosingTitle")}
            lead={t("accounts.choosingLead")}
          />
          <StaggerGroup className="mt-12 grid gap-5 md:grid-cols-3">
            {guidanceCopy.map((item) => (
              <StaggerItem
                key={item.title}
                className="border-line-soft bg-panel flex flex-col rounded-2xl border p-6"
              >
                <item.icon className="text-brand-light size-5" aria-hidden />
                <h3 className="text-ink font-display mt-5 text-base font-semibold">
                  {item.title}
                </h3>
                <p className="text-muted mt-2.5 flex-1 text-sm leading-relaxed">
                  {item.body}
                </p>
                <p className="text-faint mt-5 font-mono text-[0.6875rem] tracking-[0.12em] uppercase">
                  {item.tier}
                </p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </Section>

      <Section className="relative overflow-hidden">
        <Aurora intensity="medium" />
        <Container className="relative">
          <div className="border-line-soft bg-panel/80 relative overflow-hidden rounded-3xl border p-8 backdrop-blur-sm sm:p-12 lg:p-16">
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.2fr)_auto]">
              <div>
                <span className="eyebrow">
                  <span className="chev" />
                  {t("accounts.ready")}
                </span>
                <h2 className="text-h2 mt-5 max-w-2xl">
                  {t("accounts.ctaTitle")}
                </h2>
                <p className="text-lead text-muted mt-5 max-w-xl">
                  {t("accounts.ctaLead")}
                </p>
                <ul className="text-muted mt-7 flex flex-wrap gap-x-7 gap-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="text-mint size-4" aria-hidden />
                    {t("accounts.segFunds")}
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="text-mint size-4" aria-hidden />
                    {t("accounts.instant")}
                  </li>
                </ul>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <ButtonLink href={signupUrl} size="lg">
                  {t("accounts.open")}
                  <ArrowRight />
                </ButtonLink>
                <ButtonLink
                  href="/trading/how-it-works"
                  variant="soft"
                  size="lg"
                >
                  {t("accounts.how")}
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

function PageHero({ locale, stats }: { locale: "en" | "fr" | "ar"; stats: readonly { value: string; label: string }[] }) {
  const t = (key: Parameters<typeof routeCopy>[1]) => routeCopy(locale, key);
  return (
    <section className="bg-noise relative overflow-hidden pt-14 pb-16 sm:pt-20 lg:pt-24 lg:pb-20">
      <Aurora intensity="strong" />
      <GridBackdrop />
      <div
        aria-hidden
        className="from-bg pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t to-transparent"
      />
      <Container className="relative">
        <div className="max-w-3xl">
          <Reveal direction="none">
            <span className="eyebrow">
              <span className="chev" />
              {t("accounts.heroEyebrow")}
            </span>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="text-h1 mt-6">
              {t("accounts.heroTitle")}
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="text-lead text-muted mt-6 max-w-2xl">
              {t("accounts.heroLead")}
            </p>
          </Reveal>
          <Reveal delay={0.18} className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={signupUrl} size="lg">
              {t("accounts.open")}
              <ArrowRight />
            </ButtonLink>
            <ButtonLink href="#compare" variant="soft" size="lg">
              {t("accounts.compare")}
            </ButtonLink>
          </Reveal>
        </div>
        <Reveal delay={0.24}>
          <dl className="border-line-soft mt-14 grid grid-cols-2 gap-x-6 gap-y-7 border-t pt-8 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="text-ink font-display block text-xl font-semibold sm:text-2xl">
                    {stat.value}
                  </span>
                  <span className="text-faint mt-1 block text-xs">
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </section>
  );
}
