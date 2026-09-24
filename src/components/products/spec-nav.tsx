"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export type SpecNavItem = {
  id: string;
  label: string;
  count: number;
};

/**
 * Sticky in-page nav for the instrument spec sections. Scroll position drives
 * the active pill via IntersectionObserver; the links themselves are plain
 * anchors, so the page still navigates without JavaScript.
 */
export function SpecNav({ items }: { items: SpecNavItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => node !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // Bias the band toward the upper third so the pill flips as a heading
      // reaches reading position rather than when it leaves the viewport.
      { rootMargin: "-120px 0px -62% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  return (
    <div className="border-line-soft bg-bg/85 sticky top-18 z-30 border-y backdrop-blur-md">
      <nav
        aria-label="Instrument classes"
        className="mx-auto flex max-w-page items-center gap-1.5 overflow-x-auto px-5 py-3 sm:px-7 lg:px-8"
      >
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[0.8125rem] font-medium transition-colors",
                isActive
                  ? "border-brand bg-brand/12 text-brand-light"
                  : "border-line text-muted hover:text-ink hover:border-brand-light/50",
              )}
            >
              {item.label}
              <span className="tabular font-mono text-[0.625rem] opacity-60">
                {item.count}
              </span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}
