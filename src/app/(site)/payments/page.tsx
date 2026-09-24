import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { RailCards } from "@/components/payments/category-cards";
import { MethodTable } from "@/components/payments/method-table";
import { Aurora, GridBackdrop } from "@/components/ui/aurora";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { paymentMethods } from "@/lib/content";
import { signupUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Payments",
  description:
    "Payment rails and transaction limits — Visa, local bank transfer, USDT, Whish Money, OMT and BOB Finance — with minimums, maximums, processing times and daily caps.",
};

const depositSteps = [
  "Select payment rail.",
  "Enter amount.",
  "Review minimum, maximum, fees, and timing.",
  "Complete rail-specific instructions.",
  "Show confirmation and transaction status.",
] as const;

const withdrawalSteps = [
  "Confirm eligibility.",
  "Select supported payout rail.",
  "Enter amount and destination.",
  "Complete verification if requested.",
  "Show review status and expected processing time.",
] as const;

const firstPayoutChecks = [
  {
    title: "Identity verified",
    body: "Complete the approved KYC process and show a visible Verified status in the client area.",
  },
  {
    title: "Profile details match",
    body: "The legal name and required account details should match the identity and payout destination records.",
  },
  {
    title: "Payout method verified",
    body: "The withdrawal rail you select must be supported, with ownership evidence available if required.",
  },
  {
    title: "Account conditions completed",
    body: "Eligibility, any minimum payout, account restrictions and review requirements must all be met.",
  },
  {
    title: "Documents ready",
    body: "Proof of address, payment-method evidence, source-of-funds information or other compliance documents may be requested.",
  },
  {
    title: "Timing and fees acknowledged",
    body: "Processing time, fees, limits and status notifications are shown before you confirm the request.",
  },
] as const;

export default function PaymentsPage() {
  return (
    <>
      <PageHero />

      <Section
        id="directions"
        className="border-line-soft bg-raised/40 border-y"
      >
        <Container>
          <SectionHeading title="Two transaction directions" />

          <Reveal className="border-line-soft bg-panel mt-10 overflow-hidden rounded-2xl border">
            <div className="grid lg:grid-cols-2">
              <FlowColumn
                title="Deposit — step by step"
                steps={depositSteps}
                className="border-line-soft lg:border-r"
              />
              <FlowColumn
                title="Withdrawal / payout — step by step"
                steps={withdrawalSteps}
              />
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section id="rail-cards">
        <Container>
          <SectionHeading
            eyebrow="Rail by rail"
            title="Limits, timing and terms for every rail."
            lead="Direction, minimum, maximum, daily cap, processing time, currency, fees, name match, verification and geography — stated before you send anything."
          />
          <div className="mt-12">
            <RailCards />
          </div>
        </Container>
      </Section>

      <Section
        id="first-payout"
        className="border-line-soft bg-raised/40 border-y"
      >
        <Container>
          <SectionHeading
            eyebrow="Payout readiness"
            title="Before the first payout"
            lead="One checklist of what must be complete before you submit the first payout request. Nothing on it is discretionary, and nothing is added after you start winning."
          />

          <Reveal className="border-line-soft bg-panel mt-12 overflow-hidden rounded-2xl border">
            <ol className="divide-line-soft divide-y">
              {firstPayoutChecks.map((item, index) => (
                <li
                  key={item.title}
                  className="flex gap-4 p-5 sm:gap-5 sm:p-6 lg:p-7"
                >
                  <span className="border-line-soft bg-sunken text-brand-light grid size-11 shrink-0 place-items-center rounded-lg border font-display text-lg font-semibold">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-ink font-display text-base font-semibold">
                      {item.title}
                    </h3>
                    <p className="text-muted mt-1.5 text-sm leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </Container>
      </Section>

      <Section className="border-line-soft bg-noise relative overflow-hidden border-t">
        <Aurora intensity="medium" />
        <GridBackdrop />
        <Container className="relative">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow justify-center">
              <span className="chev" />
              Ready when you are
            </span>
            <h2 className="text-h2 mt-5">
              Fund an account on the rail you use.
            </h2>
            <p className="text-lead text-muted mt-5">
              {paymentMethods.length} published rails, with limits and timing
              stated before you send anything.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <ButtonLink href={signupUrl} size="lg">
                Create account
                <ArrowRight />
              </ButtonLink>
              <ButtonLink href="/trading/how-it-works" variant="soft" size="lg">
                How funding works
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

function FlowColumn({
  title,
  steps,
  className,
}: {
  title: string;
  steps: readonly string[];
  className?: string;
}) {
  return (
    <div className={cn("p-6 sm:p-8 lg:p-10", className)}>
      <h3 className="text-ink font-display text-lg font-semibold">{title}</h3>
      <ol className="mt-6 space-y-3.5">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-3.5 text-sm leading-relaxed">
            <span className="text-brand-light mt-0.5 w-4 shrink-0 font-mono text-[0.8125rem]">
              {index + 1}.
            </span>
            <span className="text-muted">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function PageHero() {
  return (
    <section className="bg-noise relative overflow-hidden pt-14 pb-16 sm:pt-20 lg:pb-20">
      <Aurora intensity="medium" />
      <GridBackdrop />
      <div
        aria-hidden="true"
        className="from-bg pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t to-transparent"
      />

      <Container className="relative">
        <div className="max-w-3xl">
          <Reveal direction="none">
            <span className="eyebrow">
              <span className="chev" />
              Payments
            </span>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="text-h1 mt-6">
              Payment rails and transaction limits
            </h1>
          </Reveal>
        </div>

        <Reveal delay={0.18} className="mt-12" id="rails">
          <MethodTable />
        </Reveal>
      </Container>
    </section>
  );
}
