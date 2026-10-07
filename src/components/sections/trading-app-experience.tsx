"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Bot,
  CandlestickChart,
  Check,
  ChevronRight,
  CircleDollarSign,
  Gauge,
  LayoutGrid,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import { cn } from "@/lib/utils";

type ViewKey = "markets" | "charts" | "risk" | "assistant";

type QuoteRow = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  color: string;
  values: number[];
};

const views: { key: ViewKey; label: string; icon: typeof Activity }[] = [
  { key: "markets", label: "Markets", icon: LayoutGrid },
  { key: "charts", label: "Charts", icon: CandlestickChart },
  { key: "risk", label: "Risk tools", icon: ShieldCheck },
  { key: "assistant", label: "AI assistant", icon: Bot },
];

const seedQuotes: QuoteRow[] = [
  { symbol: "XAU/USD", name: "Gold", price: 2654.82, change: 0.86, color: "var(--cf-brand-light)", values: [31, 38, 34, 46, 42, 54, 49, 65, 57, 72, 68, 82] },
  { symbol: "EUR/USD", name: "Euro / US Dollar", price: 1.08462, change: 0.24, color: "var(--cf-brand-light)", values: [70, 65, 72, 62, 68, 64, 75, 70, 78, 74, 83, 88] },
  { symbol: "NAS100", name: "Nasdaq 100", price: 18426.3, change: -0.31, color: "var(--cf-brand-light)", values: [88, 82, 85, 75, 72, 76, 66, 70, 61, 64, 56, 60] },
  { symbol: "BTC/USD", name: "Bitcoin", price: 64182.5, change: 1.42, color: "var(--cf-accent)", values: [42, 48, 45, 58, 53, 64, 60, 70, 66, 79, 74, 90] },
];

function formatPrice(value: number, symbol: string) {
  if (symbol === "EUR/USD") return value.toFixed(5);
  if (symbol === "BTC/USD") return value.toLocaleString("en-US", { maximumFractionDigits: 1 });
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function TradingAppExperience() {
  const [active, setActive] = useState<ViewKey>("markets");
  const [quotes, setQuotes] = useState(seedQuotes);
  const [selected, setSelected] = useState("XAU/USD");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setQuotes((current) => current.map((quote) => {
        const direction = Math.random() > 0.48 ? 1 : -1;
        const move = quote.symbol === "BTC/USD" ? 12.5 : quote.symbol === "EUR/USD" ? 0.00012 : 0.42;
        return {
          ...quote,
          price: quote.price + direction * move,
          change: quote.change + direction * (quote.symbol === "BTC/USD" ? 0.03 : 0.01),
          values: [...quote.values.slice(1), Math.max(18, Math.min(94, quote.values.at(-1)! + direction * (2 + Math.random() * 4)))],
        };
      }));
    }, 2600);
    return () => window.clearInterval(timer);
  }, []);

  const selectedQuote = quotes.find((quote) => quote.symbol === selected) ?? quotes[0];

  return (
    <div className="trading-horizon relative overflow-hidden rounded-[2rem] border border-line p-3 shadow-[0_35px_120px_-55px_rgb(var(--cf-brand-glow)/.55)] sm:p-5 lg:p-7">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-32 size-96 rounded-full bg-[var(--cf-brand)]/20 blur-3xl" />
      <div className="relative grid gap-5 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <div className="rounded-[1.4rem] border border-white/10 bg-[var(--cf-terminal-glass-80)] p-3 backdrop-blur-xl">
          <div className="flex items-center gap-3 border-b border-white/10 px-3 pb-4 pt-2">
            <span className="grid size-9 place-items-center rounded-xl bg-[var(--cf-brand)] shadow-[0_0_24px_rgb(var(--cf-brand-glow)/.5)]"><Activity className="size-4 text-white" /></span>
            <div><p className="text-[.68rem] font-semibold tracking-[.15em] text-white uppercase">Connect desk</p><p className="text-[.65rem] text-white/40">MT5-connected workspace</p></div>
          </div>
          <div className="mt-4 space-y-1" role="tablist" aria-label="Trading app views">
            {views.map((view) => {
              const Icon = view.icon;
              return <button key={view.key} type="button" role="tab" aria-selected={active === view.key} onClick={() => setActive(view.key)} className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-3 text-start text-sm transition-all", active === view.key ? "bg-[var(--cf-brand)]/20 text-white shadow-[inset_0_0_0_1px_rgb(var(--cf-brand-glow)/.28)]" : "text-white/50 hover:bg-white/[.05] hover:text-white")}><Icon className={cn("size-4", active === view.key ? "text-[var(--cf-brand-light)]" : "text-white/40")} /><span>{view.label}</span>{active === view.key && <ChevronRight className="ms-auto size-3.5 text-[var(--cf-brand-light)]" />}</button>;
            })}
          </div>
          <div className="mt-6 rounded-xl border border-white/10 bg-black/10 p-3"><div className="flex items-center justify-between"><span className="text-[.62rem] tracking-[.12em] text-white/40 uppercase">Account equity</span><WalletCards className="size-3.5 text-[var(--cf-brand-light)]" /></div><p className="mt-2 font-mono text-xl text-white">$24,680.42</p><span className="mt-1 inline-flex items-center gap-1 text-[.68rem] text-[var(--cf-accent)]"><TrendingUp className="size-3" /> +4.82% this month</span></div>
        </div>

        <div className="min-w-0 rounded-[1.4rem] border border-white/10 bg-[var(--cf-terminal-glass-75)] p-4 backdrop-blur-xl sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5"><div><div className="flex items-center gap-2 text-[.65rem] tracking-[.16em] text-[var(--cf-brand-light)] uppercase"><span className="size-1.5 animate-pulse rounded-full bg-[var(--cf-accent)]" /> Live workspace</div><h3 className="mt-2 font-display text-2xl font-semibold tracking-[-.03em] text-white">{views.find((view) => view.key === active)?.label}</h3></div><span className="rounded-full border border-[var(--cf-accent)]/25 bg-[var(--cf-accent)]/10 px-3 py-1.5 font-mono text-[.65rem] text-[var(--cf-accent)]">STREAMING</span></div>
          {active === "markets" && <MarketsView quotes={quotes} selected={selected} onSelect={setSelected} />}
          {active === "charts" && <ChartsView quote={selectedQuote} />}
          {active === "risk" && <RiskView />}
          {active === "assistant" && <AssistantView />}
        </div>
      </div>
    </div>
  );
}

