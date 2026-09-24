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
 * A single hairline strip of live pricing directly under the hero — the
 * cheapest possible signal that the markets behind the offer are real.
 * Clicking a symbol expands an inline detail panel instead of navigating.
 */
export async function TickerTapeSection({
  tone = "default",
}: {
  tone?: "default" | "hero";
} = {}) {
  const { quotes } = await loadQuotes({ symbols: TAPE_SYMBOLS });

  return (
    <section
      id="after-hero"
      tabIndex={-1}
      aria-label="Live market tape"
      className={cn(
        "relative scroll-mt-4 border-b outline-none",
        tone === "hero"
          ? "dark border-white/15 bg-[#070a12]/88 backdrop-blur-xl"
          : "border-line-soft bg-raised/60",
      )}
    >
      <LiveTickerBar initialQuotes={quotes} />
    </section>
  );
}
