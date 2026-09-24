import { HeroScrollStage } from "@/components/sections/hero/scroll-stage";
import type { HeroTierOption } from "@/components/sections/hero/calculator";
import type { AccountTier } from "@/db/schema";

function toHeroTiers(tiers: AccountTier[]): HeroTierOption[] {
  return tiers.map((tier) => ({
    code: tier.code,
    name: tier.name,
    accountSize: tier.accountSize,
    price: tier.price,
    profitSplitPct: tier.profitSplitPct,
    isFeatured: tier.isFeatured,
  }));
}

/**
 * Funded landing hero — three full-screen panels over editorial desk photography.
 *
 * Powered by Swiper: commission → funding types → calculator, with built-in
 * locking and edge release into the rest of the page.
 */
export function Hero({ tiers }: { tiers: AccountTier[] }) {
  return <HeroScrollStage tiers={toHeroTiers(tiers)} />;
}
