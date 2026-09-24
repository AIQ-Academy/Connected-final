import { cn } from "@/lib/utils";
import { clamp } from "@/lib/trading";

export function ProgressBar({
  value,
  label,
  tone = "brand",
  className,
}: {
  /** 0-100. Values outside the range are clamped. */
  value: number;
  label: string;
  tone?: "brand" | "mint" | "amber" | "loss";
  className?: string;
}) {
  const pct = clamp(value, 0, 100);
  const fill = {
    brand: "bg-brand",
    mint: "bg-mint",
    amber: "bg-amber",
    loss: "bg-loss",
  }[tone];

  return (
    <div
      className={cn("bg-sunken border-line-soft h-2 rounded-full border", className)}
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-700", fill)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
