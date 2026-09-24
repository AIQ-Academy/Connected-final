import { Children, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Infinite horizontal marquee. Children are rendered twice so the CSS
 * translate of -50% loops seamlessly; the duplicate is hidden from assistive
 * tech. Pauses on hover, and `prefers-reduced-motion` freezes it via the
 * global reduced-motion rule.
 */
export function Marquee({
  children,
  duration = 48,
  reverse = false,
  gap = "gap-4",
  className,
  fade = true,
}: {
  children: ReactNode;
  duration?: number;
  reverse?: boolean;
  gap?: string;
  className?: string;
  fade?: boolean;
}) {
  const items = Children.toArray(children);

  return (
    <div
      className={cn(
        "marquee relative w-full overflow-hidden",
        fade && "mask-fade-x",
        className,
      )}
    >
      <div
        className="marquee-track"
        data-direction={reverse ? "reverse" : "forward"}
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        <div className={cn("flex shrink-0 items-stretch pr-4", gap)}>
          {items}
        </div>
        <div className={cn("flex shrink-0 items-stretch pr-4", gap)} aria-hidden="true">
          {items}
        </div>
      </div>
    </div>
  );
}
