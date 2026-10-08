import type { Metadata } from "next";
import { routeAlternates } from "@/lib/i18n/metadata";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, Calculator, LineChart, Table2 } from "lucide-react";

import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { FeaturePageImage } from "@/components/sections/feature-page-image";
import { GridBackdrop } from "@/components/ui/aurora";
import { Badge } from "@/components/ui/badge";
import { Container, Section } from "@/components/ui/container";
import { getServerLocale } from "@/lib/i18n/server";
import { pageCopy } from "@/lib/i18n/page-copy";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return {
    title: pageCopy(locale, "toolsPage.badge"),
    description: pageCopy(locale, "toolsPage.lead"),
    alternates: await routeAlternates("/tools"),
  };
}

const tools = [
  {
    icon: Calculator,
    titleKey: "toolsPage.positionTitle",
    href: "/tools/calculator",
    bodyKey: "toolsPage.positionBody",
  },
  {
    icon: CalendarDays,
    titleKey: "toolsPage.calendarTitle",
    href: "/tools/economic-calendar",
    bodyKey: "toolsPage.calendarBody",
  },
  {
    icon: LineChart,
    titleKey: "toolsPage.terminalTitle",
    href: "/markets",
    bodyKey: "toolsPage.terminalBody",
  },
  {
    icon: Table2,
    titleKey: "toolsPage.specsTitle",
    href: "/trading/conditions",
    bodyKey: "toolsPage.specsBody",
  },
  {
    icon: BookOpen,
    titleKey: "toolsPage.academyTitle",
    href: "/education",
    bodyKey: "toolsPage.academyBody",
  },
] as const;

export default async function ToolsPage() {
  const locale = await getServerLocale();
  const t = (key: Parameters<typeof pageCopy>[1]) => pageCopy(locale, key);
  return (
    <>
      <Section
        id="tools-hero"
        data-hero-stage=""
        className="bg-deep isolate min-h-[610px] overflow-hidden pt-32 pb-24 scroll-mt-24 sm:min-h-[700px] sm:pt-40 sm:pb-28"
      >
        <FeaturePageImage src="/images/tools.jpg" alt={t("toolsPage.imageAlt")} objectPosition="center" motionVariant="tools" />
        <GridBackdrop className="opacity-70" />
        <Container className="relative flex items-center">
          <Reveal>
            <Badge tone="brand">{t("toolsPage.badge")}</Badge>
            <h1 className="text-h1 mt-6 max-w-3xl text-white">
              {t("toolsPage.title")}
            </h1>
            <p className="text-lead mt-6 max-w-2xl text-white/80">
              {t("toolsPage.lead")}
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
                    {t(tool.titleKey)}
                  </h2>
                  <p className="text-muted mt-2.5 flex-1 text-sm leading-relaxed">
                    {t(tool.bodyKey)}
                  </p>
                  <span className="text-brand-light mt-5 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold transition-transform duration-300 group-hover:translate-x-1">
                    {t("toolsPage.open")}
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
