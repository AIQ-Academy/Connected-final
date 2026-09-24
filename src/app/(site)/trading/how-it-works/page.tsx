import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  Landmark,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import Image from "next/image";

import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Aurora, GridBackdrop } from "@/components/ui/aurora";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  brokerHowItWorksStages,
} from "@/lib/landing/broker";
import { guardProduct } from "@/lib/product-guard";
import { signupUrl } from "@/lib/site";
import { createMediaResolver } from "@/lib/cms/media";

export const metadata: Metadata = {
  title: "How Live Trading Works",
  description:
    "Register, complete KYC once, fund your balance and trade live markets on MetaTrader 5, cTrader or the Web Terminal — no evaluation phases.",
};

const stageIcons = [BadgeCheck, ShieldCheck, Wallet, Landmark] as const;

const stageDetail: Record<
  string,
  { rules: string[]; next: string }
> = {
  "01": {
    rules: [
      "Choose Standard, Pro or VIP at signup — you can upgrade later from the portal.",
      "Pick MetaTrader 5, cTrader or the Web Terminal; credentials land in the portal immediately.",
      "Demo and live share the same login so you can rehearse before funding.",
    ],
    next: "Your profile opens the KYC queue. You can browse markets and the portal while verification runs.",
  },
  "02": {
    rules: [
      "Upload a government photo ID and a proof of address dated within three months.",
      "Automated screening runs first; a human desk reviews exceptions the same business day in most cases.",
      "Verification is required before the first withdrawal, not before your first deposit.",
    ],
    next: "Once cleared, withdrawal rails unlock. Deposits are available as soon as registration completes.",
  },
  "03": {
    rules: [
      "Cards and crypto credit instantly; bank transfers typically settle in one to two business days.",
      "There is no deposit fee on the published rails. Minimums start at $100 on Standard.",
      "Your full cleared balance is tradable — nothing is held back as a challenge fee.",
    ],
    next: "Open the platform from the portal and place your first live order on any quoted instrument.",
  },
  "04": {
    rules: [
      "Trade forex, metals, energy, indices and crypto under the account type you selected.",
      "Leverage is published on Standard and Pro — up to 1:500. Ask the desk for VIP terms.",
      "Request a withdrawal on the same rail you deposited with; reviews complete within 24 hours on open market days.",
    ],
    next: "Scale your volume and upgrade account type when tighter spreads or raw pricing become the better fit.",
  },
};

