"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

/** Distance at which the pull starts, and the furthest the target travels. */
const RANGE_PX = 150;
const PULL_PX = 7;

/**
 * Leans its child a few pixels towards a nearby cursor. Deliberately small —
 * the effect should register as responsiveness, not as a toy.
 *
 * Ignored for reduced motion and for coarse pointers, both of which are only
 * known after mount, so the rendered markup is the same either way.
 */
export function Magnetic({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 190, damping: 17, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 190, damping: 17, mass: 0.4 });

  useEffect(() => {
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (event: PointerEvent) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const strength = Math.max(0, 1 - Math.hypot(dx, dy) / RANGE_PX);
      x.set(Math.max(-PULL_PX, Math.min(PULL_PX, dx * 0.2)) * strength);
      y.set(Math.max(-PULL_PX, Math.min(PULL_PX, dy * 0.2)) * strength);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced, x, y]);

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ x: springX, y: springY, display: "inline-flex" }}
    >
      {children}
    </motion.span>
  );
}
