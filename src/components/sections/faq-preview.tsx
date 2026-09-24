import { ArrowRight } from "lucide-react";

import type { FaqItem } from "@/components/faq/faq-explorer";
import { Reveal } from "@/components/motion/reveal";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/section-heading";

/** The searchable, categorised set lives on /faq; five questions is enough
 *  to answer the objections that stop a sign-up. */
export function FaqPreviewSection({ faqs }: { faqs: FaqItem[] }) {
  const selection = faqs.slice(0, 5);

  if (selection.length === 0) return null;

  return (
    <Section id="faq" size="spacious">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-20">
          <Reveal className="lg:sticky lg:top-32 lg:self-start">
            <Eyebrow>Questions</Eyebrow>
            <h2 className="text-h2 mt-5">
              The five we are asked before every sign-up.
            </h2>
            <p className="text-lead text-muted mt-6">
              Deposits, withdrawals, first payout and limits — answered in the
              same figures published on each payment rail.
            </p>
            <ButtonLink href="/faq" variant="soft" className="mt-9">
              Browse the funding and payout FAQ
              <ArrowRight />
            </ButtonLink>
          </Reveal>

          <Reveal delay={0.08}>
            <Accordion className="border-line-soft border-t">
              {selection.map((faq) => (
                <AccordionItem key={faq.id} question={faq.question}>
                  {faq.answer}
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
