"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export function AccordionItem({
  question,
  children,
  defaultOpen = false,
  meta,
}: {
  question: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  meta?: ReactNode;
}) {
  const id = useId();
  const [open, setOpen] = useState(defaultOpen);
  const reduced = useReducedMotion();

  return (
    <div className="border-line-soft border-b last:border-b-0">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          id={`${id}-trigger`}
          onClick={() => setOpen((v) => !v)}
          className="group flex w-full items-start justify-between gap-6 py-5 text-left"
        >
          <span className="text-ink font-display text-[0.9375rem] leading-snug font-semibold sm:text-base">
            {question}
          </span>
          <span className="flex shrink-0 items-center gap-3">
            {meta}
            <span
              className={cn(
                "border-line text-muted group-hover:border-brand-light group-hover:text-brand-light grid size-7 place-items-center rounded-full border transition-all duration-300",
                open && "border-brand bg-brand rotate-45 text-white",
              )}
            >
              <Plus className="size-3.5" />
            </span>
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="panel"
            id={`${id}-panel`}
            role="region"
            aria-labelledby={`${id}-trigger`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: reduced ? 0.01 : 0.32,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="overflow-hidden"
          >
            <div className="text-muted max-w-3xl pb-6 text-sm leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Accordion({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("divide-line-soft", className)}>{children}</div>;
}
