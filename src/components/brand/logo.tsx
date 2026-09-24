"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const LOGO = {
  default: "/brand/logo.svg",
  onDark: "/brand/logo-on-dark.svg",
} as const;

const MARK = {
  default: "/brand/mark.svg",
  onDark: "/brand/mark-on-dark.svg",
} as const;

/** ViewBox sizes of the vector lockup and monogram. */
const LOGO_SIZE = { width: 1127, height: 326 } as const;
const MARK_SIZE = { width: 430, height: 326 } as const;

/**
 * CF monogram from the lockup. Used in compact chrome (chat, sidebar icon).
 */
export function LogoMark({
  className,
  animate = false,
  priority = false,
  tone = "default",
}: {
  className?: string;
  animate?: boolean;
  priority?: boolean;
  tone?: "default" | "onDark";
}) {
  const reduced = useReducedMotion();

  return (
    <motion.span
      className={cn("relative inline-flex h-7 w-auto", className)}
      initial={animate && !reduced ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduced ? 0 : 0.4,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Image
        src={MARK[tone]}
        alt=""
        width={MARK_SIZE.width}
        height={MARK_SIZE.height}
        priority={priority}
        unoptimized
        className="h-full w-auto"
      />
    </motion.span>
  );
}

export function Logo({
  className,
  markClassName,
  showWordmark = true,
  animateMark = false,
  tone = "default",
  priority = false,
}: {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
  animateMark?: boolean;
  /** `onDark` renders a white lockup over the cinematic hero. */
  tone?: "default" | "onDark";
  priority?: boolean;
}) {
  const reduced = useReducedMotion();

  if (!showWordmark) {
    return (
      <span className={className}>
        <LogoMark
          className={markClassName}
          animate={animateMark}
          priority={priority}
          tone={tone}
        />
      </span>
    );
  }

  return (
    <motion.span
      className={cn("inline-flex items-center", className)}
      initial={animateMark && !reduced ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduced ? 0 : 0.4,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Image
        src={LOGO[tone]}
        alt="Connect Funded"
        width={LOGO_SIZE.width}
        height={LOGO_SIZE.height}
        priority={priority}
        unoptimized
        className={cn("h-8 w-auto sm:h-9", markClassName)}
      />
    </motion.span>
  );
}
