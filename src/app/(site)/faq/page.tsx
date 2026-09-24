import type { Metadata } from "next";
import { ArrowRight, Headphones, MessageSquare } from "lucide-react";

import { FaqExplorer } from "@/components/faq/faq-explorer";
import { Reveal } from "@/components/motion/reveal";
import { Aurora, GridBackdrop } from "@/components/ui/aurora";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/section-heading";
import { fundingFaqCategories, fundingFaqs } from "@/lib/funding-faq";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Funding and payout FAQ",
  description:
    "Searchable answers on deposits, withdrawals, first payout, limits, processing times, verification, rejected requests and transaction tracking.",
};

export default function FaqPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: fundingFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <section className="bg-noise relative overflow-hidden pt-14 pb-16 sm:pt-20 lg:pt-24 lg:pb-20">
        <Aurora intensity="medium" />
        <GridBackdrop />
        <div
          aria-hidden="true"
          className="from-bg pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t to-transparent"
        />

        <Container className="relative">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-end lg:gap-16">
            <div>
              <Reveal direction="none">
                <Eyebrow>
                  Learn · {fundingFaqs.length} answers
                </Eyebrow>
              </Reveal>

              <Reveal delay={0.06}>
                <h1 className="text-h1 mt-6 max-w-2xl">
                  Funding and payout{" "}
                  <span className="text-gradient">FAQ</span>
                </h1>
              </Reveal>

              <Reveal delay={0.12}>
                <p className="text-lead text-muted mt-6 max-w-xl">
                  One searchable hub for deposits, withdrawals, the first
                  payout, limits, processing times, verification, rejected
                  requests and transaction tracking. The figures match the rail
                  cards on the payments page.
                </p>
              </Reveal>

              <Reveal delay={0.18} className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/payments" variant="soft" size="lg">
                  See payment rails
                </ButtonLink>
                <ButtonLink href="/contact" variant="ghost" size="lg">
                  Ask something else
                  <ArrowRight />
                </ButtonLink>
              </Reveal>
            </div>

            <Reveal delay={0.15} direction="left">
              <div className="border-line-soft bg-panel/70 overflow-hidden rounded-2xl border backdrop-blur-sm">
                <p className="border-line-soft text-faint border-b px-5 py-3 font-mono text-[0.625rem] tracking-[0.14em] uppercase">
                  {fundingFaqCategories.length} categories
                </p>
                <ul className="divide-line-soft divide-y">
                  {fundingFaqCategories.map((name) => (
                    <li key={name}>
                      <a
                        href={`#faq-${name.toLowerCase().replace(/\s+/g, "-")}`}
                        className="text-muted hover:text-ink flex items-baseline justify-between gap-6 px-5 py-3.5 text-sm transition-colors"
                      >
                        {name}
                        <span className="text-faint font-mono text-[0.6875rem]">
                          {
                            fundingFaqs.filter((faq) => faq.category === name)
                              .length
                          }
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <Section className="pt-4 sm:pt-6 lg:pt-8">
        <Container>
          <FaqExplorer faqs={fundingFaqs} />
        </Container>
      </Section>

      <Section className="bg-raised border-line-soft border-y">
        <Container>
          <div className="grid gap-8 lg:grid-cols-2">
            <Reveal className="border-line-soft bg-panel flex flex-col rounded-2xl border p-8">
              <span className="border-line-soft bg-raised text-brand-light grid size-11 place-items-center rounded-xl border">
                <MessageSquare className="size-[18px]" aria-hidden="true" />
              </span>
              <h2 className="text-h3 mt-5">Still stuck on a transfer?</h2>
              <p className="text-muted mt-3 text-sm leading-relaxed">
                If the answer is not here, it is usually because the situation
                is specific to your account. Send it to the desk with your
                account number and the transaction reference from the portal.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href="/contact">
                  Contact the desk
                  <ArrowRight />
                </ButtonLink>
                <ButtonLink href="/portal" variant="soft">
                  Open a portal ticket
                </ButtonLink>
              </div>
            </Reveal>

            <Reveal
              delay={0.08}
              className="border-line-soft bg-panel flex flex-col rounded-2xl border p-8"
            >
              <span className="border-line-soft bg-raised text-mint grid size-11 place-items-center rounded-xl border">
                <Headphones className="size-[18px]" aria-hidden="true" />
              </span>
              <h2 className="text-h3 mt-5">When the desk is open</h2>
              <p className="text-muted mt-3 text-sm leading-relaxed">
                Support runs 24/5, from the Sydney open on Monday to the New
                York close on Friday. Portal tickets are answered fastest;
                email reaches the same queue. Weekend messages are picked up at
                the Monday open.
              </p>
              <dl className="border-line-soft mt-6 space-y-3 border-t pt-5 text-sm">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-muted">General support</dt>
                  <dd className="text-ink font-mono text-[0.8125rem]">
                    {site.email}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-muted">Funding and pricing</dt>
                  <dd className="text-ink font-mono text-[0.8125rem]">
                    {site.salesEmail}
                  </dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  );
}