function MarketsView({ quotes, selected, onSelect }: { quotes: QuoteRow[]; selected: string; onSelect: (symbol: string) => void }) {
  return <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_15rem]"><div className="space-y-2">{quotes.map((quote) => <button key={quote.symbol} type="button" onClick={() => onSelect(quote.symbol)} className={cn("group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border p-3 text-start transition-all", selected === quote.symbol ? "border-[var(--cf-brand-light)]/40 bg-[var(--cf-brand)]/10" : "border-white/[.07] bg-white/[.025] hover:border-white/20 hover:bg-white/[.05]")}><span className="scan-line" /><span className="relative grid size-8 shrink-0 place-items-center rounded-lg bg-white/[.06] text-[.6rem] font-bold" style={{ color: quote.color }}>{quote.symbol.split("/")[0].slice(0, 2)}</span><span className="relative min-w-0 flex-1"><strong className="block text-sm text-white">{quote.symbol}</strong><small className="block truncate text-[.65rem] text-white/40">{quote.name}</small></span><span className="hidden h-7 w-24 items-end gap-0.5 sm:flex">{quote.values.map((value, index) => <i key={index} className="flex-1 rounded-t-sm" style={{ height: `${value}%`, backgroundColor: quote.color, opacity: .25 + index / 18 }} />)}</span><span className="relative text-end"><strong className="block font-mono text-xs text-white">{formatPrice(quote.price, quote.symbol)}</strong><small className={cn("font-mono text-[.65rem]", quote.change >= 0 ? "text-[var(--cf-accent)]" : "text-[var(--cf-red)]")}>{quote.change >= 0 ? "+" : ""}{quote.change.toFixed(2)}%</small></span></button>)}</div><div className="rounded-xl border border-white/[.08] bg-black/10 p-4"><p className="text-[.62rem] tracking-[.14em] text-white/40 uppercase">Portfolio pulse</p><div className="mt-5 flex items-end gap-1.5">{[35, 44, 39, 52, 48, 67, 61, 74, 70, 88].map((value, index) => <span key={index} className="flex-1 rounded-t-sm bg-gradient-to-t from-[var(--cf-brand)] to-[var(--cf-accent)]" style={{ height: `${value}px`, opacity: .35 + index / 16 }} />)}</div><div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3"><span className="text-xs text-white/45">Today</span><strong className="font-mono text-sm text-[var(--cf-accent)]">+$842.18</strong></div></div></div>;
}

