import type { ComponentProps, ElementType } from "react";

import { cn } from "@/lib/utils";

export function Container({
  className,
  as: Tag = "div",
  ...props
}: ComponentProps<"div"> & { as?: ElementType }) {
  return (
    <Tag
      className={cn("mx-auto w-full max-w-page px-5 sm:px-7 lg:px-8", className)}
      {...props}
    />
  );
}

/**
 * `spacious` is the home page rhythm — one idea per screen, with enough air
 * between sections that they never read as one continuous grid.
 */
const sectionPadding = {
  default: "py-16 sm:py-20 lg:py-24",
  spacious: "py-16 sm:py-28 lg:py-36",
} as const;

export function Section({
  className,
  as: Tag = "section",
  size = "default",
  ...props
}: ComponentProps<"section"> & {
  as?: ElementType;
  size?: keyof typeof sectionPadding;
}) {
  return (
    <Tag className={cn("relative", sectionPadding[size], className)} {...props} />
  );
}
