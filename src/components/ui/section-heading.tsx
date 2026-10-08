import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("eyebrow", className)}>
      <span className="chev" />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  className,
  action,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:gap-5",
        align === "center" && "items-center text-center",
        action && "sm:flex-row sm:items-end sm:justify-between sm:gap-10",
        className,
      )}
    >
      <Reveal className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
        <h2 className="text-h2">{title}</h2>
        {lead && <p className="text-lead mt-4 max-w-[65ch] leading-relaxed text-muted">{lead}</p>}
      </Reveal>
      {action && (
        <Reveal
          delay={0.1}
          className="w-full shrink-0 sm:w-auto [&_.inline-flex]:w-full sm:[&_.inline-flex]:w-auto"
        >
          {action}
        </Reveal>
      )}
    </div>
  );
}
