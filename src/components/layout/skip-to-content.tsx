"use client";

import { usePathname } from "next/navigation";

/**
 * Focusable skip control. On the homepage it jumps past the cinematic hero
 * to the live tape; everywhere else it lands at the start of `<main>`.
 */
export function SkipToContent() {
  const pathname = usePathname();
  const href = pathname === "/" ? "#after-hero" : "#main-content";

  return (
    <a
      href={href}
      className="bg-brand fixed top-3 left-3 z-[200] -translate-y-[200%] rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgb(0_0_0/0.35)] transition-transform focus:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#06070e]"
    >
      Skip to content
    </a>
  );
}
