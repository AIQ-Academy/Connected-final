import { LiveTickerBar } from "@/components/market/live-ticker-bar";
import { loadQuotes } from "@/lib/quotes.server";
import { cn } from "@/lib/utils";

const TAPE_SYMBOLS = [
  "XAU/USD",
  "EUR/USD",
  "GBP/USD",
  "USD/JPY",
  "WTI",
  "NAS100",
  "BTC/USD",
  "ETH/USD",
  "XAG/USD",
  "SPX500",
];

/**
 * The site-wide live-pricing strip. Clicking a symbol opens an inline detail
 * panel without navigating away from the current page.
 */
export async function TickerTapeSection({
  tone = "default",
}: {
  tone?: "default" | "hero";
} = {}) {
  const { quotes } = await loadQuotes({ symbols: TAPE_SYMBOLS });

  return (
    <section
      id="site-live-prices"
      tabIndex={-1}
      aria-label="Live market tape"
      className={cn(
        "relative scroll-mt-4 border-b outline-none",
        tone === "hero"
          ? "dark border-white/15 bg-[var(--cf-hero-scrim-85)] backdrop-blur-xl"
          : "border-line-soft bg-raised/60",
      )}
    >
      <LiveTickerBar initialQuotes={quotes} />
    </section>
  );
}
