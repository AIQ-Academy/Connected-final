"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

import { useLocale } from "@/components/i18n/locale-provider";

const ROUTE_EASE = [0.2, 0.8, 0.2, 1] as const;

/** Short route change motion while each shared layout remains mounted. */
export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const { direction } = useLocale();
  const offset = reduced ? 0 : direction === "rtl" ? -8 : 8;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, x: offset }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: direction === "rtl" ? 4 : -4 }}
        transition={{ duration: reduced ? 0 : 0.18, ease: ROUTE_EASE }}
        className="min-w-0"
      >
        <PageSectionReveal reduced={Boolean(reduced)}>{children}</PageSectionReveal>
      </motion.div>
    </AnimatePresence>
  );
}

/** One observer reveals existing sections as they enter view without wrappers or scroll loops. */
function PageSectionReveal({ children, reduced }: { children: ReactNode; reduced: boolean }) {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const page = pageRef.current;
    if (!page || reduced) return;

    const sections = Array.from(page.querySelectorAll<HTMLElement>("section"));
    const unrevealed = sections.filter((section) =>
      !section.closest("[data-motion-reveal]") && !section.querySelector("[data-motion-reveal]"),
    );
    if (!unrevealed.length) return;

    const visibleNow: HTMLElement[] = [];
    const pending: HTMLElement[] = [];
    for (const section of unrevealed) {
      const { top, bottom } = section.getBoundingClientRect();
      if (bottom <= 0 || top < window.innerHeight * 0.9) {
        section.setAttribute("data-motion-reveal-visible", "");
        visibleNow.push(section);
      } else {
        section.setAttribute("data-motion-reveal-pending", "");
        pending.push(section);
      }
    }

    if (!pending.length) return () => visibleNow.forEach((section) => section.removeAttribute("data-motion-reveal-visible"));
    if (!("IntersectionObserver" in window)) {
      pending.forEach((section) => {
        section.removeAttribute("data-motion-reveal-pending");
        section.setAttribute("data-motion-reveal-visible", "");
      });
      return () => unrevealed.forEach((section) => {
        section.removeAttribute("data-motion-reveal-pending");
        section.removeAttribute("data-motion-reveal-visible");
      });
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const section = entry.target as HTMLElement;
        section.removeAttribute("data-motion-reveal-pending");
        section.setAttribute("data-motion-reveal-visible", "");
        observer.unobserve(section);
      }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    pending.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
      unrevealed.forEach((section) => {
        section.removeAttribute("data-motion-reveal-pending");
        section.removeAttribute("data-motion-reveal-visible");
      });
    };
  }, [reduced]);

  return <div ref={pageRef}>{children}</div>;
}
