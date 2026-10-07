import type { Metadata } from "next";
import { routeAlternates } from "@/lib/i18n/metadata";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, Calculator, LineChart, Table2 } from "lucide-react";

import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { FeaturePageImage } from "@/components/sections/feature-page-image";
import { GridBackdrop } from "@/components/ui/aurora";
import { Badge } from "@/components/ui/badge";
import { Container, Section } from "@/components/ui/container";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Trading Tools",
    description: "A position calculator, an economic calendar, a live market terminal and the full instrument spec sheet — everything you need before the ticket.",
    alternates: await routeAlternates("/tools"),
  };
}

const tools = [
  {
    icon: Calculator,
    title: "Position calculator",
    href: "/tools/calculator",
    body: "Margin, pip value, spread cost and the exact loss at your stop, for any instrument at any lot size and leverage.",
  },
  {
    icon: CalendarDays,
    title: "Economic calendar",
    href: "/tools/economic-calendar",
    body: "The scheduled releases that move a retail book, filtered by impact and region, with the markets each one reaches.",
  },
  {
    icon: LineChart,
    title: "Market terminal",
    href: "/markets",
    body: "Live quotes, full TradingView charting, technical ratings and a screener across every asset class we quote.",
  },
  {
    icon: Table2,
    title: "Specs & conditions",
    href: "/trading/conditions",
    body: "Spread, tick size, price precision, leverage cap, margin and session hours for every symbol on the book.",
  },
  {
    icon: BookOpen,
    title: "Trading Academy",
    href: "/education",
    body: "Structured courses from order types through to risk models, plus a glossary written against our own specifications.",
  },
] as const;

export default function ToolsPage() {
  return (
    <>
      <Section
        id="tools-hero"
        data-hero-stage=""
        className="bg-deep isolate min-h-[610px] overflow-hidden pt-32 pb-24 scroll-mt-24 sm:min-h-[700px] sm:pt-40 sm:pb-28"
      >
        <FeaturePageImage src="/images/tools.jpg" alt="Position sizing calculator and economic calendar trading tools" objectPosition="center" motionVariant="tools" />
        <GridBackdrop className="opacity-70" />
        <Container className="relative flex items-center">
          <Reveal>
            <Badge tone="brand">Tools</Badge>
            <h1 className="text-h1 mt-6 max-w-3xl text-white">
              Everything you need before the ticket.
            </h1>
            <p className="text-lead mt-6 max-w-2xl text-white/80">
              Size the position, check what is scheduled, read the tape and
              confirm the specification. All of it free, and none of it behind
              an account.
            </p>
          </Reveal>
        </Container>
      </Section>

      <Section size="spacious" className="bg-bg">
        <Container>
          <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <StaggerItem key={tool.href}>
                <Link
                  href={tool.href}
                  className="tile tile-sheen group flex h-full flex-col overflow-hidden p-6 sm:p-7"
                >
                  <span className="border-line-soft bg-sunken/70 text-brand-light grid size-11 place-items-center rounded-xl border transition-transform duration-500 group-hover:-translate-y-0.5">
                    <tool.icon className="size-5" />
                  </span>
                  <h2 className="font-display text-ink mt-5 text-lg font-semibold">
                    {tool.title}
                  </h2>
                  <p className="text-muted mt-2.5 flex-1 text-sm leading-relaxed">
                    {tool.body}
                  </p>
                  <span className="text-brand-light mt-5 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold transition-transform duration-300 group-hover:translate-x-1">
                    Open
                    <ArrowRight className="size-4" />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </Section>
    </>
  );
}
