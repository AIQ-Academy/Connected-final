"use client";

import { AlertTriangle, Calculator, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/components/i18n/locale-provider";
import { TabList } from "@/components/ui/tabs";
import { assetClassList } from "@/lib/asset-classes";
import { instrumentSeed } from "@/db/seed-data";
import { anchorPrices, decimalsForPip, type AssetClass } from "@/lib/market";
import { cn } from "@/lib/utils";

/**
 * Contract size per lot, by asset class. This is the single number that turns
 * "1 lot" into an actual quantity, and it is the thing most position
 * calculators get wrong by assuming 100,000 everywhere.
 */
const CONTRACT_SIZE: Record<AssetClass, number> = {
  forex: 100_000,
  metals: 100,
  commodities: 1_000,
  indices: 10,
  crypto: 1,
  stocks: 100,
};

const CONTRACT_UNIT: Record<AssetClass, string> = {
  forex: "units of base currency",
  metals: "ounces",
  commodities: "barrels / MMBtu",
  indices: "index points",
  crypto: "coins",
  stocks: "shares",
};

const CALCULATOR_LEVERAGE: Record<AssetClass, number> = {
  forex: 10,
  metals: 20,
  indices: 20,
  crypto: 20,
  stocks: 20,
  commodities: 20,
};

type Direction = "buy" | "sell";

/** Rough USD value of one unit of the quote currency, for pip-value maths. */
function quoteToUsdRate(symbol: string, price: number) {
  // For USD-quoted symbols (EUR/USD, XAU/USD, BTC/USD, indices, shares) the
  // quote currency is already USD, so the rate is 1.
  if (!symbol.includes("/")) return 1;
  const quote = symbol.split("/")[1];
  if (quote === "USD") return 1;
  // USD/XXX pairs: one unit of XXX is worth 1/price dollars.
  if (symbol.startsWith("USD/")) return 1 / price;
  // Cross pairs such as EUR/GBP and GBP/JPY — price the quote leg off its own
  // dollar anchor where we have one, and fall back to parity otherwise.
  const usdQuote = anchorPrices[`USD/${quote}`];
  if (usdQuote) return 1 / usdQuote;
  const quoteUsd = anchorPrices[`${quote}/USD`];
  if (quoteUsd) return quoteUsd;
  return 1;
}

export function PositionCalculator({
  defaultSymbol = "EUR/USD",
  compact = false,
}: {
  defaultSymbol?: string;
  compact?: boolean;
}) {
  const { formatCurrency: localCurrency, formatNumber: localNumber, t, locale } = useLocale();
  const assetLabels = {
    forex: t("asset.forex"),
    metals: t("asset.metals"),
    commodities: t("asset.commodities"),
    indices: t("asset.indices"),
    crypto: t("asset.crypto"),
    stocks: t("asset.stocks"),
  } satisfies Record<AssetClass, string>;
  const contractUnits: Record<AssetClass, { ar: string; fr: string }> = {
    forex: { ar: "وحدة من العملة الأساسية", fr: "unités de devise de base" },
    metals: { ar: "أونصة", fr: "onces" },
    commodities: { ar: "برميل / وحدة حرارية", fr: "barils / MMBtu" },
    indices: { ar: "نقطة مؤشر", fr: "points d’indice" },
    crypto: { ar: "عملة رقمية", fr: "cryptomonnaies" },
    stocks: { ar: "سهم", fr: "actions" },
  };
  const [assetClass, setAssetClass] = useState<AssetClass>(
    instrumentSeed.find((i) => i.symbol === defaultSymbol)?.assetClass ??
      "forex",
  );
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [direction, setDirection] = useState<Direction>("buy");
  const [lots, setLots] = useState(1);
  const [balance, setBalance] = useState(10_000);
  const [stopPips, setStopPips] = useState(25);
  const [targetPips, setTargetPips] = useState(50);

  const instrument = useMemo(
    () => instrumentSeed.find((i) => i.symbol === symbol) ?? instrumentSeed[0],
    [symbol],
  );

  const symbolsInClass = useMemo(
    () => instrumentSeed.filter((i) => i.assetClass === assetClass),
    [assetClass],
  );

  const result = useMemo(() => {
    const price = anchorPrices[instrument.symbol] ?? 1;
    const contract = CONTRACT_SIZE[instrument.assetClass];
    const units = lots * contract;

    // Notional is what the position controls; margin is what it costs you.
    const notional = units * price;
    const maxLeverage = CALCULATOR_LEVERAGE[instrument.assetClass];
    const effectiveLeverage = maxLeverage;
    const margin = notional / effectiveLeverage;

    // One pip moves the position by (pipSize × units), expressed in the quote
    // currency, then converted to USD.
    const pipValue =
      instrument.pipSize * units * quoteToUsdRate(instrument.symbol, price);

    const riskAmount = pipValue * stopPips;
    const rewardAmount = pipValue * targetPips;
    const riskPct = balance > 0 ? (riskAmount / balance) * 100 : 0;
    const rr = stopPips > 0 ? targetPips / stopPips : 0;

    const spreadCost = pipValue * instrument.baseSpread;
    const decimals = decimalsForPip(instrument.pipSize);
    const stopPrice =
      direction === "buy"
        ? price - stopPips * instrument.pipSize
        : price + stopPips * instrument.pipSize;
    const targetPrice =
      direction === "buy"
        ? price + targetPips * instrument.pipSize
        : price - targetPips * instrument.pipSize;

    return {
      price,
      units,
      notional,
      margin,
      pipValue,
      riskAmount,
      rewardAmount,
      riskPct,
      rr,
      spreadCost,
      decimals,
      stopPrice,
      targetPrice,
      effectiveLeverage,
      maxLeverage,
      freeMargin: balance - margin,
    };
  }, [instrument, lots, balance, stopPips, targetPips, direction]);

  function reset() {
    setAssetClass("forex");
    setSymbol("EUR/USD");
    setDirection("buy");
    setLots(1);
    setBalance(10_000);
    setStopPips(25);
    setTargetPips(50);
  }

  const overRisked = result.riskPct > 2;
  const overMargined = result.freeMargin < 0;

  return (
    <div className="surface overflow-hidden">
      <div className="border-line-soft flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 sm:px-7">
        <div className="flex items-center gap-2.5">
          <span className="bg-brand/12 text-brand-light grid size-9 place-items-center rounded-lg">
            <Calculator className="size-[18px]" />
          </span>
          <div>
            <p className="font-display text-ink text-sm font-semibold">
              {t("calculator.title")}
            </p>
            <p className="text-faint font-mono text-[0.625rem] tracking-[0.12em] uppercase">
              {t("calculator.subtitle")}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={reset}
          className="text-muted hover:text-ink border-line inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.75rem] font-medium transition-colors"
        >
          <RotateCcw className="size-3.5" />
          {t("calculator.reset")}
        </button>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        {/* ---------------- Inputs ---------------- */}
        <div className="border-line-soft space-y-6 p-5 sm:p-7 lg:border-r">
          <div>
            <label className="text-faint font-mono text-[0.625rem] tracking-[0.14em] uppercase">
              {t("calculator.market")}
            </label>
            <div className="mt-2.5">
              <TabList
                label={t("calculator.assetClass")}
                size="sm"
                idPrefix="calc-class"
                value={assetClass}
                onValueChange={(next) => {
                  const cls = next as AssetClass;
                  setAssetClass(cls);
                  const first = instrumentSeed.find(
                    (i) => i.assetClass === cls,
                  );
                  if (first) setSymbol(first.symbol);
                }}
                items={assetClassList.map((asset) => ({
                  value: asset.slug,
                  label: assetLabels[asset.slug],
                }))}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("calculator.instrument")}>
              <select
                value={symbol}
                onChange={(event) => setSymbol(event.target.value)}
                className="border-line bg-sunken/60 text-ink focus:border-brand-light h-11 w-full rounded-xl border px-3 text-sm outline-none transition-colors"
              >
                {symbolsInClass.map((item) => (
                  <option key={item.symbol} value={item.symbol}>
                    {item.symbol} — {locale === "ar" && item.symbol === "EUR/USD" ? "اليورو / الدولار الأمريكي" : locale === "fr" && item.symbol === "EUR/USD" ? "euro / dollar américain" : item.displayName}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={t("calculator.direction")}>
              <div className="border-line bg-sunken/60 grid h-11 grid-cols-2 gap-1 rounded-xl border p-1">
                {(["buy", "sell"] as const).map((side) => (
                  <button
                    key={side}
                    type="button"
                    onClick={() => setDirection(side)}
                    aria-pressed={direction === side}
                    className={cn(
                      "rounded-lg text-[0.8125rem] font-semibold capitalize transition-colors",
                      direction === side
                        ? side === "buy"
                          ? "bg-mint/15 text-mint"
                          : "bg-loss/15 text-loss"
                        : "text-muted hover:text-ink",
                    )}
                  >
                    {t(side === "buy" ? "calculator.buy" : "calculator.sell")}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <NumberField
            label={t("calculator.positionSize")}
            suffix={t("calculator.lots")}
            value={lots}
            min={0.01}
            max={100}
            step={0.01}
            onChange={setLots}
            hint={`${localNumber(result.units, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${locale === "en" ? CONTRACT_UNIT[instrument.assetClass] : contractUnits[instrument.assetClass][locale]}`}
          />

          <div>
            <label className="text-faint font-mono text-[0.625rem] tracking-[0.14em] uppercase">
              {t("calculator.leverage")}
            </label>
            <div className="mt-2.5">
              <span className="readout inline-flex rounded-lg border border-brand bg-brand/12 px-3 py-1.5 text-[0.8125rem] text-brand-light">
                1:{result.maxLeverage}
              </span>
            </div>
            <p className="text-faint mt-2 text-[0.75rem]">
              {t("calculator.fixedFor").replace("{market}", assetLabels[assetClass])}
            </p>
          </div>

          <NumberField
            label={t("calculator.accountBalance")}
            prefix="$"
            value={balance}
            min={100}
            max={1_000_000}
            step={100}
            onChange={setBalance}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              label={t("calculator.stopLoss")}
              suffix={t("calculator.pips")}
              value={stopPips}
              min={1}
              max={2000}
              step={1}
              onChange={setStopPips}
              hint={`@ ${localNumber(result.stopPrice, { minimumFractionDigits: result.decimals, maximumFractionDigits: result.decimals })}`}
            />
            <NumberField
              label={t("calculator.takeProfit")}
              suffix={t("calculator.pips")}
              value={targetPips}
              min={1}
              max={5000}
              step={1}
              onChange={setTargetPips}
              hint={`@ ${localNumber(result.targetPrice, { minimumFractionDigits: result.decimals, maximumFractionDigits: result.decimals })}`}
            />
          </div>
        </div>

        {/* ---------------- Output ---------------- */}
        <div className="bg-sunken/50 p-5 sm:p-7">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-faint font-mono text-[0.625rem] tracking-[0.14em] uppercase">
              {t("calculator.referencePrice")}
            </p>
            <p className="readout text-ink text-lg font-semibold">
              {localNumber(result.price, { minimumFractionDigits: result.decimals, maximumFractionDigits: result.decimals })}
            </p>
          </div>

          <dl className="mt-5 space-y-px">
            <Row
              term={t("calculator.notional")}
              value={localCurrency(result.notional, { decimals: 0 })}
            />
            <Row
              term={t("calculator.marginRequired")}
              value={localCurrency(result.margin, { decimals: 2 })}
              tone="brand"
            />
            <Row
              term={t("calculator.freeMargin")}
              value={localCurrency(result.freeMargin, { decimals: 2 })}
              tone={overMargined ? "loss" : "default"}
            />
            <Row
              term={t("calculator.pipValue")}
              value={`${localCurrency(result.pipValue, { decimals: 2 })} / ${t("calculator.pips")}`}
            />
            <Row
              term={t("calculator.spreadCost")}
              value={localCurrency(result.spreadCost, { decimals: 2 })}
            />
          </dl>

          <div className="border-line-soft mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-line">
            <div className="bg-panel p-4">
              <p className="text-faint font-mono text-[0.5625rem] tracking-[0.12em] uppercase">
                {t("calculator.lossAtStop")}
              </p>
              <p className="readout text-loss mt-1.5 text-xl font-semibold">
                −{localCurrency(result.riskAmount, { decimals: 2 })}
              </p>
              <p className="text-faint mt-1 text-[0.75rem]">
                {localNumber(result.riskPct, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% {t("calculator.ofBalance")}
              </p>
            </div>
            <div className="bg-panel p-4">
              <p className="text-faint font-mono text-[0.5625rem] tracking-[0.12em] uppercase">
                {t("calculator.profitAtTarget")}
              </p>
              <p className="readout text-mint mt-1.5 text-xl font-semibold">
                +{localCurrency(result.rewardAmount, { decimals: 2 })}
              </p>
              <p className="text-faint mt-1 text-[0.75rem]">
                {localNumber(result.rr, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}:1 {t("calculator.rewardRisk")}
              </p>
            </div>
          </div>

          {/* Risk bar — 2% of balance is the reference line most risk models
              use, so the bar is scaled against it rather than against 100%. */}
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <p className="text-faint font-mono text-[0.5625rem] tracking-[0.12em] uppercase">
                {t("calculator.riskVsReference")}
              </p>
              <Badge tone={overRisked ? "loss" : "mint"}>
                {overRisked ? t("calculator.above") : t("calculator.within")}
              </Badge>
            </div>
            <div className="bg-sunken mt-2 h-2 overflow-hidden rounded-full">
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-500",
                  overRisked ? "bg-loss" : "bg-mint",
                )}
                style={{
                  width: `${Math.min(100, (result.riskPct / 2) * 100)}%`,
                }}
              />
            </div>
          </div>

          {(overRisked || overMargined) && (
            <div className="border-amber/35 bg-amber/10 mt-5 flex gap-2.5 rounded-xl border p-3.5">
              <AlertTriangle className="text-amber mt-0.5 size-4 shrink-0" />
              <p className="text-muted text-[0.8125rem] leading-relaxed">
                {overMargined
                  ? t("calculator.marginWarning")
                  : t("calculator.riskWarning").replace("{risk}", localNumber(result.riskPct, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
              </p>
            </div>
          )}

          {!compact && (
            <p className="text-faint mt-5 text-[0.75rem] leading-relaxed">
              {t("calculator.indicativeNote")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-faint font-mono text-[0.625rem] tracking-[0.14em] uppercase">
        {label}
      </label>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  prefix,
  suffix,
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-faint font-mono text-[0.625rem] tracking-[0.14em] uppercase">
          {label}
        </label>
        {hint && (
          <span className="text-faint readout text-[0.6875rem]">{hint}</span>
        )}
      </div>
      <div className="border-line bg-sunken/60 focus-within:border-brand-light mt-2.5 flex h-11 items-center gap-1 rounded-xl border px-3 transition-colors">
        {prefix && <span className="text-faint text-sm">{prefix}</span>}
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (Number.isNaN(next)) return;
            onChange(Math.min(max, Math.max(min, next)));
          }}
          className="readout text-ink w-full bg-transparent text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        {suffix && <span className="text-faint text-sm">{suffix}</span>}
      </div>
    </div>
  );
}

function Row({
  term,
  value,
  tone = "default",
}: {
  term: string;
  value: string;
  tone?: "default" | "brand" | "loss";
}) {
  return (
    <div className="border-line-soft flex items-center justify-between gap-3 border-b py-2.5 last:border-b-0">
      <dt className="text-muted text-[0.8125rem]">{term}</dt>
      <dd
        className={cn(
          "readout text-sm font-semibold",
          tone === "brand" && "text-brand-light",
          tone === "loss" && "text-loss",
          tone === "default" && "text-ink",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
