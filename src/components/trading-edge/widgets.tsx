"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import type { TradingEdgeCopy } from "@/lib/i18n/trading-edge";
import type { Locale } from "@/lib/i18n/locale";

export function AssetFilter({ filters }: { filters: readonly string[] }) {
  const [selected, setSelected] = useState(0);
  return <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2" aria-label={filters[0]}>{filters.map((filter, index) => <button key={filter} type="button" aria-pressed={selected === index} onClick={() => setSelected(index)} className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-light ${selected === index ? "border-brand bg-brand text-white" : "border-line-soft bg-panel text-muted hover:border-brand-light/60 hover:text-ink"}`}>{filter}</button>)}</div>;
}

export function MarketInsightGrid({ quotes, categories, locale, labels, allLabel, sourceLabel }: {
  quotes: readonly { symbol: string; price: number; changePct: number }[];
  categories: readonly string[];
  locale: Locale;
  labels: TradingEdgeCopy["labels"];
  allLabel: string;
  sourceLabel: string;
}) {
  const [category, setCategory] = useState<string | null>(null);
  const number = new Intl.NumberFormat(locale === "ar" ? "ar" : locale === "fr" ? "fr-FR" : "en-US", { maximumFractionDigits: 4 });
  const filtered = category === null ? quotes : quotes.filter((quote) => {
    if (category === categories[0]) return quote.symbol === "XAU/USD";
    if (category === categories[1]) return quote.symbol.includes("/") && !["XAU/USD", "XAG/USD", "BTC/USD"].includes(quote.symbol);
    if (category === categories[2]) return quote.symbol.includes("BTC") || quote.symbol.includes("ETH");
    if (category === categories[3]) return quote.symbol === "XAG/USD";
    if (category === categories[4]) return ["NAS100", "SPX500", "US30", "GER40"].includes(quote.symbol);
    return ["WTI", "BRENT", "NATGAS"].includes(quote.symbol);
  });
  return <>
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2" aria-label={labels.marketStatus}>
      <button type="button" aria-pressed={category === null} onClick={() => setCategory(null)} className={`shrink-0 rounded-full border px-4 py-2 text-sm focus-visible:outline-2 ${category === null ? "border-brand bg-brand text-white" : "border-line-soft bg-panel text-muted"}`}>{allLabel}</button>
      {categories.map((item) => <button type="button" key={item} aria-pressed={category === item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full border px-4 py-2 text-sm focus-visible:outline-2 ${category === item ? "border-brand bg-brand text-white" : "border-line-soft bg-panel text-muted"}`}>{item}</button>)}
    </div>
    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((quote) => <article key={quote.symbol} className="cf-interactive-card rounded-2xl border border-line-soft bg-panel p-5 transition duration-300 hover:-translate-y-1 hover:shadow-lg"><div className="flex items-center justify-between gap-3"><h2 className="font-display text-lg font-semibold text-ink">{quote.symbol}</h2><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${quote.changePct >= 0 ? "bg-accent/10 text-accent" : "bg-loss/10 text-loss"}`}>{quote.changePct >= 0 ? "+" : ""}{quote.changePct.toFixed(2)}%</span></div><p className="mt-4 font-mono text-2xl tabular-nums text-ink">{number.format(quote.price)}</p><div className="mt-4 flex items-center justify-between border-t border-line-soft pt-3 text-xs"><span className="text-muted">{labels.sentiment}</span><span className="font-semibold text-ink">{labels.noData}</span></div><p className="mt-2 text-[11px] text-muted">{sourceLabel}</p></article>)}</div>
    {filtered.length === 0 && <p className="mt-6 rounded-xl border border-dashed border-line-soft p-6 text-sm text-muted">{labels.noData}</p>}
  </>;
}

