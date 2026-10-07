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

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Markets",
    description: "Trade forex, precious metals, global indices, energies, crypto CFDs and share CFDs from a single account, with raw spreads and zero commission.",
    alternates: await routeAlternates("/trade"),
  };
}

export default function TradeHubPage() {
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
            <Badge tone="brand">Markets</Badge>
            <h1 className="text-h1 mt-6 max-w-4xl">
              All asset classes. One balance. One login.
            </h1>
            <p className="text-lead text-muted mt-6 max-w-2xl">
              {total} instruments across forex, metals, indices, energies,
              digital assets and share CFDs — all margined against the same
              account, with no per-class permissions to request and no
              transfers between products.
            </p>
          </Reveal>

          <Reveal delay={0.08} className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href={signupUrl} size="lg">
              Open an account
              <ArrowRight />
            </ButtonLink>
            <ButtonLink href="/products" variant="soft" size="lg">
              All instruments
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
