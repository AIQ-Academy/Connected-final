import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Scroll container that keeps wide financial tables usable on mobile. */
export function TableShell({
  children,
  className,
  caption,
}: {
  children: ReactNode;
  className?: string;
  caption?: string;
}) {
  return (
    <div
      className={cn(
        "border-line-soft bg-panel overflow-hidden rounded-2xl border",
        className,
      )}
    >
      <div className="overflow-x-auto" tabIndex={0} role="group" aria-label={caption}>
        {children}
      </div>
    </div>
  );
}

export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <table
      className={cn("w-full min-w-[640px] border-collapse text-sm", className)}
      {...props}
    />
  );
}

export function Th({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      scope="col"
      className={cn(
        "border-line-soft text-faint bg-sunken/70 border-b px-4 py-3 text-left font-mono text-[0.6875rem] font-medium tracking-[0.12em] uppercase",
        className,
      )}
      {...props}
    />
  );
}

export function Td({ className, ...props }: ComponentProps<"td">) {
  return (
    <td
      className={cn(
        "border-line-soft text-muted border-b px-4 py-3.5 align-middle",
        className,
      )}
      {...props}
    />
  );
}

export function Tr({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      className={cn("hover:bg-sunken/50 transition-colors last:[&>td]:border-b-0", className)}
      {...props}
    />
  );
}

/** Impact / status pill shared by the calendar and rule tables. */
export function ImpactPill({ impact }: { impact: "high" | "medium" | "low" }) {
  const tone = {
    high: "border-loss/35 bg-loss/12 text-loss",
    medium: "border-amber/35 bg-amber/12 text-amber",
    low: "border-mint/35 bg-mint/12 text-mint",
  }[impact];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-1 font-mono text-[0.6875rem] leading-none tracking-[0.06em] uppercase",
        tone,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {impact}
    </span>
  );
}
