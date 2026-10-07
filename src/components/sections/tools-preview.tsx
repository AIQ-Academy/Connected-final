"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";

import { Reveal } from "@/components/motion/reveal";
import { EconomicCalendar } from "@/components/tools/economic-calendar";
import { PositionCalculator } from "@/components/tools/position-calculator";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { TabList, TabPanel } from "@/components/ui/tabs";
import { useLocale } from "@/components/i18n/locale-provider";

/**
 * The two tools a trader uses *before* the ticket: size the position, and know
 * what is scheduled. Both are the real components from `/tools`, mounted in
 * compact mode — not screenshots or teasers.
 */
export function ToolsPreview({ id = "tools" }: { id?: string }) {
  const { t } = useLocale();
  const [tab, setTab] = useState("calculator");

  return (
    <Section
      id={id}
      size="spacious"
      className="section-wash bg-sunken scroll-mt-28 isolate overflow-hidden"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_80%_0%,rgb(var(--cf-brand-glow)/0.14),transparent_60%)]"
      />

      <Container className="relative">
        <SectionHeading
          eyebrow={t("home.tools.eyebrow")}
          title={t("home.tools.title")}
          lead={t("home.tools.lead")}
          action={
            <ButtonLink href="/tools" variant="soft" size="lg">
              {t("home.tools.all")}
              <ArrowRight />
            </ButtonLink>
          }
        />

        <div className="mt-12">
          <TabList
            label={t("home.tools.tabLabel")}
            idPrefix="tools-preview"
            value={tab}
            onValueChange={setTab}
            items={[
              { value: "calculator", label: t("home.tools.calculator") },
              { value: "calendar", label: t("home.tools.calendar") },
            ]}
          />
        </div>

        <Reveal className="mt-6">
          <TabPanel
            value="calculator"
            active={tab === "calculator"}
            idPrefix="tools-preview"
          >
            <PositionCalculator compact />
          </TabPanel>
          <TabPanel
            value="calendar"
            active={tab === "calendar"}
            idPrefix="tools-preview"
          >
            <EconomicCalendar compact />
          </TabPanel>
        </Reveal>
      </Container>
    </Section>
  );
}
