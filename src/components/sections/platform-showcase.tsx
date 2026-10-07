"use client";

import { ArrowRight, Check, Monitor, Smartphone, Globe } from "lucide-react";
import { useState } from "react";

import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { TabList, TabPanel } from "@/components/ui/tabs";
import { useLocale } from "@/components/i18n/locale-provider";
import { getPlatforms } from "@/lib/content";
import { signupUrl } from "@/lib/site";

const platformIcons = [Monitor, Globe, Smartphone];

/**
 * Platform picker. The tab strip drives a single panel rather than rendering
 * all three stacked, because the comparison that matters is "which one fits
 * me", not "how do the three differ line by line" — that lives on /platforms.
 */
export function PlatformShowcase({ id = "platforms" }: { id?: string }) {
  const { t, locale } = useLocale();
  const platforms = getPlatforms(locale).filter((platform) => platform.slug !== "ctrader");
  const [active, setActive] = useState(platforms[0].slug);
  const current = platforms.find((p) => p.slug === active) ?? platforms[0];

  return (
    <Section
      id={id}
      size="spacious"
      className="section-wash bg-bg scroll-mt-28 isolate overflow-hidden"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_15%_100%,rgb(var(--cf-accent-glow)/0.1),transparent_60%)]"
      />

      <Container className="relative">
        <SectionHeading
          eyebrow={t("platformShowcase.eyebrow")}
          title={t("platformShowcase.title")}
          lead={t("platformShowcase.lead")}
          action={
            <ButtonLink href="/platforms" variant="soft" size="lg">
              {t("platformShowcase.compareCta")}
              <ArrowRight />
            </ButtonLink>
          }
        />

        <div className="mt-12">
          <TabList
            label={t("platformShowcase.tabListLabel")}
            idPrefix="platform-showcase"
            value={active}
            onValueChange={setActive}
            items={platforms.map((platform) => ({
              value: platform.slug,
              label: platform.name,
            }))}
          />
        </div>

        {platforms.map((platform, index) => {
          const Icon = platformIcons[index % platformIcons.length];
          return (
            <TabPanel
              key={platform.slug}
              value={platform.slug}
              active={platform.slug === current.slug}
              idPrefix="platform-showcase"
              className="mt-6"
            >
              <Reveal
                key={platform.slug}
                direction="none"
                amount={0}
                className="surface overflow-hidden"
              >
                <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                  <div className="p-6 sm:p-9">
                    <span className="icon-box-platforms border-line-soft bg-sunken/70 text-brand-light inline-grid size-11 place-items-center rounded-xl border">
                      <Icon className="size-5" />
                    </span>
                    <p className="eyebrow mt-5">{platform.tagline}</p>
                    <h3 className="font-display text-ink mt-2 text-2xl font-semibold sm:text-3xl">
                      {platform.name}
                    </h3>
                    <p className="text-muted mt-4 leading-relaxed">
                      {platform.body}
                    </p>

                    <p className="text-faint mt-6 font-mono text-[0.625rem] tracking-[0.14em] uppercase">
                      {t("home.platform.bestFor")}
                    </p>
                    <p className="text-ink mt-1.5 text-sm font-medium">
                      {platform.best}
                    </p>

                    <div className="mt-7 flex flex-wrap gap-3">
                      <ButtonLink href={signupUrl}>
                        {t("home.platform.openAccount")}
                        <ArrowRight />
                      </ButtonLink>
                      <ButtonLink
                        href={`/platforms#${platform.slug}`}
                        variant="outline"
                      >
                        {t("home.platform.detail")}
                      </ButtonLink>
                    </div>
                  </div>

                  <div className="border-line-soft bg-sunken/50 border-t p-6 sm:p-9 lg:border-t-0 lg:border-l">
                    <ul className="space-y-3">
                      {platform.features.map((feature) => (
                        <li key={feature} className="flex gap-3">
                          <Check className="text-mint mt-0.5 size-[17px] shrink-0" />
                          <span className="text-muted text-sm leading-relaxed">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <dl className="border-line mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-line">
                      {platform.spec.map((spec) => (
                        <div key={spec.label} className="bg-panel px-4 py-4">
                          <dt className="text-faint font-mono text-[0.5625rem] tracking-[0.12em] uppercase">
                            {spec.label}
                          </dt>
                          <dd className="readout text-ink mt-1.5 text-sm font-semibold">
                            {spec.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </Reveal>
            </TabPanel>
          );
        })}
      </Container>
    </Section>
  );
}
