"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Slow-out curve shared with the Swiper wrapper so travel and content agree. */
export const CINEMA_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
/** Front-loaded curve: an outgoing screen commits to leaving straight away. */
export const DEPART_EASE: [number, number, number, number] = [
  0.55, 0, 0.85, 0.35,
];

/**
 * Choreography for one pinned hero screen.
 *
 * The screen itself only drifts — a shallow parallax against the Swiper
 * translate, with `custom` carrying the travel direction — while its children
 * do the visible work, resolving in sequence rather than as one sliding block.
 * Departure is roughly half the length of the arrival so the frame is clear
 * before the next screen settles.
 */
export const screenMotion: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 56 : -56 }),
  center: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: CINEMA_EASE,
      delayChildren: 0.05,
      staggerChildren: 0.045,
    },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? -40 : 40,
    transition: {
      duration: 0.44,
      ease: DEPART_EASE,
      staggerChildren: 0.028,
      staggerDirection: -1,
    },
  }),
};

/**
 * The first screen arriving out of the intro clip. The sideways travel of
 * `screenMotion` would read as a slide change; this rises and pulls focus
 * instead, so the copy settles with the film rather than sliding onto it.
 */
export const landingMotion: Variants = {
  enter: { opacity: 0, y: 30, scale: 0.985, filter: "blur(9px)" },
  center: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.95,
      ease: CINEMA_EASE,
      delayChildren: 0.1,
      staggerChildren: 0.07,
    },
  },
  exit: {
    opacity: 0,
    y: -14,
    filter: "blur(4px)",
    transition: {
      duration: 0.44,
      ease: DEPART_EASE,
      staggerChildren: 0.028,
      staggerDirection: -1,
    },
  },
};

/** One sequenced block inside a screen. */
export const itemMotion: Variants = {
  enter: { opacity: 0, y: 24 },
  center: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.62, ease: CINEMA_EASE },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.3, ease: DEPART_EASE },
  },
};

/** A headline line, wiped from behind its own baseline. */
const lineMotion: Variants = {
  enter: { y: "112%" },
  center: { y: "0%", transition: { duration: 0.8, ease: CINEMA_EASE } },
  exit: { y: "-108%", transition: { duration: 0.36, ease: DEPART_EASE } },
};

export function StageItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={itemMotion} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * The negative margin pairs with the padding so descenders are not clipped by
 * the mask; spacing belongs on the wrapper, outside the travelling span.
 */
export function StageLine({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "block overflow-hidden pb-[0.14em] [margin-bottom:-0.14em]",
        className,
      )}
    >
      <motion.span variants={lineMotion} className="block">
        {children}
      </motion.span>
    </span>
  );
}

/** The logomark chevron, tailed by a hairline. */
export function ChevRule({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("flex items-center gap-2", className)}
    >
      <span className="chev size-2.5 bg-white/85" />
      <span className="h-px w-5 bg-[linear-gradient(to_right,rgb(255_255_255/0.45),transparent)] sm:w-7" />
    </span>
  );
}
