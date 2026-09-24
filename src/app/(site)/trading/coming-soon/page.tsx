import type { Metadata } from "next";

import { Aurora, GridBackdrop } from "@/components/ui/aurora";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Trading — Coming soon",
  description:
    "Live trading accounts are temporarily unavailable. Check back shortly or talk to the desk.",
  alternates: { canonical: "/trading/coming-soon" },
};

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
          The live trading product is temporarily disabled. Check back soon, or
          talk to the desk while you wait.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/contact" size="lg">
            Contact the desk
          </ButtonLink>
          <ButtonLink href="/" variant="soft" size="lg">
            Back to home
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
