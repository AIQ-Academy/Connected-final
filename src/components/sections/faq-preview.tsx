"use client";

import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/section-heading";
import type { Faq } from "@/db/schema";
import { useLocale } from "@/components/i18n/locale-provider";
import type { DictionaryKey } from "@/lib/i18n/dictionaries";

const seededFaqCopy: Record<string, readonly [DictionaryKey, DictionaryKey]> = {
  "Which markets can I trade?": ["home.faq.q1", "home.faq.a1"],
  "What spreads and commission do you charge?": ["home.faq.q2", "home.faq.a2"],
  "Are expert advisors and algorithmic strategies allowed?": ["home.faq.q3", "home.faq.a3"],
  "Can I hold trades over the weekend or through news?": ["home.faq.q4", "home.faq.a4"],
  "Which platforms can I trade on?": ["home.faq.q5", "home.faq.a5"],
};

/** The searchable, categorised set lives on /faq; five questions is enough
 *  to answer the objections that stop a sign-up. */
export function FaqPreviewSection({ faqs }: { faqs: Faq[] }) {
  const { t, locale } = useLocale();
  const selection = [...faqs]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 5);

  if (selection.length === 0) return null;

  return (
    <Section id="faq" size="spacious">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-20">
          <Reveal className="lg:sticky lg:top-32 lg:self-start">
            <Eyebrow>{t("home.faq.eyebrow")}</Eyebrow>
            <h2 className="text-h2 mt-5">
              {t("home.faq.title")}
            </h2>
            <p className="text-lead text-muted mt-6">
              {t("home.faq.lead")}
            </p>
            <ButtonLink href="/faq" variant="soft" className="mt-9">
              {t("home.faq.browse").replace("{count}", String(faqs.length))}
              <ArrowRight />
            </ButtonLink>
          </Reveal>

          <Reveal delay={0.08}>
            <Accordion className="border-line-soft border-t">
              {selection.map((faq) => (
                <AccordionItem key={faq.id} question={
                  locale !== "en" && seededFaqCopy[faq.question]
                    ? t(seededFaqCopy[faq.question][0])
                    : faq.question
                }>
                  {locale !== "en" && seededFaqCopy[faq.question]
                    ? t(seededFaqCopy[faq.question][1])
                    : faq.answer}
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
