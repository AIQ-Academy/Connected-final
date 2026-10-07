"use client";

import { TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";

/** Inline control styling shared by every queue row so the desk reads as one tool. */
export const rowSelectClass =
  "border-line bg-raised text-ink h-9 w-full min-w-[9.5rem] appearance-none rounded-lg border bg-[length:0.875rem] bg-[right_0.65rem_center] bg-no-repeat pe-8 ps-3 text-[0.8125rem] outline-none transition-[border-color,box-shadow] focus:border-brand-light focus:shadow-[0_0_0_3px_rgb(var(--cf-brand-glow)/0.16)] disabled:opacity-60";

export const rowSelectChevron = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23878da8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
} as const;

export function RowError({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <p
      role="alert"
      className={cn(
        "text-loss mt-1.5 flex items-start gap-1.5 text-[0.75rem] leading-snug",
        className,
      )}
    >
      <TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

/** Dims a row while its mutation is in flight without shifting the layout. */
export function rowBusyClass(pending: boolean) {
  return pending ? "opacity-55 transition-opacity" : "transition-opacity";
}