export default async function TradingHowItWorksPage() {
  await guardProduct("broker");
  const image = await createMediaResolver();

  return (
    <>
      <section className="bg-noise relative overflow-hidden pt-14 pb-16 sm:pt-20 lg:pt-24 lg:pb-20">
        <Aurora intensity="strong" />
        <GridBackdrop />
        <div
          aria-hidden
          className="from-bg pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t to-transparent"
        />
        <Container className="relative max-w-3xl">
          <Reveal direction="none">
            <span className="eyebrow">
              <span className="chev" />
              Live trading path
            </span>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="text-h1 mt-6">
              Four steps from registration to{" "}
              <span className="text-gradient">your first live trade.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="text-lead text-muted mt-6">
              No challenge phases and no profit split. Verify once, fund the
              account, and execute on the same infrastructure used across the desk.
            </p>
          </Reveal>
          <Reveal delay={0.18} className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={signupUrl} size="lg">
              Open live account
              <ArrowRight />
            </ButtonLink>
            <ButtonLink href="/trading/accounts" variant="soft" size="lg">
              Compare account types
            </ButtonLink>
          </Reveal>
        </Container>
      </section>

      <Section id="stages" className="pt-4 sm:pt-6">
        <Container>
          <SectionHeading
            eyebrow="The path"
            title="Everything happens in the portal."
            lead="Each stage unlocks the next without a sales call. The desk is available when you want human help."
          />

          <div className="mt-14 space-y-8 lg:space-y-10">
            {brokerHowItWorksStages.map((stage, index) => {
              const Icon = stageIcons[index] ?? BadgeCheck;
              const detail = stageDetail[stage.index];
              const frame = image(`trading.how-it-works.stage-${index + 1}`);

              return (
                <Reveal key={stage.index}>
                  <article className="border-line-soft bg-panel grid overflow-hidden rounded-3xl border lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                    <div className="relative min-h-[14rem] lg:min-h-full">
                      {frame && (
                        <Image
                          src={frame.src}
                          alt={frame.alt}
                          fill
                          sizes="(min-width: 1024px) 40vw, 100vw"
                          className="object-cover"
                          {...(frame.blurDataURL
                            ? {
                                placeholder: "blur" as const,
                                blurDataURL: frame.blurDataURL,
                              }
                            : {})}
                        />
                      )}
                      <div
                        aria-hidden
                        className="absolute inset-0 bg-[linear-gradient(to_top,rgb(8_10_20/0.75),transparent_55%)] lg:bg-[linear-gradient(to_right,transparent_40%,rgb(var(--cf-bg)/0.35))]"
                      />
                      <div className="absolute inset-x-0 bottom-0 p-6 lg:inset-auto lg:top-6 lg:left-6">
                        <span className="font-mono text-[0.6875rem] tracking-[0.16em] text-white/70 uppercase">
                          Stage {stage.index}
                        </span>
                        <p className="font-display mt-1 text-xl font-semibold text-white">
                          {stage.kicker}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8 lg:p-10">
                      <div className="flex items-start gap-3">
                        <span className="bg-brand/12 text-brand-light ring-brand/25 grid size-10 shrink-0 place-items-center rounded-xl ring-1">
                          <Icon className="size-4" aria-hidden />
                        </span>
                        <div>
                          <h2 className="text-ink font-display text-xl font-semibold">
                            {stage.title}
                          </h2>
                          <p className="text-muted mt-2 text-sm leading-relaxed">
                            {stage.body}
                          </p>
                        </div>
                      </div>

                      <ul className="mt-6 space-y-2.5">
                        {(detail?.rules ?? stage.points).map((rule) => (
                          <li
                            key={rule}
                            className="text-muted flex gap-2.5 text-sm leading-relaxed"
                          >
                            <span
                              aria-hidden
                              className="bg-mint mt-2 size-1.5 shrink-0 rounded-full"
                            />
                            {rule}
                          </li>
                        ))}
                      </ul>

                      {detail?.next && (
                        <p className="border-line-soft text-faint mt-7 border-t pt-5 text-xs leading-relaxed">
                          Next: {detail.next}
                        </p>
                      )}
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section
        id="platforms"
        className="border-line-soft bg-raised/40 border-y"
      >
        <Container>
          <SectionHeading
            eyebrow="After you are live"
            title="Same platforms, one login."
            lead="Platforms, liquidity and market data are the same on every live account — only the minimum deposit and benefits change."
            action={
              <ButtonLink href="/platforms" variant="outline">
                See platforms
                <ArrowRight />
              </ButtonLink>
            }
          />
          <StaggerGroup className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "Platforms",
                body: "MetaTrader 5, cTrader and the browser Web Terminal from one portal login.",
              },
              {
                title: "Markets",
                body: "Forex, metals, energy, indices and crypto with the account type you selected.",
              },
              {
                title: "Desk",
                body: "24/5 support on Standard, priority execution on Pro, a personal trading advisor on VIP.",
              },
            ].map((item) => (
              <StaggerItem
                key={item.title}
                className="border-line-soft bg-panel rounded-2xl border p-6"
              >
                <h3 className="text-ink font-display text-base font-semibold">
                  {item.title}
                </h3>
                <p className="text-muted mt-2.5 text-sm leading-relaxed">
                  {item.body}
                </p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </Section>

      <Section className="relative overflow-hidden">
        <Aurora intensity="subtle" />
        <Container className="relative">
          <div className="border-line-soft bg-panel mx-auto max-w-3xl rounded-3xl border px-6 py-10 text-center sm:px-10 sm:py-12">
            <h2 className="text-h2">Ready to fund a live book?</h2>
            <p className="text-lead text-muted mx-auto mt-4 max-w-xl">
              Open Standard from $100, Pro from $1,000, or VIP from $50,000.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink href={signupUrl} size="lg">
                Open live account
                <ArrowRight />
              </ButtonLink>
              <ButtonLink href="/contact" variant="soft" size="lg">
                Talk to the desk
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