export function RiskCalculator({ copy }: { copy: TradingEdgeCopy }) {
  const labels = copy.labels;
  const [balance, setBalance] = useState(10000);
  const [riskPct, setRiskPct] = useState(1);
  const [entry, setEntry] = useState(2000);
  const [stop, setStop] = useState(1990);
  const [target, setTarget] = useState(2020);
  const risk = Math.max(0, balance * riskPct / 100);
  const distance = Math.abs(entry - stop);
  const size = distance > 0 ? risk / distance : 0;
  const reward = size * Math.abs(target - entry);
  const rr = risk > 0 ? reward / risk : 0;
  const level = riskPct <= 0.5 ? labels.low : riskPct <= 1 ? labels.moderate : riskPct <= 2 ? labels.high : labels.extreme;
  const fields = [
    { label: labels.balance, value: balance, set: setBalance, min: 0, step: 100 },
    { label: labels.riskPct, value: riskPct, set: setRiskPct, min: 0, step: 0.1 },
    { label: labels.entryPrice, value: entry, set: setEntry, min: 0, step: "any" as const },
    { label: labels.stopLoss, value: stop, set: setStop, min: 0, step: "any" as const },
    { label: labels.takeProfit, value: target, set: setTarget, min: 0, step: "any" as const },
  ];
  return <div className="grid gap-7 rounded-3xl border border-line-soft bg-panel p-5 shadow-sm sm:p-7 lg:grid-cols-[1fr_0.9fr]">
    <div><div className="grid gap-4 sm:grid-cols-2">{fields.map((field) => <label key={field.label} className="grid gap-2 text-sm font-medium text-ink">{field.label}<input type="number" min={field.min} step={field.step} value={field.value} onChange={(event) => field.set(Math.max(0, Number(event.target.value) || 0))} className="min-h-11 rounded-xl border border-line-soft bg-bg px-3 text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand-light" /></label>)}</div><p className="mt-4 text-xs leading-relaxed text-muted">{copy.calculatorNote} {copy.disclaimer}</p></div>
    <div className="rounded-2xl border border-line-soft bg-sunken/50 p-5"><div className="flex items-center justify-between gap-3"><h3 className="font-display text-lg font-semibold text-ink">{labels.riskMeter}</h3><span className="rounded-full border border-brand/25 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand-light">{level}</span></div><div className="mt-5 grid grid-cols-2 gap-3">{[[labels.riskAmount, risk], [labels.potentialLoss, size * distance], [labels.potentialProfit, reward], [labels.positionSize, size]].map(([label, value]) => <div key={String(label)} className="rounded-xl border border-line-soft bg-panel p-4"><p className="text-xs text-muted">{label}</p><p className="mt-2 font-mono text-lg font-semibold tabular-nums text-ink">{Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p></div>)}</div><p className="mt-4 text-xs text-muted">{labels.rr}: <strong className="text-ink">1 : {rr.toFixed(2)}</strong></p></div>
  </div>;
}

type JournalTrade = {
  id: string; tradedAt: string; symbol: string; direction: "BUY" | "SELL"; strategy: string; timeframe: string;
  entryPrice: number; exitPrice: number; stopLoss: number; takeProfit: number; positionSize: number; profitLoss: number; profitLossCurrency: string;
};

export function JournalWorkspace({ locale, copy, mode }: { locale: Locale; copy: TradingEdgeCopy; mode: "journal" | "performance" }) {
  const [trades, setTrades] = useState<JournalTrade[]>([]);
  const [ready, setReady] = useState(false);
  const [signedOut, setSignedOut] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [review, setReview] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const labels = copy.labels;
  const language = locale === "ar" ? "ar" : locale === "fr" ? "fr-FR" : "en-US";

  async function refresh() {
    const response = await fetch("/api/trading-edge/journal", { cache: "no-store" });
    if (response.status === 401) { setSignedOut(true); setReady(true); return; }
    if (!response.ok) { setStorageError(true); setReady(true); return; }
    const data = await response.json() as { trades: JournalTrade[] };
    setTrades(data.trades);
    setStorageError(false);
    setReady(true);
  }
  useEffect(() => {
    let cancelled = false;
    fetch("/api/trading-edge/journal", { cache: "no-store" })
      .then(async (response) => {
        if (cancelled) return;
        if (response.status === 401) { setSignedOut(true); setReady(true); return; }
        if (!response.ok) { setStorageError(true); setReady(true); return; }
        const data = await response.json() as { trades: JournalTrade[] };
        if (cancelled) return;
        setTrades(data.trades);
        setStorageError(false);
        setReady(true);
      })
      .catch(() => { if (!cancelled) { setStorageError(true); setReady(true); } });
    return () => { cancelled = true; };
  }, []);

  const metrics = useMemo(() => {
    const sameCurrency = trades.length > 0 && trades.every((trade) => trade.profitLossCurrency === trades[0]?.profitLossCurrency);
    const wins = trades.filter((trade) => trade.profitLoss > 0);
    const losses = trades.filter((trade) => trade.profitLoss < 0);
    const grossWin = sameCurrency ? wins.reduce((sum, trade) => sum + trade.profitLoss, 0) : null;
    const grossLoss = sameCurrency ? Math.abs(losses.reduce((sum, trade) => sum + trade.profitLoss, 0)) : null;
    const net = sameCurrency ? trades.reduce((sum, trade) => sum + trade.profitLoss, 0) : null;
    const rewardRatios = trades.map((trade) => Math.abs(trade.takeProfit - trade.entryPrice) / Math.max(Math.abs(trade.entryPrice - trade.stopLoss), Number.EPSILON));
    const strategyTotals = new Map<string, number>();
    if (sameCurrency) trades.forEach((trade) => strategyTotals.set(trade.strategy, (strategyTotals.get(trade.strategy) ?? 0) + trade.profitLoss));
    const bestStrategy = [...strategyTotals.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    return { wins: wins.length, sameCurrency, currency: sameCurrency ? trades[0]?.profitLossCurrency : undefined, winRate: trades.length ? wins.length / trades.length * 100 : 0, factor: grossLoss && grossWin !== null ? grossWin / grossLoss : null, net, avgRR: rewardRatios.length ? rewardRatios.reduce((sum, value) => sum + value, 0) / rewardRatios.length : 0, bestStrategy };
  }, [trades]);

  async function saveTrade(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const numeric = (key: string) => Number(form.get(key));
    const date = String(form.get("date"));
    const payload = {
      tradedAt: new Date(`${date}T12:00:00.000Z`).toISOString(), symbol: String(form.get("symbol")).toUpperCase(), direction: String(form.get("direction")),
      strategy: String(form.get("strategy")), timeframe: String(form.get("timeframe")), entryPrice: numeric("entry"), exitPrice: numeric("exit"), stopLoss: numeric("stop"), takeProfit: numeric("target"), positionSize: numeric("size"),
      profitLoss: numeric("profitLoss"), profitLossCurrency: String(form.get("profitLossCurrency")).trim().toUpperCase(),
      marketCondition: String(form.get("condition") || ""), entryReason: String(form.get("entryReason") || ""), exitReason: String(form.get("exitReason") || ""), emotion: String(form.get("emotion") || ""), notes: String(form.get("notes") || ""), screenshotUrl: String(form.get("screenshot") || ""),
    };
    try {
      const response = await fetch("/api/trading-edge/journal", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json() as { message?: string };
      if (!response.ok) throw new Error(data.message || labels.error);
      setFormOpen(false); formElement.reset(); await refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : labels.error); }
    finally { setBusy(false); }
  }

  async function deleteTrade(id: string) {
    const response = await fetch(`/api/trading-edge/journal?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (response.ok) await refresh(); else setMessage(labels.error);
  }

  async function requestReview() {
    setReviewing(true); setMessage("");
    try {
      const response = await fetch("/api/trading-edge/review", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ locale }) });
      const data = await response.json() as { review?: string; message?: string };
      if (!response.ok) throw new Error(data.message || labels.error);
      setReview(data.review ?? "");
    } catch (error) { setMessage(error instanceof Error ? error.message : labels.error); }
    finally { setReviewing(false); }
  }

  if (!ready) return <p className="rounded-2xl border border-line-soft bg-panel p-6 text-muted" aria-live="polite">{labels.loading}</p>;
  if (signedOut) return <div className="rounded-3xl border border-line-soft bg-panel p-7 sm:p-10"><h2 className="font-display text-2xl font-semibold text-ink">{copy.login}</h2><p className="mt-3 max-w-2xl text-muted">{copy.loginLead}</p><Link href={`/portal/login?next=${encodeURIComponent(`/trading-edge/${mode}`)}`} className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-brand px-5 py-3 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-light">{copy.login}</Link></div>;
  if (storageError) return <p role="status" className="rounded-2xl border border-amber/40 bg-amber/10 p-5 text-ink">{copy.setup}</p>;

  const kpis = [
    [labels.totalTrades, String(trades.length)], [labels.winRate, trades.length ? `${metrics.winRate.toFixed(1)}%` : "—"],
    [labels.profitFactor, metrics.factor === null ? "—" : metrics.factor.toFixed(2)], [labels.avgRR, trades.length ? `1 : ${metrics.avgRR.toFixed(2)}` : "—"], [labels.drawdown, "—"], [labels.totalPL, metrics.net === null ? "—" : `${metrics.net.toFixed(2)} ${metrics.currency}`], [labels.bestStrategy, trades.length && metrics.sameCurrency ? metrics.bestStrategy : "—"],
  ];
  const cumulative = metrics.sameCurrency ? trades.slice().reverse().reduce<number[]>((series, trade) => [...series, (series.at(-1) ?? 0) + trade.profitLoss], [0]) : [];
  const strategyStats = Array.from(new Set(trades.map((trade) => trade.strategy))).map((strategy) => {
    const records = trades.filter((trade) => trade.strategy === strategy);
    return { strategy, rate: records.length ? records.filter((trade) => trade.profitLoss > 0).length / records.length * 100 : 0 };
  });

  return <div className="space-y-7">
    {message && <p role="status" className="rounded-xl border border-amber/35 bg-amber/10 p-4 text-sm text-ink">{message}</p>}
    {!metrics.sameCurrency && trades.length > 0 && <p role="status" className="rounded-xl border border-line-soft bg-sunken/50 p-4 text-sm text-muted">{copy.journalPL.mixed}</p>}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{kpis.map(([label, value]) => <div key={label} title={label === labels.drawdown ? labels.drawdownNote : undefined} className="rounded-2xl border border-line-soft bg-panel p-5"><p className="text-xs text-muted">{label}</p><p className="mt-3 font-mono text-2xl font-semibold tabular-nums text-ink">{value}</p>{label === labels.drawdown && <p className="mt-2 text-[11px] text-muted">{labels.drawdownNote}</p>}</div>)}</div>
    {mode === "journal" ? <section className="rounded-3xl border border-line-soft bg-panel p-5 sm:p-7" aria-labelledby="journal-table-title">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 id="journal-table-title" className="font-display text-xl font-semibold text-ink">{copy.pages.journal.title}</h2><p className="mt-1 text-sm text-muted">{labels.reason}</p></div><button type="button" onClick={() => setFormOpen((open) => !open)} className="min-h-11 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-light">{formOpen ? copy.cancel : `+ ${copy.addTrade}`}</button></div>
      {formOpen && <form onSubmit={saveTrade} className="mt-6 grid gap-4 rounded-2xl border border-line-soft bg-bg p-4 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">
        <Field label={labels.date} name="date" type="date" required />
        <Field label={labels.asset} name="symbol" placeholder="XAU/USD" required />
        <label className="grid gap-2 text-sm font-medium text-ink">{labels.direction}<select name="direction" className="min-h-11 rounded-xl border border-line-soft bg-panel px-3" defaultValue="BUY"><option value="BUY">{labels.buy}</option><option value="SELL">{labels.sell}</option></select></label>
        <Field label={labels.strategy} name="strategy" required />
        <Field label={labels.tradeTimeframe} name="timeframe" placeholder="1H" required />
        <Field label={labels.entryPrice} name="entry" type="number" step="any" min="0" required />
        <Field label={labels.exitPrice} name="exit" type="number" step="any" min="0" required />
        <Field label={labels.stopLoss} name="stop" type="number" step="any" min="0" required />
        <Field label={labels.takeProfit} name="target" type="number" step="any" min="0" required />
        <Field label={labels.size} name="size" type="number" step="any" min="0" required />
        <Field label={copy.journalPL.realized} name="profitLoss" type="number" step="any" required />
        <Field label={copy.journalPL.currency} name="profitLossCurrency" placeholder="USD" required />
        <Field label={labels.marketCondition} name="condition" />
        <Field label={labels.emotion} name="emotion" />
        <Field label={labels.entryReason} name="entryReason" />
        <Field label={labels.exitReason} name="exitReason" />
        <Field label={labels.screenshot} name="screenshot" type="url" />
        <label className="grid gap-2 text-sm font-medium text-ink sm:col-span-2">{labels.notes}<textarea name="notes" rows={3} className="rounded-xl border border-line-soft bg-panel px-3 py-2.5" /></label>
        <div className="flex items-end"><button disabled={busy} className="min-h-11 w-full rounded-xl bg-brand px-4 py-2.5 font-semibold text-white disabled:opacity-60">{busy ? labels.loading : copy.save}</button></div>
      </form>}
      {trades.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-line p-8 text-center"><h3 className="text-lg font-semibold text-ink">{copy.noTrades}</h3><p className="mx-auto mt-2 max-w-xl text-sm text-muted">{copy.noTradesLead}</p></div> : <div className="mt-6 overflow-x-auto rounded-2xl border border-line-soft"><table className="w-full min-w-[780px] text-start text-sm"><thead className="bg-sunken/70 text-xs text-muted"><tr>{[labels.date, labels.asset, labels.direction, labels.strategy, labels.entry, labels.exit, labels.result, ""].map((title, index) => <th key={`${title}-${index}`} className="px-4 py-3 text-start font-semibold">{title}</th>)}</tr></thead><tbody>{trades.map((trade) => <tr key={trade.id} className="border-t border-line-soft"><td className="px-4 py-3">{new Intl.DateTimeFormat(language, { dateStyle: "medium" }).format(new Date(trade.tradedAt))}</td><td className="px-4 py-3 font-semibold">{trade.symbol}</td><td className="px-4 py-3">{trade.direction === "BUY" ? labels.buy : labels.sell}</td><td className="px-4 py-3">{trade.strategy}</td><td className="px-4 py-3 font-mono">{trade.entryPrice}</td><td className="px-4 py-3 font-mono">{trade.exitPrice}</td><td className={`px-4 py-3 font-mono ${trade.profitLoss > 0 ? "text-accent" : trade.profitLoss < 0 ? "text-loss" : "text-muted"}`}>{trade.profitLoss.toFixed(2)} {trade.profitLossCurrency}</td><td className="px-4 py-3"><button type="button" onClick={() => void deleteTrade(trade.id)} className="rounded-lg px-2 py-1 text-xs text-muted hover:text-loss focus-visible:outline-2">{copy.remove}</button></td></tr>)}</tbody></table></div>}
    </section> : <PerformancePanels copy={copy} trades={trades} cumulative={cumulative} strategyStats={strategyStats} />}
    <section className="rounded-3xl border border-brand/25 bg-brand/5 p-5 sm:p-7"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="eyebrow">{mode === "journal" ? copy.aiTitle : copy.aiPerfTitle}</p><p className="mt-2 max-w-2xl text-sm text-muted">{copy.aiNote}</p><p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted">{copy.aiPrivacy}</p></div><button type="button" disabled={reviewing || trades.length === 0} onClick={() => void requestReview()} className="min-h-11 shrink-0 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50">{reviewing ? labels.loading : copy.report}</button></div>{review && <article className="mt-5 whitespace-pre-wrap rounded-2xl border border-line-soft bg-panel p-5 leading-relaxed text-ink">{review}</article>}{trades.length === 0 && <p className="mt-4 text-sm text-muted">{copy.reviewEmpty}</p>}</section>
  </div>;
}

function Field({ label, name, type = "text", placeholder, required = false, step, min }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean; step?: string; min?: string }) {
  return <label className="grid gap-2 text-sm font-medium text-ink">{label}<input name={name} type={type} placeholder={placeholder} required={required} step={step} min={min} className="min-h-11 rounded-xl border border-line-soft bg-panel px-3 text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand-light" /></label>;
}

function PerformancePanels({ copy, trades, cumulative, strategyStats }: { copy: TradingEdgeCopy; trades: JournalTrade[]; cumulative: number[]; strategyStats: { strategy: string; rate: number }[] }) {
  const labels = copy.labels;
  const min = Math.min(0, ...cumulative); const max = Math.max(1, ...cumulative); const span = max - min || 1;
  const points = cumulative.map((value, index) => `${cumulative.length > 1 ? index / (cumulative.length - 1) * 100 : 50},${92 - (value - min) / span * 84}`).join(" ");
  const sections = copy.pages.performance.charts;
  return <div className="grid gap-5 lg:grid-cols-2"><section className="rounded-3xl border border-line-soft bg-panel p-5"><h2 className="font-display text-lg font-semibold text-ink">{sections[0]}</h2>{cumulative.length ? <svg viewBox="0 0 100 100" role="img" aria-label={sections[0]} className="mt-4 h-52 w-full overflow-visible"><polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" className="text-brand-light" />{cumulative.map((value, index) => <circle key={index} cx={cumulative.length > 1 ? index / (cumulative.length - 1) * 100 : 50} cy={92 - (value - min) / span * 84} r="1.5" className="fill-brand" />)}</svg> : <p className="mt-4 text-sm text-muted">{trades.length ? copy.journalPL.mixed : labels.saveFirst}</p>}</section>
    <section className="rounded-3xl border border-line-soft bg-panel p-5"><h2 className="font-display text-lg font-semibold text-ink">{sections[1]}</h2>{trades.length ? <div className="mt-5 flex items-center gap-5"><div className="grid size-28 place-items-center rounded-full" style={{ background: `conic-gradient(var(--cf-accent) ${trades.filter((t) => t.profitLoss > 0).length / trades.length * 100}%, var(--cf-border-soft) 0)` }}><div className="grid size-20 place-items-center rounded-full bg-panel text-sm font-semibold text-ink">{trades.filter((t) => t.profitLoss > 0).length}/{trades.length}</div></div><p className="text-sm text-muted">{labels.winRate}: {(trades.filter((t) => t.profitLoss > 0).length / trades.length * 100).toFixed(1)}%</p></div> : <p className="mt-4 text-sm text-muted">{labels.saveFirst}</p>}</section>
    <section className="rounded-3xl border border-line-soft bg-panel p-5"><h2 className="font-display text-lg font-semibold text-ink">{sections[2]}</h2>{strategyStats.length ? <div className="mt-4 space-y-4">{strategyStats.map((item) => <div key={item.strategy}><div className="mb-1 flex justify-between gap-3 text-sm"><span className="text-ink">{item.strategy}</span><span className="font-mono text-muted">{item.rate.toFixed(0)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-sunken"><div className="h-full rounded-full bg-brand" style={{ width: `${item.rate}%` }} /></div></div>)}</div> : <p className="mt-4 text-sm text-muted">{labels.saveFirst}</p>}</section>
    <section className="rounded-3xl border border-line-soft bg-panel p-5"><h2 className="font-display text-lg font-semibold text-ink">{sections[3]}</h2>{trades.length ? <div className="mt-4 flex flex-wrap gap-2">{Array.from(new Set(trades.map((t) => t.symbol))).map((symbol) => <span key={symbol} className="rounded-full border border-line-soft px-3 py-1.5 text-sm text-ink">{symbol} · {trades.filter((t) => t.symbol === symbol).length}</span>)}</div> : <p className="mt-4 text-sm text-muted">{labels.saveFirst}</p>}<h3 className="mt-6 font-display text-lg font-semibold text-ink">{sections[4]}</h3><p className="mt-2 text-sm text-muted">{labels.noData}</p></section>
  </div>;
}
