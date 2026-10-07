"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

/** Full-bleed page hero photography with a brand-tinted scrim for readable copy. */
export function FeaturePageImage({
  src,
  alt,
  objectPosition = "center",
  motionVariant,
}: {
  src: string;
  alt: string;
  objectPosition?: string;
  motionVariant?: "platforms" | "markets" | "tools" | "learn" | "about";
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: frameRef,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [18, -18]);

  return (
    <div ref={frameRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -inset-8"
        style={motionVariant ? { y: parallaxY, scale: reduced ? 1 : 1.045 } : undefined}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="100vw"
          style={{ objectPosition }}
          className={motionVariant ? `hero-image-drift hero-image-drift-${motionVariant} object-cover` : "object-cover"}
        />
        <div className="absolute inset-0 bg-[#081b37]/55" />
        <div className="hero-photo-scrim absolute inset-0" />
      </motion.div>
    </div>
  );
}
