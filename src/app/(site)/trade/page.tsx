import type { Metadata } from "next";
import { routeAlternates } from "@/lib/i18n/metadata";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { AssetClassGrid } from "@/components/sections/asset-class-grid";
import { OpenAccountSteps } from "@/components/sections/open-account-steps";
import { TradingConditionsSection } from "@/components/sections/trading-conditions";
import { GridBackdrop } from "@/components/ui/aurora";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { assetClassList, instrumentCountForClass } from "@/lib/asset-classes";
import { signupUrl } from "@/lib/site";
import { getServerLocale } from "@/lib/i18n/server";
import { pageCopy } from "@/lib/i18n/page-copy";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return {
    title: pageCopy(locale, "tradeHub.badge"),
    description: pageCopy(locale, "tradeHub.metaDescription"),
    alternates: await routeAlternates("/trade"),
  };
}

export default async function TradeHubPage() {
  const locale = await getServerLocale();
  const t = (key: Parameters<typeof pageCopy>[1]) => pageCopy(locale, key);
  const total = assetClassList.reduce(
    (sum, asset) => sum + instrumentCountForClass(asset.slug),
    0,
  );

  return (
    <>
      <Section
        data-hero-stage=""
        className="bg-deep isolate overflow-hidden pt-32 sm:pt-40"
      >
        <GridBackdrop className="opacity-70" />
        <Container className="relative">
          <Reveal>
            <Badge tone="brand">{t("tradeHub.badge")}</Badge>
            <h1 className="text-h1 mt-6 max-w-4xl">
              {t("tradeHub.title")}
            </h1>
            <p className="text-lead text-muted mt-6 max-w-2xl">
              {t("tradeHub.lead").replace("{total}", String(total))}
            </p>
          </Reveal>

          <Reveal delay={0.08} className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href={signupUrl} size="lg">
              {t("tradeHub.openAccount")}
              <ArrowRight />
            </ButtonLink>
            <ButtonLink href="/products" variant="soft" size="lg">
              {t("tradeHub.allInstruments")}
            </ButtonLink>
          </Reveal>
        </Container>
      </Section>

      <AssetClassGrid id="markets" heading={false} />
      <TradingConditionsSection />
      <OpenAccountSteps />
    </>
  );
}
