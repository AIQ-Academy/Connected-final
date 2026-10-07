import type { Metadata } from "next";
import { routeAlternates } from "@/lib/i18n/metadata";

import { Reveal } from "@/components/motion/reveal";
import { EconomicCalendar } from "@/components/tools/economic-calendar";
import { GridBackdrop } from "@/components/ui/aurora";
import { Badge } from "@/components/ui/badge";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Economic Calendar",
    description: "The scheduled releases that move forex, indices and energies — filtered by impact and region, with the markets each one affects.",
    alternates: await routeAlternates("/tools/economic-calendar"),
  };
}

const guidance = [
  {
    title: "High impact",
    body: "Rate decisions, CPI and payrolls. Spreads widen because the underlying book thins, and slippage on a market order is normal for the first thirty seconds.",
  },
  {
    title: "Medium impact",
    body: "PMIs, secondary inflation prints and central bank speeches. They move the market when they contradict what the last high-impact release implied.",
  },
  {
    title: "Low impact",
    body: "Sentiment surveys and revisions. Rarely a standalone mover — they matter as confirmation of a trend already in the price.",
  },
];

export default function EconomicCalendarPage() {
  return (
    <>
      <Section
        data-hero-stage=""
        className="bg-deep isolate overflow-hidden pt-32 pb-12 sm:pt-40"
      >
        <GridBackdrop className="opacity-70" />
        <Container className="relative">
          <Reveal>
            <Badge tone="brand">Trading tools</Badge>
            <h1 className="text-h1 mt-6 max-w-3xl">
              Know what is scheduled before you leave a position open.
            </h1>
            <p className="text-lead text-muted mt-6 max-w-2xl">
              A typical week of the releases that actually move a retail book,
              with the impact rating and the markets each one reaches. Times in
              GMT.
            </p>
          </Reveal>
        </Container>
      </Section>

      <Section className="bg-bg">
        <Container>
          <Reveal>
            <EconomicCalendar />
          </Reveal>
        </Container>
      </Section>

      <Section size="spacious" className="bg-sunken">
        <Container>
          <SectionHeading
            eyebrow="Impact ratings"
            title="What the bars mean"
            lead="Impact describes how much the release typically moves price, not how important the data is economically."
          />
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {guidance.map((item) => (
              <Reveal key={item.title}>
                <article className="tile tile-sheen h-full overflow-hidden p-6">
                  <h2 className="font-display text-ink text-base font-semibold">
                    {item.title}
                  </h2>
                  <p className="text-muted mt-2 text-sm leading-relaxed">
                    {item.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
