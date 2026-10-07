import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  tone = "neutral",
  icon,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "neutral" | "brand" | "mint" | "amber" | "loss";
  icon?: ReactNode;
  className?: string;
}) {
  const valueTone = {
    neutral: "text-ink",
    brand: "text-brand-light",
    mint: "text-mint",
    amber: "text-amber",
    loss: "text-loss",
  }[tone];

  return (
    <div
      className={cn(
        "border-line-soft bg-panel relative overflow-hidden rounded-[var(--radius-lg)] border p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-faint font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
          {label}
        </p>
        {icon && <span className="text-faint [&_svg]:size-4">{icon}</span>}
      </div>
      <p
        className={cn(
          "font-display tabular mt-3 text-[1.75rem] leading-none font-semibold tracking-[-0.02em]",
          valueTone,
        )}
      >
        {value}
      </p>
      {hint && <p className="text-muted mt-2 text-[0.8125rem]">{hint}</p>}
    </div>
  );
}