function ChartsView({ quote }: { quote: QuoteRow }) {
  return <div className="mt-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><span className="text-xs text-white/45">Selected instrument</span><p className="mt-1 font-mono text-2xl text-white">{quote.symbol} <span className="text-sm text-[var(--cf-accent)]">+{quote.change.toFixed(2)}%</span></p></div><div className="flex gap-1 rounded-lg bg-white/[.05] p-1">{["1H", "4H", "1D", "1W"].map((range, index) => <button key={range} type="button" className={cn("rounded-md px-2.5 py-1 text-[.65rem]", index === 2 ? "bg-[var(--cf-brand)] text-white" : "text-white/45")}>{range}</button>)}</div></div><div className="relative mt-5 h-64 overflow-hidden rounded-xl border border-white/[.08] bg-[var(--cf-bg-sunken)] p-4"><div className="absolute inset-0 bg-[linear-gradient(rgb(var(--cf-brand-glow)/.07)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--cf-brand-glow)/.07)_1px,transparent_1px)] [background-size:48px_48px]" /><div className="relative flex h-full items-end gap-1">{quote.values.concat([76, 84, 80, 88]).map((value, index, values) => <div key={index} className="relative flex-1" style={{ height: `${value}%` }}><span className="absolute bottom-0 left-1/2 h-full w-px bg-[var(--cf-brand-light)]/25" /><span className="absolute left-[22%] right-[22%] top-[18%] h-[58%] rounded-sm border border-[var(--cf-brand-light)]/60 bg-[var(--cf-brand)]/25" /></div>)}<svg className="absolute inset-0 size-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100"><polyline fill="none" points="0,68 8,61 16,66 24,49 32,55 40,42 48,47 56,30 64,35 72,22 80,28 88,14 100,19" stroke="var(--cf-accent)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" vectorEffect="non-scaling-stroke" /></svg></div><div className="absolute bottom-3 left-4 rounded-md border border-[var(--cf-accent)]/20 bg-[var(--cf-accent)]/10 px-2 py-1 font-mono text-[.6rem] text-[var(--cf-accent)]">TradingView-style chart</div></div></div>;
}

function RiskView() {
  return <div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="rounded-xl border border-white/[.08] bg-black/10 p-5 sm:col-span-2"><div className="flex items-center justify-between"><div><p className="text-xs text-white/45">Position risk preview</p><p className="mt-1 text-lg font-semibold text-white">EUR/USD · 0.50 lots</p></div><Gauge className="size-5 text-[var(--cf-brand-light)]" /></div><div className="mt-6 h-3 overflow-hidden rounded-full bg-white/[.07]"><div className="h-full w-[34%] rounded-full bg-gradient-to-r from-[var(--cf-accent)] via-[var(--cf-brand-light)] to-[var(--cf-brand)]" /></div><div className="mt-2 flex justify-between font-mono text-[.65rem] text-white/40"><span>0% risk</span><span className="text-[var(--cf-accent)]">0.68% projected</span><span>2% limit</span></div></div>{[[CircleDollarSign, "Margin required", "$542.31"], [ShieldCheck, "Stop loss", "1.08240"], [WalletCards, "Take profit", "1.08910"], [Activity, "Risk / reward", "1 : 2.4"]].map(([Icon, label, value]) => <div key={String(label)} className="rounded-xl border border-white/[.08] bg-white/[.025] p-4"><Icon className="size-4 text-[var(--cf-brand-light)]" /><p className="mt-4 text-[.65rem] text-white/40">{String(label)}</p><strong className="mt-1 block font-mono text-lg text-white">{String(value)}</strong></div>)}</div>;
}

function AssistantView() {
  const prompts = ["What is gold sentiment today?", "Explain a pending order", "Summarize market risk"];
  return <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_14rem]"><div className="rounded-xl border border-white/[.08] bg-black/10 p-4"><div className="flex items-center gap-3 border-b border-white/10 pb-4"><span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-[var(--cf-brand)] to-[var(--cf-accent)]"><Sparkles className="size-4 text-[var(--cf-bg-sunken)]" /></span><div><p className="text-sm font-semibold text-white">Connect AI assistant</p><p className="text-[.65rem] text-white/40">Grounded market education, not trade signals</p></div></div><div className="mt-5 space-y-3"><div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-white/[.06] px-4 py-3 text-sm leading-relaxed text-white/75">Ask me about a market concept, the latest quote, platform tools, or what an economic event means.</div><div className="ms-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-[var(--cf-brand)]/20 px-4 py-3 text-sm leading-relaxed text-[var(--cf-text)]">What should I check before placing a gold trade?</div><div className="max-w-[90%] rounded-2xl rounded-tl-sm border border-[var(--cf-accent)]/15 bg-[var(--cf-accent)]/[.06] px-4 py-3 text-sm leading-relaxed text-white/75">Review the live quote, define your invalidation level, calculate margin, and set a risk limit before opening the order.</div></div></div><div><p className="text-[.62rem] tracking-[.14em] text-white/40 uppercase">Try a prompt</p><div className="mt-3 space-y-2">{prompts.map((prompt) => <button key={prompt} type="button" className="flex w-full items-center justify-between rounded-lg border border-white/[.08] bg-white/[.025] px-3 py-2.5 text-start text-xs text-white/60 transition-colors hover:border-[var(--cf-brand-light)]/35 hover:text-white">{prompt}<ChevronRight className="size-3 text-[var(--cf-brand-light)]" /></button>)}</div><div className="mt-5 flex items-center gap-2 text-[.65rem] text-white/40"><Check className="size-3.5 text-[var(--cf-accent)]" /> Assistant is available from the site chat</div></div></div>;
}
