"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

import { cn } from "@/lib/utils";

const INTERVAL_MS = 30_000;

/**
 * Keeps the overview honest. A registration completed on the public site shows
 * up here without anyone touching the browser, and the desk can pin the view by
 * switching auto-refresh off while working through a row.
 */
export function LiveRefresh({ className }: { className?: string }) {
  const router = useRouter();
  const [auto, setAuto] = useState(true);
  const [pending, startTransition] = useTransition();
  const [lastSync, setLastSync] = useState<string | null>(null);

  const refresh = useCallback(() => {
    startTransition(() => {
      router.refresh();
      setLastSync(stamp());
    });
  }, [router]);

  useEffect(() => {
    if (!auto) return;
    const id = window.setInterval(refresh, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [auto, refresh]);

  return (
    <div className={cn("flex flex-wrap items-center gap-2.5", className)}>
      <p className="text-faint tabular font-mono text-[0.6875rem] tracking-[0.08em]">
        {lastSync ? `Synced ${lastSync} UTC` : "Refreshing every 30 seconds"}
      </p>

      <button
        type="button"
        role="switch"
        aria-checked={auto}
        onClick={() => setAuto((value) => !value)}
        className={cn(
          "border-line text-muted hover:text-ink flex h-9 items-center gap-2 rounded-lg border pe-3 ps-2.5 text-[0.8125rem] transition-colors",
          auto && "border-mint/40 bg-mint/10 text-mint hover:text-mint",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "relative flex h-4 w-7 shrink-0 items-center rounded-full transition-colors",
            auto ? "bg-mint/70" : "bg-line",
          )}
        >
          <span
            className={cn(
              "bg-raised absolute size-3 rounded-full transition-all duration-200",
              auto ? "end-0.5" : "start-0.5",
            )}
          />
        </span>
        Auto-refresh
      </button>

      <button
        type="button"
        onClick={refresh}
        disabled={pending}
        className="border-line text-muted hover:border-brand-light/70 hover:text-ink flex h-9 items-center gap-2 rounded-lg border px-3 text-[0.8125rem] transition-colors disabled:opacity-60"
      >
        <RefreshCw
          className={cn("size-3.5", pending && "animate-spin")}
          aria-hidden="true"
        />
        {pending ? "Refreshing" : "Refresh"}
      </button>
    </div>
  );
}

function stamp() {
  return new Date().toISOString().slice(11, 19);
}
