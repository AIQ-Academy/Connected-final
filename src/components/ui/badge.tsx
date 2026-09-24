import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border font-mono text-[0.6875rem] leading-none font-medium tracking-[0.06em] uppercase",
  {
    variants: {
      tone: {
        neutral: "border-line bg-panel text-muted",
        brand: "border-brand/35 bg-brand/12 text-brand-light",
        mint: "border-mint/35 bg-mint/12 text-mint",
        amber: "border-amber/35 bg-amber/12 text-amber",
        loss: "border-loss/35 bg-loss/12 text-loss",
      },
      size: {
        sm: "px-2 py-1",
        md: "px-2.5 py-1.5",
      },
    },
    defaultVariants: { tone: "neutral", size: "sm" },
  },
);

export function Badge({
  className,
  tone,
  size,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ tone, size }), className)} {...props} />
  );
}

/** Small pulsing dot used to signal a live/streaming surface. */
export function LiveDot({
  className,
  tone = "mint",
}: {
  className?: string;
  tone?: "mint" | "brand" | "amber" | "loss";
}) {
  const color = {
    mint: "bg-mint",
    brand: "bg-brand",
    amber: "bg-amber",
    loss: "bg-loss",
  }[tone];

  return (
    <span className={cn("relative flex size-2", className)}>
      <span
        className={cn(
          "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
          color,
        )}
      />
      <span className={cn("relative inline-flex size-2 rounded-full", color)} />
    </span>
  );
}
