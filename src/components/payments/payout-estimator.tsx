"use client";

import { ArrowRight, Check } from "lucide-react";
import { useMemo, useState } from "react";

import { paymentMethods } from "@/lib/content";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/locale-provider";

/**
 * Business days it realistically takes each rail to land, used only to draw the
 * arrival estimate. Keyed by method name so it stays in step with the shared
 * payment content rather than duplicating the copy.
 */
const settlementDays: Record<string, { min: number; max: number }> = {
  "Visa & Mastercard": { min: 1, max: 3 },
  "Bank transfer (SEPA / SWIFT)": { min: 1, max: 3 },
  Skrill: { min: 0, max: 1 },
  Neteller: { min: 0, max: 1 },
  "USDT & USDC": { min: 0, max: 0 },
  Bitcoin: { min: 0, max: 0 },
  Ethereum: { min: 0, max: 0 },
};

const payoutRails = paymentMethods.filter(
  (method) => method.payout !== "Not available",
);

const presets = [1_500, 4_000, 8_500, 15_000];

const MIN_AMOUNT = 500;
const MAX_AMOUNT = 25_000;

/** Typical industry withdrawal charge per rail, which we cover instead of you. */
const typicalFee: Record<string, number> = {
  "Visa & Mastercard": 0.025,
  "Bank transfer (SEPA / SWIFT)": 0.015,
  Skrill: 0.02,
  Neteller: 0.02,
  "USDT & USDC": 0.01,
  Bitcoin: 0.01,
  Ethereum: 0.012,
};

function addBusinessDays(from: Date, days: number) {
  const date = new Date(from);
  let remaining = days;
  while (remaining > 0) {
    date.setUTCDate(date.getUTCDate() + 1);
    const day = date.getUTCDay();
    if (day !== 0 && day !== 6) remaining -= 1;
  }
  return date;
}

export function PayoutEstimator() {
  const { t, locale, direction, formatCurrency: formatAmount } = useLocale();
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(
    locale === "fr" ? "fr-FR" : locale === "ar" ? "ar" : "en-GB",
    { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" },
  ), [locale]);
  const [amount, setAmount] = useState(4_000);
  const [railName, setRailName] = useState(payoutRails[0]?.name ?? "");

  const rail = payoutRails.find((method) => method.name === railName);
  const window = settlementDays[railName] ?? { min: 1, max: 3 };
  const fee = (typicalFee[railName] ?? 0.02) * amount;
  const progress = ((amount - MIN_AMOUNT) / (MAX_AMOUNT - MIN_AMOUNT)) * 100;

  // Deferred until after hydration: the server and the browser can sit on
  // opposite sides of midnight UTC, which would otherwise mismatch.
  const hydrated = useHydrated();
  const arrival = useMemo(() => {
    if (!hydrated) return null;
    const start = addBusinessDays(new Date(), 1);
    return {
      earliest: addBusinessDays(start, window.min),
      latest: addBusinessDays(start, window.max),
    };
  }, [hydrated, window.min, window.max]);

  return (
    <div className="border-line-soft bg-panel overflow-hidden rounded-3xl border">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
        <div className="border-line-soft space-y-8 border-b p-6 sm:p-8 lg:border-e lg:border-b-0 lg:p-10">
          <div>
            <label
              htmlFor="payout-amount"
              className="text-faint font-mono text-[0.6875rem] tracking-[0.14em] uppercase"
            >
              {t("ui.payoutRequest")}
            </label>
            <output
              htmlFor="payout-amount"
              className="text-ink font-display tabular mt-3 block text-4xl font-semibold sm:text-5xl"
            >
              {formatAmount(amount, { decimals: 0 })}
            </output>
            <input
              id="payout-amount"
              type="range"
              min={MIN_AMOUNT}
              max={MAX_AMOUNT}
              step={250}
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value))}
              className="cf-range mt-6 w-full"
              style={{ ["--range-progress" as string]: `${progress}%` }}
              aria-valuetext={t("ui.payoutRequested").replace("{amount}", formatAmount(amount, { decimals: 0 }))}
            />
            <div className="text-faint mt-2 flex justify-between font-mono text-[0.6875rem]">
              <span>$500</span>
              <span>$25,000</span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  aria-pressed={amount === preset}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 font-mono text-[0.6875rem] tracking-[0.06em] transition-colors",
                    amount === preset
                      ? "border-brand/45 bg-brand/12 text-brand-light"
                      : "border-line text-muted hover:border-line-soft hover:text-ink",
                  )}
                >
                  {formatAmount(preset, { decimals: 0 })}
                </button>
              ))}
            </div>
          </div>

          <fieldset>
            <legend className="text-faint font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
              {t("ui.payoutRail")}
            </legend>
            <div className="mt-4 flex flex-wrap gap-2">
              {payoutRails.map((method) => (
                <button
                  key={method.name}
                  type="button"
                  onClick={() => setRailName(method.name)}
                  aria-pressed={railName === method.name}
                  className={cn(
                    "rounded-xl border px-3.5 py-2 text-[0.8125rem] transition-colors",
                    railName === method.name
                      ? "border-brand/45 bg-brand/12 text-brand-light"
                      : "border-line text-muted hover:border-line-soft hover:text-ink",
                  )}
                >
                  {method.name}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="bg-sunken/50 p-6 sm:p-8 lg:p-10">
          <p className="text-faint font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
            {t("ui.payoutReceive")}
          </p>
          <p className="text-mint font-display tabular mt-3 text-4xl font-semibold sm:text-5xl">
            {formatAmount(amount, { decimals: 0 })}
          </p>
          <p className="text-muted mt-3 text-sm leading-relaxed">
            {t("ui.payoutFeeNote").replace("{fee}", formatAmount(fee, { decimals: 2 }))}
          </p>

          <dl className="border-line-soft mt-7 space-y-4 border-t pt-6">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-muted text-[0.8125rem]">{t("ui.payoutApproval")}</dt>
              <dd className="text-ink font-mono text-[0.8125rem]">
                {t("ui.payoutSameDay")}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-muted text-[0.8125rem]">{t("ui.payoutTransferSpeed")}</dt>
              <dd className="text-ink font-mono text-[0.8125rem]">
                {rail?.payout ?? "—"}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-muted text-[0.8125rem]">{t("ui.payoutFee")}</dt>
              <dd className="text-mint font-mono text-[0.8125rem]">
                {formatAmount(0, { decimals: 2 })}
              </dd>
            </div>
          </dl>

          <div className="border-mint/25 bg-mint/5 mt-7 rounded-2xl border p-5">
            <p className="text-faint font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
              {t("ui.payoutArrival")}
            </p>
            <p className="text-ink mt-2.5 flex min-h-5 flex-wrap items-center gap-2 font-mono text-[0.8125rem]">
              {arrival ? (
                <>
                  <span>{dateFormatter.format(arrival.earliest)}</span>
                  {arrival.earliest.getTime() !== arrival.latest.getTime() && (
                    <>
                      <ArrowRight
                        className="text-faint size-3.5"
                        style={direction === "rtl" ? { transform: "scaleX(-1)" } : undefined}
                        aria-hidden="true"
                      />
                      <span>{dateFormatter.format(arrival.latest)}</span>
                    </>
                  )}
                </>
              ) : (
                <span className="text-faint">{t("ui.payoutCalculating")}</span>
              )}
            </p>
            <p className="text-faint mt-3 flex items-start gap-2 text-xs leading-relaxed">
              <Check className="text-mint mt-px size-3.5 shrink-0" aria-hidden="true" />
              {t("ui.payoutArrivalNote")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
