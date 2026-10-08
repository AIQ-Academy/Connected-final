"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type TabItem = {
  value: string;
  label: ReactNode;
  count?: number;
};

/**
 * Roving-tabindex tab strip following the WAI-ARIA tabs pattern: arrow keys
 * move focus and selection, Home/End jump to the ends. State is owned by the
 * caller so a tab strip can drive server-rendered panels.
 */
export function TabList({
  items,
  value,
  onValueChange,
  label,
  className,
  idPrefix,
  size = "md",
}: {
  items: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  className?: string;
  idPrefix?: string;
  size?: "sm" | "md";
}) {
  const generatedId = useId();
  const reducedMotion = useReducedMotion();
  const prefix = idPrefix ?? generatedId;
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  function focusIndex(index: number) {
    const next = items[(index + items.length) % items.length];
    onValueChange(next.value);
    refs.current[next.value]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        "border-line-soft bg-sunken/60 inline-flex max-w-full flex-wrap gap-1 rounded-2xl border p-1.5",
        className,
      )}
    >
      {items.map((item, index) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            ref={(node) => {
              refs.current[item.value] = node;
            }}
            type="button"
            role="tab"
            id={`${prefix}-tab-${item.value}`}
            aria-selected={selected}
            aria-controls={`${prefix}-panel-${item.value}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onValueChange(item.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                event.preventDefault();
                focusIndex(index + 1);
              } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                event.preventDefault();
                focusIndex(index - 1);
              } else if (event.key === "Home") {
                event.preventDefault();
                focusIndex(0);
              } else if (event.key === "End") {
                event.preventDefault();
                focusIndex(items.length - 1);
              }
            }}
            className={cn(
              "relative rounded-xl font-medium whitespace-nowrap transition-colors",
              size === "sm"
                ? "px-3 py-1.5 text-[0.8125rem]"
                : "px-4 py-2 text-sm",
              selected ? "text-ink" : "text-muted hover:text-ink",
            )}
          >
            {selected && (
              <motion.span
                layoutId={`${prefix}-tab-pill`}
                transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                className="bg-panel border-line-soft absolute inset-0 rounded-xl border shadow-sm"
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {item.label}
              {item.count !== undefined && (
                <span
                  className={cn(
                    "tabular font-mono text-[0.6875rem]",
                    selected ? "text-brand-light" : "text-faint",
                  )}
                >
                  {item.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({
  value,
  active,
  idPrefix,
  className,
  children,
}: {
  value: string;
  active: boolean;
  idPrefix: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      role="tabpanel"
      id={`${idPrefix}-panel-${value}`}
      aria-labelledby={`${idPrefix}-tab-${value}`}
      hidden={!active}
      tabIndex={0}
      className={cn("outline-none", className)}
    >
      {active && children}
    </div>
  );
}
