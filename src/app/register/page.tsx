import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { RegisterExperience } from "@/components/register/register-experience";
import type { WizardTier } from "@/components/register/register-wizard";
import { Aurora } from "@/components/ui/aurora";
import { Container } from "@/components/ui/container";
import { getAccountTiers, getSiteSettings } from "@/db/queries";
import {
  productComingSoonHref,
  productIsEnabled,
  type ProductKey,
} from "@/lib/products";

export const metadata: Metadata = {
  title: "Create your account",
  description:
    "Open a Connect Funded evaluation with AI-guided onboarding or the classic form. Choose an account from $10,000 to $200,000 and keep up to 90% of the profit.",
};

export const revalidate = 300;

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{
    tier?: string;
    mode?: string;
    type?: string;
  }>;
}) {
  const params = await searchParams;
  const flags = await getSiteSettings();

  const product: ProductKey = params.type === "broker" ? "broker" : "funded";
  const enabled = productIsEnabled(product, flags);
  if (!enabled) {
    // Product is disabled in admin; send user to the coming-soon landing.
    redirect(productComingSoonHref(product));
  }

  const tiers = await getAccountTiers();

  const wizardTiers: WizardTier[] = tiers.map((tier) => ({
    id: tier.id,
    code: tier.code,
    name: tier.name,
    accountSize: Number(tier.accountSize),
    price: Number(tier.price),
    phase1TargetPct: Number(tier.phase1TargetPct),
    phase2TargetPct: Number(tier.phase2TargetPct),
    maxDailyDrawdownPct: Number(tier.maxDailyDrawdownPct),
    maxOverallDrawdownPct: Number(tier.maxOverallDrawdownPct),
    minTradingDays: Number(tier.minTradingDays),
    profitSplitPct: Number(tier.profitSplitPct),
    payoutFrequency: tier.payoutFrequency,
    maxLeverage: tier.maxLeverage,
    isFeatured: tier.isFeatured,
  }));

  const initialMode = params.mode === "classic" ? "classic" : "ai";

  return (
    <div className="relative pt-10 pb-20 sm:pt-14">
      <Aurora className="opacity-70" />

      <Container>
        <div className="mb-9 max-w-2xl">
          <span className="eyebrow mb-4">
            <span className="chev" />
            Registration
          </span>
          <h1 className="text-h1">
            Start with an{" "}
            <span className="text-gradient">AI onboarding</span>
          </h1>
          <p className="text-lead text-muted mt-4">
            Chat through your evaluation setup, fill secure form cards for
            identity and terms, and land in the client portal ready for KYC and
            payment. Prefer a fixed wizard? Switch to the classic form anytime.
          </p>
          <p className="text-faint mt-3 text-[0.8125rem]">
            Already have an account?{" "}
            <Link
              href="/portal/login"
              className="text-brand-light underline-offset-4 hover:underline"
            >
              Sign in to the client portal
            </Link>
            .
          </p>
        </div>

        <RegisterExperience
          tiers={wizardTiers}
          initialTierCode={params.tier}
          initialMode={initialMode}
        />
      </Container>
    </div>
  );
}
