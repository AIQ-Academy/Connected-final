import type { Metadata } from "next";
import { ArrowRight, BookOpen } from "lucide-react";

import { GlossaryExplorer } from "@/components/education/glossary-explorer";
import { Reveal } from "@/components/motion/reveal";
import { Aurora, GridBackdrop } from "@/components/ui/aurora";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/section-heading";
import { glossary } from "@/lib/education-content";

export const metadata: Metadata = {
  title: "Trading glossary",
  description:
    "An A–Z trading glossary covering ask, bid, spread, margin, leverage, lot, pip, swap, stop loss, take profit, market order, pending order, CFD and volatility — plus the terms used on a Connect Funded account.",
};

export default function GlossaryPage() {
  return (
    <>
      <section className="bg-noise relative overflow-hidden pt-14 pb-16 sm:pt-20 lg:pt-24 lg:pb-20">
        <Aurora intensity="medium" />
        <GridBackdrop />
        <div
          aria-hidden="true"
          className="from-bg pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t to-transparent"
        />

        <Container className="relative">
          <div className="max-w-3xl">
            <Reveal direction="none">
              <Eyebrow>Learn · A–Z</Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <h1 className="text-h1 mt-6">Trading glossary</h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="text-lead text-muted mt-6 max-w-2xl">
                {glossary.length} definitions, from ask and bid through spread,
                margin, leverage and lot size, to stop loss, take profit and
                CFDs. Search, filter by letter, or browse the full list.
              </p>
            </Reveal>
          </div>
        </Container>
      </section>

      <Section id="glossary" className="pt-4 sm:pt-6 lg:pt-8">
        <Container>
          <GlossaryExplorer />
        </Container>
      </Section>

      <Section className="border-line-soft bg-raised/40 border-y">
        <Container>
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="border-line-soft bg-panel text-brand-light mx-auto grid size-12 place-items-center rounded-2xl border">
              <BookOpen className="size-5" aria-hidden="true" />
            </span>
            <h2 className="text-h2 mt-6">Moving money is a separate glossary.</h2>
            <p className="text-lead text-muted mt-4">
              Limits, timing, verification and rejected requests live on the
              funding and payout FAQ, not in these definitions.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/faq" size="lg">
                Funding and payout FAQ
                <ArrowRight />
              </ButtonLink>
              <ButtonLink href="/payments" variant="soft" size="lg">
                Payment rails
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
