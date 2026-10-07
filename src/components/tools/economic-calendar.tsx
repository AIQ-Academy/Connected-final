"use client";

import { CalendarDays, Filter } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge, LiveDot } from "@/components/ui/badge";
import { TabList } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/**
 * A representative week of the releases that actually move a retail book.
 *
 * This is a *schedule*, not a data feed: times, currencies and impact ratings
 * are structural and repeat every month, while the actual prints are not shown
 * because we do not carry a consensus provider. Wiring a real feed means
 * replacing `EVENTS` and nothing else in this component.
 */
type Impact = "high" | "medium" | "low";

type CalendarEvent = {
  day: string;
  time: string;
  currency: string;
  region: "americas" | "europe" | "asia";
  title: string;
  impact: Impact;
  note: string;
};

const EVENTS: CalendarEvent[] = [
  {
    day: "Monday",
    time: "09:00",
    currency: "EUR",
    region: "europe",
    title: "ECB President speech",
    impact: "medium",
    note: "Watched for any change in the language around the terminal rate.",
  },
  {
    day: "Monday",
    time: "15:00",
    currency: "USD",
    region: "americas",
    title: "ISM Manufacturing PMI",
    impact: "high",
    note: "The 50 line is the reference; a sub-48 print usually bids the dollar.",
  },
  {
    day: "Tuesday",
    time: "02:30",
    currency: "AUD",
    region: "asia",
    title: "RBA rate decision",
    impact: "high",
    note: "AUD pairs and, by correlation, the metals complex.",
  },
  {
    day: "Tuesday",
    time: "13:30",
    currency: "CAD",
    region: "americas",
    title: "CPI (YoY)",
    impact: "medium",
    note: "USD/CAD, with a second-order effect on WTI.",
  },
  {
    day: "Wednesday",
    time: "13:30",
    currency: "USD",
    region: "americas",
    title: "CPI (YoY & core)",
    impact: "high",
    note: "The single largest scheduled mover on the board for FX and indices.",
  },
  {
    day: "Wednesday",
    time: "15:30",
    currency: "USD",
    region: "americas",
    title: "EIA crude oil inventories",
    impact: "high",
    note: "WTI and Brent, typically within the first ninety seconds.",
  },
  {
    day: "Wednesday",
    time: "19:00",
    currency: "USD",
    region: "americas",
    title: "FOMC rate decision & statement",
    impact: "high",
    note: "Followed by the press conference at 19:30, which often moves more.",
  },
  {
    day: "Thursday",
    time: "07:00",
    currency: "GBP",
    region: "europe",
    title: "BoE rate decision",
    impact: "high",
    note: "GBP crosses and the FTSE 100 in opposite directions.",
  },
  {
    day: "Thursday",
    time: "13:15",
    currency: "EUR",
    region: "europe",
    title: "ECB rate decision",
    impact: "high",
    note: "EUR/USD, the DAX, and the German curve.",
  },
  {
    day: "Thursday",
    time: "13:30",
    currency: "USD",
    region: "americas",
    title: "Initial jobless claims",
    impact: "medium",
    note: "A weekly read on the labour market between payrolls prints.",
  },
  {
    day: "Friday",
    time: "13:30",
    currency: "USD",
    region: "americas",
    title: "Non-Farm Payrolls",
    impact: "high",
    note: "Headline, unemployment rate and average hourly earnings all matter.",
  },
  {
    day: "Friday",
    time: "00:30",
    currency: "JPY",
    region: "asia",
    title: "Tokyo CPI",
    impact: "medium",
    note: "USD/JPY and the Nikkei, especially while BoJ policy is in flux.",
  },
  {
    day: "Friday",
    time: "15:00",
    currency: "USD",
    region: "americas",
    title: "UoM consumer sentiment",
    impact: "low",
    note: "Rarely a standalone mover; matters as a confirmation print.",
  },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

const impactTone: Record<Impact, "loss" | "amber" | "neutral"> = {
  high: "loss",
  medium: "amber",
  low: "neutral",
};

const impactDots: Record<Impact, number> = { high: 3, medium: 2, low: 1 };

export function EconomicCalendar({ compact = false }: { compact?: boolean }) {
  const [impact, setImpact] = useState<"all" | Impact>("all");
  const [region, setRegion] = useState<"all" | CalendarEvent["region"]>("all");

  const filtered = useMemo(
    () =>
      EVENTS.filter(
        (event) =>
          (impact === "all" || event.impact === impact) &&
          (region === "all" || event.region === region),
      ),
    [impact, region],
  );

  const byDay = useMemo(
    () =>
      DAYS.map((day) => ({
        day,
        events: filtered
          .filter((event) => event.day === day)
          .sort((a, b) => a.time.localeCompare(b.time)),
      })).filter((group) => group.events.length > 0),
    [filtered],
  );

  return (
    <div className="surface overflow-hidden">
      <div className="border-line-soft flex flex-wrap items-center justify-between gap-4 border-b px-5 py-4 sm:px-7">
        <div className="flex items-center gap-2.5">
          <span className="bg-brand/12 text-brand-light grid size-9 place-items-center rounded-lg">
            <CalendarDays className="size-[18px]" />
          </span>
          <div>
            <p className="font-display text-ink text-sm font-semibold">
              Economic calendar
            </p>
            <p className="text-faint font-mono text-[0.625rem] tracking-[0.12em] uppercase">
              Times shown in GMT
            </p>
          </div>
        </div>
        <span className="text-mint inline-flex items-center gap-2 font-mono text-[0.6875rem] tracking-[0.12em] uppercase">
          <LiveDot />
          {filtered.length} events
        </span>
      </div>

      <div className="border-line-soft flex flex-wrap items-center gap-3 border-b px-5 py-4 sm:px-7">
        <span className="text-faint inline-flex items-center gap-1.5 font-mono text-[0.625rem] tracking-[0.14em] uppercase">
          <Filter className="size-3.5" />
          Filter
        </span>
        <TabList
          label="Impact"
          size="sm"
          idPrefix="cal-impact"
          value={impact}
          onValueChange={(next) => setImpact(next as typeof impact)}
          items={[
            { value: "all", label: "All impact" },
            { value: "high", label: "High" },
            { value: "medium", label: "Medium" },
            { value: "low", label: "Low" },
          ]}
        />
        <TabList
          label="Region"
          size="sm"
          idPrefix="cal-region"
          value={region}
          onValueChange={(next) => setRegion(next as typeof region)}
          items={[
            { value: "all", label: "All regions" },
            { value: "americas", label: "Americas" },
            { value: "europe", label: "Europe" },
            { value: "asia", label: "Asia" },
          ]}
        />
      </div>

      <div className="divide-line-soft divide-y">
        {byDay.map((group) => (
          <div key={group.day}>
            <p className="bg-sunken/60 text-faint px-5 py-2 font-mono text-[0.625rem] tracking-[0.16em] uppercase sm:px-7">
              {group.day}
            </p>
            <ul className="divide-line-soft divide-y">
              {group.events.map((event) => (
                <li
                  key={`${event.day}-${event.time}-${event.title}`}
                  className="hover:bg-raised/60 group flex flex-wrap items-start gap-x-4 gap-y-2 px-5 py-4 transition-colors sm:px-7"
                >
                  <span className="readout text-ink w-14 shrink-0 text-sm font-semibold">
                    {event.time}
                  </span>

                  <span className="border-line text-muted w-12 shrink-0 rounded-md border py-0.5 text-center font-mono text-[0.6875rem]">
                    {event.currency}
                  </span>

                  {/* Impact as filled bars — scannable without reading. */}
                  <span
                    className="flex shrink-0 items-end gap-0.5 pt-1"
                    aria-label={`${event.impact} impact`}
                  >
                    {[1, 2, 3].map((bar) => (
                      <span
                        key={bar}
                        className={cn(
                          "w-1 rounded-full",
                          bar === 1 && "h-2",
                          bar === 2 && "h-3",
                          bar === 3 && "h-4",
                          bar <= impactDots[event.impact]
                            ? event.impact === "high"
                              ? "bg-loss"
                              : event.impact === "medium"
                                ? "bg-amber"
                                : "bg-faint"
                            : "bg-line",
                        )}
                      />
                    ))}
                  </span>

                  <span className="min-w-[12rem] flex-1">
                    <span className="text-ink block text-sm font-medium">
                      {event.title}
                    </span>
                    {!compact && (
                      <span className="text-muted mt-1 block text-[0.8125rem] leading-relaxed">
                        {event.note}
                      </span>
                    )}
                  </span>

                  <Badge tone={impactTone[event.impact]} className="shrink-0">
                    {event.impact}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {byDay.length === 0 && (
          <p className="text-muted px-5 py-12 text-center text-sm sm:px-7">
            No events match that filter. Widen the impact or region.
          </p>
        )}
      </div>
    </div>
  );
}
