import type { Metadata } from "next";
import { routeAlternates } from "@/lib/i18n/metadata";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { PositionCalculator } from "@/components/tools/position-calculator";
import { GridBackdrop } from "@/components/ui/aurora";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { signupUrl } from "@/lib/site";
import { getServerLocale } from "@/lib/i18n/server";
import { pageCopy } from "@/lib/i18n/page-copy";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Position Calculator",
    description: "Work out margin, pip value, spread cost and the exact loss at your stop for any instrument, before you place the trade.",
    alternates: await routeAlternates("/tools/calculator"),
  };
}

export default async function CalculatorPage() {
  const locale = await getServerLocale();
  const t = (key: Parameters<typeof pageCopy>[1]) => pageCopy(locale, key);
  const explainers = [
    { term: t("calculator.notionalTerm"), body: t("calculator.notionalBody") },
    { term: t("calculator.marginTerm"), body: t("calculator.marginBody") },
    { term: t("calculator.pipTerm"), body: t("calculator.pipBody") },
    { term: t("calculator.spreadTerm"), body: t("calculator.spreadBody") },
  ];
  return (
    <>
      <Section
        data-hero-stage=""
        className="bg-deep isolate overflow-hidden pt-32 pb-12 sm:pt-40"
      >
        <GridBackdrop className="opacity-70" />
        <Container className="relative">
          <Reveal>
          <Badge tone="brand">{t("calculator.tools")}</Badge>
            <h1 className="text-h1 mt-6 max-w-3xl">
              {t("calculator.heroTitle")}
            </h1>
            <p className="text-lead text-muted mt-6 max-w-2xl">
              {t("calculator.heroLead")}
            </p>
          </Reveal>
        </Container>
      </Section>

      <Section className="bg-bg">
        <Container>
          <Reveal>
            <PositionCalculator />
          </Reveal>
        </Container>
      </Section>

      <Section size="spacious" className="bg-sunken">
        <Container>
          <SectionHeading
            eyebrow={t("calculator.output")}
            title={t("calculator.whatMeans")}
            lead={t("calculator.figuresLead")}
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {explainers.map((item) => (
              <Reveal key={item.term}>
                <article className="tile tile-sheen h-full overflow-hidden p-6">
                  <h2 className="font-display text-ink text-base font-semibold">
                    {item.term}
                  </h2>
                  <p className="text-muted mt-2 text-sm leading-relaxed">
                    {item.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.08}>
            <div className="surface mt-5 flex flex-wrap items-center justify-between gap-6 p-6 sm:p-9">
              <div>
                <p className="eyebrow">{t("calculator.ready")}</p>
                <p className="font-display text-ink mt-2 text-xl font-semibold">
                  {t("calculator.apply")}
                </p>
              </div>
              <ButtonLink href={signupUrl} size="lg">
                {t("calculator.open")}
                <ArrowRight />
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
