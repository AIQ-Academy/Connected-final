"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useHydrated();

  /* The resolved theme is unknown until hydration, so the label and icon both
     wait for it rather than guessing and mismatching the server markup. */
  const isDark = hydrated && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={
        hydrated ? `Switch to ${isDark ? "light" : "dark"} theme` : "Switch theme"
      }
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "text-muted hover:text-ink hover:border-brand-light/60 border-line grid size-9 place-items-center rounded-lg border transition-colors",
        className,
      )}
    >
      {/* Rendered only after hydration so server and client markup agree. */}
      {hydrated ? (
        isDark ? (
          <Sun className="size-[17px]" />
        ) : (
          <Moon className="size-[17px]" />
        )
      ) : (
        <span className="size-[17px]" />
      )}
    </button>
  );
}
