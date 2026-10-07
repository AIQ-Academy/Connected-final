import type { Metadata } from "next";
import { routeAlternates } from "@/lib/i18n/metadata";

import { Aurora, GridBackdrop } from "@/components/ui/aurora";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Trading — Coming soon",
    description: "Live trading accounts are temporarily unavailable. Check back shortly.",
    alternates: await routeAlternates("/trading/coming-soon"),
  };
}

export default function TradingComingSoonPage() {
  return (
    <section className="bg-noise relative overflow-hidden py-24 sm:py-32">
      <Aurora intensity="medium" />
      <GridBackdrop />
      <Container className="relative max-w-2xl text-center">
        <span className="eyebrow justify-center">
          <span className="chev" />
          Trading
        </span>
        <h1 className="text-h1 mt-6">Live trading is coming back shortly</h1>
        <p className="text-lead text-muted mt-5">
          New account registration is temporarily paused while we complete
          scheduled maintenance. Existing clients can still reach the platform
          from the client portal.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/portal" size="lg">
            Go to client portal
          </ButtonLink>
          <ButtonLink href="/contact" variant="soft" size="lg">
            Contact the desk
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
