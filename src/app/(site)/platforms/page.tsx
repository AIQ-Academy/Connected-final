import type { Metadata } from "next";
import {
  ArrowRight,
  Apple,
  LayoutDashboard,
  Lock,
  Monitor,
  Repeat,
  Server,
  Smartphone,
  Zap,
} from "lucide-react";

import { PlatformComparison } from "@/components/platforms/platform-comparison";
import { PlatformPanel } from "@/components/platforms/platform-panel";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Aurora, GridBackdrop } from "@/components/ui/aurora";
import { Badge } from "@/components/ui/badge";
import { ButtonLink, buttonVariants } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { Table, TableShell, Td, Th, Tr } from "@/components/ui/data-table";
import { SectionHeading } from "@/components/ui/section-heading";
import { platforms } from "@/lib/content";
import { signupUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Trading Platforms",
  description:
    "MetaTrader 5, cTrader and the Web Terminal — all three connected to the same live account, with official MT5 downloads for Windows, iOS and Android.",
};

/**
 * Official MetaQuotes destinations — tested 2026-09-22.
 * Desktop is the Windows installer; mobile CDN routes resolve to the App Store
 * and Google Play without region-blocked intermediary pages.
 */
const mt5Downloads = [
  {
    platform: "Desktop Terminal",
    description: "Download the MT5 desktop application for Windows.",
    cta: "Download Desktop",
    href: "https://download.mql5.com/cdn/web/metaquotes.software.corp/mt5/mt5setup.exe",
    icon: Monitor,
  },
  {
    platform: "Mobile iOS",
    description: "Get the MT5 app for your iPhone or iPad.",
    cta: "Download for iOS",
    href: "https://download.mql5.com/cdn/mobile/mt5/ios",
    icon: Apple,
  },
  {
    platform: "Mobile Android",
    description: "Get the MT5 app for your Android device.",
    cta: "Download for Android",
    href: "https://download.mql5.com/cdn/mobile/mt5/android",
    icon: Smartphone,
  },
] as const;

const connectivity = [
  {
    icon: Server,
    title: "One account, three front ends",
    body: "Your positions, balance, equity and margin live on the bridge, not in the terminal. Open a position on the desktop platform and it is already there when you sign into the browser.",
  },
  {
    icon: Repeat,
    title: "Switch platforms whenever you like",
    body: "Changing platform on a live account is permitted at any time, and it does not reset your positions, your balance or your open orders.",
  },
  {
    icon: Zap,
    title: "Colocated execution",
    body: "Our matching infrastructure sits in Equinix LD4 in London, with points of presence in NY4 in New York and TY3 in Tokyo. Choose the closest one when you connect a VPS.",
  },
  {
    icon: Lock,
    title: "Encrypted end to end",
    body: "Every platform session is TLS-encrypted, and the portal supports two-factor authentication on both sign-in and payout requests.",
  },
] as const;

