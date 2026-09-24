"use client";

import { useEffect, useState } from "react";

import { LiveDot } from "@/components/ui/badge";
import { isMarketOpen, marketStatusLabel } from "@/lib/market";
import { cn } from "@/lib/utils";

/**
 * Session state depends on the visitor's clock, so it is resolved after mount
 * to keep server and client markup identical.
 */
export function MarketStatus({ className }: { className?: string }) {
  const [status, setStatus] = useState<{ open: boolean; label: string } | null>(
    null,
  );

  useEffect(() => {
    const sync = () =>
      setStatus({ open: isMarketOpen(), label: marketStatusLabel() });
    sync();
    const timer = setInterval(sync, 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span
      className={cn(
        "border-line-soft bg-panel/70 text-muted inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs backdrop-blur",
        className,
      )}
    >
      <LiveDot tone={status?.open === false ? "amber" : "mint"} />
      <span className="font-mono text-[0.6875rem] tracking-wide">
        {status?.label ?? "Checking session status"}
      </span>
    </span>
  );
}
