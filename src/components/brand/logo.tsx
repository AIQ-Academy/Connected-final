"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useTheme } from "@/components/theme-provider";

import { cn } from "@/lib/utils";

const LOGO = {
  default: "/brand/logo.png",
  onDark: "/brand/logo-on-dark.png",
} as const;

const MARK = {
  default: "/brand/mark.png",
  onDark: "/brand/mark-on-dark.png",
} as const;

/**
 * CF monogram from the lockup. Used in compact chrome (chat, sidebar icon).
 */
export function LogoMark({
  className,
  animate = false,
  priority = false,
  tone = "auto",
}: {
  className?: string;
  animate?: boolean;
  priority?: boolean;
  tone?: "default" | "onDark" | "auto";
}) {
  const reduced = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const resolvedTone = tone === "auto" ? (resolvedTheme === "dark" ? "onDark" : "default") : tone;

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
        src={MARK[resolvedTone]}
        alt=""
        width={296}
        height={227}
        priority={priority}
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
  tone = "auto",
  priority = false,
}: {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
  animateMark?: boolean;
  /** `onDark` renders a white lockup over the cinematic hero. */
  tone?: "default" | "onDark" | "auto";
  priority?: boolean;
}) {
  const reduced = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const resolvedTone =
    tone === "auto" ? (resolvedTheme === "dark" ? "onDark" : "default") : tone;

  if (!showWordmark) {
    return (
      <span className={className}>
        <LogoMark
          className={markClassName}
          animate={animateMark}
          priority={priority}
          tone={resolvedTone}
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
        src={LOGO[resolvedTone]}
        alt="Connect Funded"
        width={840}
        height={240}
        priority={priority}
        className={cn(
          "h-8 w-auto sm:h-9",
          resolvedTone === "onDark" && "brightness-150",
          markClassName,
        )}
      />
    </motion.span>
  );
}
