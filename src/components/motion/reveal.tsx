"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ComponentProps, ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

const DISTANCE = 22;
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/**
 * Scroll-triggered entrance. Fires once, and collapses to an instant reveal
 * when the OS asks for reduced motion.
 *
 * The resting state is identical either way: the reduced-motion preference is
 * unknown while rendering on the server, so branching on it in `initial` would
 * hand React different markup on the client and break hydration. Only the
 * duration changes, which nothing outside the animation can observe.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
  direction = "up",
  amount = 0.25,
  ...props
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
  direction?: "up" | "down" | "left" | "right" | "none";
  amount?: number;
} & Omit<ComponentProps<typeof motion.div>, "as">) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as as "div"] ?? motion.div;

  const offset =
    direction === "none"
      ? {}
      : {
          up: { y: DISTANCE },
          down: { y: -DISTANCE },
          left: { x: DISTANCE },
          right: { x: -DISTANCE },
        }[direction];

  return (
    <MotionTag
      className={cn(className)}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{
        duration: reduced ? 0 : 0.7,
        delay: reduced ? 0 : delay,
        ease: EASE_OUT_EXPO,
      }}
      {...props}
    >
      {children}
    </MotionTag>
  );
}

const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const staggerChild: Variants = {
  hidden: { opacity: 0, y: DISTANCE },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE_OUT_EXPO },
  },
};

/** Same resting state, no travel — see the note on Reveal. */
const staggerChildInstant: Variants = {
  hidden: { opacity: 0, y: DISTANCE },
  show: { opacity: 1, y: 0, transition: { duration: 0 } },
};

/** Pricing/account cards — scale instead of a longer fade so they feel designed. */
const staggerChildCard: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.72, ease: EASE_OUT_EXPO },
  },
};

const staggerChildCardInstant: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0 } },
};

function withShowDelay(variants: Variants, delay: number): Variants {
  if (!delay) return variants;
  const show = variants.show;
  if (!show || typeof show === "function") return variants;
  return {
    ...variants,
    show: {
      ...show,
      transition: {
        ...(typeof show.transition === "object" ? show.transition : {}),
        delay,
      },
    },
  };
}

/** Wraps a grid so its children cascade in rather than appearing at once. */
export function StaggerGroup({
  children,
  className,
  amount = 0.15,
  ...props
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
} & ComponentProps<typeof motion.div>) {
  return (
    <motion.div
      className={cn(className)}
      variants={staggerParent}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  delay = 0,
  preset = "default",
  ...props
}: {
  children: ReactNode;
  className?: string;
  /** Overrides the group stagger slot so a featured card can land after its siblings. */
  delay?: number;
  preset?: "default" | "card";
} & Omit<ComponentProps<typeof motion.div>, "delay">) {
  const reduced = useReducedMotion();
  const variants =
    preset === "card"
      ? reduced
        ? staggerChildCardInstant
        : staggerChildCard
      : reduced
        ? staggerChildInstant
        : staggerChild;

  return (
    <motion.div
      className={cn(className)}
      variants={withShowDelay(variants, reduced ? 0 : delay)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Scale-x fill for the capital/deposit step bars. Uses whileInView so it still
 * fires when the card is a nested server component (variant inheritance is
 * unreliable across that boundary) and so off-screen snap-rail cards fill as
 * they come into view.
 */
export function StaggerFill({
  className,
  delay = 0,
  ...props
}: {
  className?: string;
  delay?: number;
} & Omit<ComponentProps<typeof motion.span>, "children">) {
  const reduced = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      className={cn("origin-left", className)}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{
        duration: reduced ? 0 : 0.5,
        delay: reduced ? 0 : delay,
        ease: EASE_OUT_EXPO,
      }}
      {...props}
    />
  );
}

/** Filled segments grow left-to-right after the card is on screen. */
export function AccountStepRail({
  rank,
  total,
  featured = false,
  fillDelay = 0.38,
}: {
  rank: number;
  total: number;
  featured?: boolean;
  fillDelay?: number;
}) {
  return (
    <div className="mt-2 flex gap-1" aria-hidden>
      {Array.from({ length: total }, (_, step) =>
        step < rank ? (
          <StaggerFill
            key={step}
            delay={fillDelay + step * 0.08}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              featured
                ? "bg-brand"
                : "bg-brand/45 lg:group-hover:bg-brand/65",
            )}
          />
        ) : (
          <span key={step} className="bg-line h-1.5 flex-1 rounded-full" />
        ),
      )}
    </div>
  );
}
