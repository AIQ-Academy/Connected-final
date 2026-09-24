import {
  ArrowRight,
  Clock,
  Globe,
  GraduationCap,
  LayoutDashboard,
  Monitor,
  Rocket,
  Scale,
  ShieldCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";

import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Aurora, GridBackdrop } from "@/components/ui/aurora";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  companyStats,
  differentiators,
  type Differentiator,
} from "@/lib/content";
import type { Heading } from "@/lib/cms/schemas";
import type { ResolvedImage } from "@/lib/cms/media";
import { marketingImages } from "@/lib/images";
import { cn } from "@/lib/utils";

/**
 * The five commitments that decide whether a trader trusts a prop firm. The
 * full nine-part argument stays on /about#why — this is the short version.
 */
const HEADLINE_REASONS = [
  "Rules enforced server-side",
  "Payouts in 24 to 48 hours",
  "No time limit on either phase",
  "One account, every asset class",
  "Scaling published up front",
] as const;

const brokerReasons: Differentiator[] = [
  {
    title: "Segregated client funds",
    body: "Deposits sit in segregated accounts. Your balance is yours — not an evaluation allocation.",
    icon: "ShieldCheck",
  },
  {
    title: "Tier-1 liquidity routing",
    body: "Orders route through the same Equinix stack used across the desk — LD4, NY4 and TY3.",
    icon: "Zap",
  },
  {
    title: "Three platforms, one login",
    body: "MetaTrader 5, cTrader and the Web Terminal all connect to the same account. Switch whenever you like.",
    icon: "Monitor",
  },
  {
    title: "No evaluation gate",
    body: "Standard from $100, Pro from $1,000, VIP from $50,000. Deposit, trade, withdraw — no profit split.",
    icon: "Scale",
  },
];

const brokerStats = [
  { value: "$100", label: "Standard from" },
  { value: "1:500", label: "Leverage up to" },
  { value: "6", label: "Asset classes" },
  { value: "24/5", label: "Market access" },
] as const;

const iconMap: Record<Differentiator["icon"], LucideIcon> = {
  ShieldCheck,
  Zap,
  Clock,
  LayoutDashboard,
  Monitor,
  GraduationCap,
  Scale,
  Globe,
  Rocket,
};

const defaultHeading: Heading = {
  eyebrow: "Why Connect Funded",
  title: "The account is yours. The infrastructure is ours.",
  lead: "These are the commitments we publish before you deposit, not the ones we reach for after a dispute.",
  actionHref: "/about#why",
  actionLabel: "The full argument",
};

export function WhySection({
  heading = defaultHeading,
  image,
  variant = "funded",
}: {
  heading?: Heading;
  image?: ResolvedImage;
  variant?: "funded" | "broker";
} = {}) {
  const panel = image ?? marketingImages.whyUs;
  const broker = variant === "broker";
  const reasons = broker
    ? brokerReasons
    : HEADLINE_REASONS.flatMap((title) => {
        const match = differentiators.find((item) => item.title === title);
        return match ? [match] : [];
      });
  const stats = broker ? brokerStats : companyStats;

  return (
    <Section
      id="why-connect-funded"
      size="spacious"
      className="bg-noise isolate overflow-hidden"
    >
      <Aurora intensity="medium" />
      <GridBackdrop />

      <Container className="relative">
        <SectionHeading
          eyebrow={heading.eyebrow}
          title={heading.title}
          lead={heading.lead}
          action={
            <ButtonLink href={heading.actionHref} variant="outline">
              {heading.actionLabel}
              <ArrowRight />
            </ButtonLink>
          }
        />

        <div className="mt-12 grid gap-4 sm:mt-16 lg:mt-20 lg:grid-cols-12 lg:items-stretch lg:gap-5">
          <Reveal className="h-full lg:col-span-5">
            <div className="border-line-soft relative h-full min-h-[22rem] overflow-hidden rounded-2xl border sm:min-h-[26rem]">
              <div className="relative h-full min-h-[inherit]">
                <Image
                  src={panel.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 42vw, 100vw"
                  className="object-cover object-center"
                  {...("blurDataURL" in panel && panel.blurDataURL
                    ? {
                        placeholder: "blur" as const,
                        blurDataURL: panel.blurDataURL,
                      }
                    : {})}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(to_top,rgb(8_10_20/0.88)_0%,rgb(8_10_20/0.2)_45%,transparent_100%)]"
                />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                  <p className="font-mono text-[0.625rem] tracking-[0.18em] text-white/65 uppercase">
                    {broker
                      ? "Built for live traders"
                      : "Built for funded traders"}
                  </p>
                  <p className="font-display mt-2 text-2xl leading-snug font-semibold text-white">
                    {broker
                      ? "Infrastructure, costs and withdrawals you can verify before you deposit."
                      : "Infrastructure, rules and payouts you can verify before you pay."}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="relative lg:col-span-7">
            <p className="text-faint mb-3 font-mono text-[0.625rem] tracking-[0.14em] uppercase sm:hidden">
              Swipe commitments
            </p>
            <StaggerGroup
              role="list"
              className="mobile-snap-rail gap-4 sm:grid sm:grid-cols-2 sm:content-start sm:gap-4 lg:grid-cols-2"
            >
              {reasons.slice(0, 4).map((reason, index) => {
                const Icon = iconMap[reason.icon] ?? ShieldCheck;
                const featured = index === reasons.length - 1;

                return (
                  <StaggerItem
                    role="listitem"
                    key={reason.title}
                    className={cn(
                      "mobile-snap-card w-[min(88vw,22rem)] sm:w-auto",
                      featured && "sm:col-span-2 lg:col-span-2",
                    )}
                  >
                    <article className="border-line bg-panel group relative h-full overflow-hidden rounded-2xl border p-6 transition-colors duration-300 hover:border-brand-light/40 sm:p-7">
                      <div className="relative flex items-start gap-4">
                        <span className="border-line-soft bg-sunken text-brand-light grid size-11 shrink-0 place-items-center rounded-xl border">
                          <Icon className="size-[18px]" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="text-faint font-mono text-[0.625rem] tracking-[0.16em] uppercase">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <h3 className="text-ink font-display mt-1.5 text-lg leading-snug font-semibold">
                            {reason.title}
                          </h3>
                          <p className="text-muted mt-2.5 text-sm leading-relaxed">
                            {reason.body}
                          </p>
                        </div>
                      </div>
                    </article>
                  </StaggerItem>
                );
              })}
            </StaggerGroup>
          </div>
        </div>

        <Reveal delay={0.1}>
          <dl className="border-line bg-line mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border lg:mt-6 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-raised px-5 py-7 sm:px-7 sm:py-8"
              >
                <dt className="text-faint font-mono text-[0.625rem] tracking-[0.14em] uppercase">
                  {stat.label}
                </dt>
                <dd className="text-ink font-display tabular mt-3 text-3xl font-semibold sm:text-4xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </Section>
  );
}