export default function PlatformsPage() {
  return (
    <>
      <PageHero />

      <Section className="pt-4 sm:pt-6 lg:pt-8">
        <Container className="space-y-24 lg:space-y-32">
          {platforms.map((platform, index) => (
            <PlatformPanel
              key={platform.slug}
              platform={platform}
              index={index}
            />
          ))}
        </Container>
      </Section>

      <Section
        id="compare"
        className="border-line-soft bg-raised/40 border-y"
      >
        <Container>
          <SectionHeading
            eyebrow="Side by side"
            title="Every capability, compared."
            lead="Execution quality is identical across the three — they share a bridge and a liquidity panel. What differs is the tooling wrapped around it."
          />
          <Reveal className="mt-12">
            <PlatformComparison />
          </Reveal>
          <p className="text-faint mt-4 text-xs">
            Spreads, commissions, leverage and risk limits do not vary by
            platform. Every plan includes all three at no extra cost.
          </p>
        </Container>
      </Section>

      <Section id="access">
        <Container>
          <SectionHeading
            eyebrow="MetaTrader 5"
            title="Access by device."
            lead="Official MetaQuotes installers for Windows, iPhone, iPad and Android. Server address and login still come from the client portal after you open an account."
            action={
              <ButtonLink href="/portal">
                Open the client portal
                <ArrowRight />
              </ButtonLink>
            }
          />

          <Reveal className="mt-12">
            <TableShell
              caption="MetaTrader 5 downloads by device"
              className="hidden sm:block"
            >
              <Table className="min-w-[640px]">
                <caption className="sr-only">
                  MetaTrader 5 downloads for desktop Windows, iOS and Android
                </caption>
                <thead>
                  <tr>
                    <Th className="pl-5">Platform</Th>
                    <Th>Description</Th>
                    <Th className="pr-5 text-right">Call to action</Th>
                  </tr>
                </thead>
                <tbody>
                  {mt5Downloads.map((row) => (
                    <Tr key={row.platform}>
                      <Td className="text-ink pl-5">
                        <span className="inline-flex items-center gap-3">
                          <row.icon
                            className="text-brand-light size-4 shrink-0"
                            aria-hidden="true"
                          />
                          <span className="font-medium">{row.platform}</span>
                        </span>
                      </Td>
                      <Td className="text-muted max-w-md text-[0.8125rem] leading-relaxed">
                        {row.description}
                      </Td>
                      <Td className="pr-5 text-right">
                        <a
                          href={row.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            buttonVariants({ variant: "soft", size: "sm" }),
                            "inline-flex",
                          )}
                        >
                          {row.cta}
                          <ArrowRight />
                        </a>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableShell>
          </Reveal>

          <StaggerGroup className="mt-12 grid gap-4 sm:hidden">
            {mt5Downloads.map((row) => (
              <StaggerItem
                key={row.platform}
                className="border-line-soft bg-panel rounded-2xl border p-5"
              >
                <div className="flex items-center gap-3">
                  <row.icon
                    className="text-brand-light size-4"
                    aria-hidden="true"
                  />
                  <h3 className="text-ink font-display text-sm font-semibold">
                    {row.platform}
                  </h3>
                </div>
                <p className="text-muted mt-3 text-sm leading-relaxed">
                  {row.description}
                </p>
                <a
                  href={row.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "soft", size: "sm" }),
                    "mt-4 inline-flex",
                  )}
                >
                  {row.cta}
                  <ArrowRight />
                </a>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <p className="text-faint mt-4 text-xs leading-relaxed">
            Links open MetaQuotes&rsquo; official MT5 destinations. Credentials
            and the trading-server address are issued in the portal — these
            downloads only install the terminal.
          </p>

          <Reveal delay={0.1}>
            <div className="border-line-soft bg-sunken/50 mt-6 flex flex-col gap-5 rounded-2xl border p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="flex items-start gap-4">
                <LayoutDashboard
                  className="text-brand-light mt-1 size-5 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-ink text-[0.9375rem] font-semibold">
                    Need an account?
                  </p>
                  <p className="text-muted mt-1.5 max-w-2xl text-sm leading-relaxed">
                    Live accounts get the same platform access the moment your
                    first deposit clears — on card and crypto that means
                    immediately.
                  </p>
                </div>
              </div>
              <ButtonLink href={signupUrl} className="shrink-0">
                Create account
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section
        id="connectivity"
        className="border-line-soft bg-raised/40 relative overflow-hidden border-y"
      >
        <Aurora intensity="subtle" />
        <Container className="relative">
          <SectionHeading
            eyebrow="Connectivity"
            title="The account is the constant."
            lead="A platform is a window onto your account, not a copy of it. That is what makes running two of them at once, or switching mid-session, a non-event."
          />

          <StaggerGroup className="mt-12 grid gap-5 md:grid-cols-2">
            {connectivity.map((item) => (
              <StaggerItem
                key={item.title}
                className="border-line-soft bg-panel rounded-2xl border p-6 sm:p-7"
              >
                <item.icon
                  className="text-brand-light size-5"
                  aria-hidden="true"
                />
                <h3 className="text-ink font-display mt-5 text-base font-semibold">
                  {item.title}
                </h3>
                <p className="text-muted mt-2.5 text-sm leading-relaxed">
                  {item.body}
                </p>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <Reveal delay={0.12}>
            <div className="border-line-soft bg-line-soft mt-6 grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-3">
              {[
                {
                  region: "London",
                  code: "Equinix LD4",
                  note: "Primary matching engine and the shortest path for European and Middle Eastern traders.",
                },
                {
                  region: "New York",
                  code: "Equinix NY4",
                  note: "Point of presence for the Americas, closest to the index and share CFD venues.",
                },
                {
                  region: "Tokyo",
                  code: "Equinix TY3",
                  note: "Asia-Pacific point of presence, covering the Sydney and Tokyo sessions.",
                },
              ].map((site) => (
                <div key={site.code} className="bg-panel p-6 sm:p-7">
                  <p className="text-faint font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
                    {site.region}
                  </p>
                  <p className="text-ink font-display mt-2 text-xl font-semibold">
                    {site.code}
                  </p>
                  <p className="text-muted mt-2 text-sm leading-relaxed">
                    {site.note}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </Section>

      <ConversionBand />
    </>
  );
}

function PageHero() {
  return (
    <section className="bg-noise relative overflow-hidden pt-14 pb-16 sm:pt-20 lg:pt-24 lg:pb-20">
      <Aurora intensity="strong" />
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
              06 / Platforms
            </span>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="text-h1 mt-6">Trading Platforms</h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="text-lead text-muted mt-6 max-w-2xl">
              Install a full trading terminal or work straight from the browser.
              Your positions, balance and risk rules stay in sync because all
              three are looking at the same account.
            </p>
          </Reveal>
          <Reveal delay={0.18} className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="#access" size="lg">
              Download MetaTrader 5
              <ArrowRight />
            </ButtonLink>
            <ButtonLink href="#compare" variant="soft" size="lg">
              Compare the three
            </ButtonLink>
          </Reveal>
        </div>

        <Reveal delay={0.24}>
          <div className="mt-14 grid gap-4 sm:grid-cols-3">
            {platforms.map((platform) => (
              <a
                key={platform.slug}
                href={`#${platform.slug}`}
                className="border-line-soft bg-panel/70 hover:border-brand-light/60 group rounded-2xl border p-5 backdrop-blur-sm transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink font-display text-base font-semibold">
                    {platform.name}
                  </span>
                  <Monitor
                    className="text-faint group-hover:text-brand-light size-4 transition-colors"
                    aria-hidden="true"
                  />
                </div>
                <Badge tone="neutral" className="mt-3">
                  {platform.tagline}
                </Badge>
              </a>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

function ConversionBand() {
  return (
    <Section className="relative overflow-hidden">
      <Aurora intensity="medium" />
      <Container className="relative">
        <div className="border-line-soft bg-panel/80 rounded-3xl border p-8 backdrop-blur-sm sm:p-12 lg:p-16">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.2fr)_auto]">
            <div>
              <span className="eyebrow">
                <span className="chev" />
                Still deciding
              </span>
              <h2 className="text-h2 mt-5 max-w-2xl">
                Not sure which platform fits your style?
              </h2>
              <p className="text-lead text-muted mt-5 max-w-xl">
                Every plan includes access to all three, and switching costs
                nothing at any point. Start with the one you already know and
                change your mind later.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <ButtonLink href={signupUrl} size="lg">
                Create account
                <ArrowRight />
              </ButtonLink>
              <ButtonLink href="/contact" variant="soft" size="lg">
                Ask an advisor
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
