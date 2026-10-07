import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

// Buttons are pills, and the square icon sizes are therefore circles. Every size
// below has a fixed height, so `rounded-full` is the shape as designed rather
// than a radius that happens to be larger than the control.
export const buttonVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-[transform,box-shadow,background-color,border-color,color] duration-200 outline-none select-none active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "cf-button-primary bg-brand text-white shadow-[inset_0_1px_0_0_rgb(255_255_255/0.16)] hover:bg-[var(--cf-brand-hover)]",
        soft: "cf-button-soft bg-panel text-ink border border-line hover:border-brand-light/70 hover:bg-brand-dim/25",
        ghost: "text-muted hover:bg-brand-dim/25 hover:text-ink",
        outline:
          "border border-line text-ink hover:border-brand-light hover:text-brand-light",
        mint: "bg-mint text-[#ffffff] hover:brightness-110 dark:text-[#04140f]",
        danger: "bg-loss text-white hover:brightness-110",
      },
      size: {
        sm: "h-9 px-3.5 text-[0.8125rem] [&_svg]:size-4",
        md: "h-11 px-5 text-sm [&_svg]:size-4",
        lg: "h-13 px-7 text-[0.9375rem] [&_svg]:size-[18px]",
        icon: "size-10 [&_svg]:size-[18px]",
        "icon-sm": "size-8 [&_svg]:size-4",
      },
      block: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "primary", size: "md", block: false },
  },
);

type ButtonBaseProps = VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  block,
  ...props
}: ComponentProps<"button"> & ButtonBaseProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    />
  );
}

export function ButtonLink({
  className,
  variant,
  size,
  block,
  ...props
}: ComponentProps<typeof Link> & ButtonBaseProps) {
  return (
    <Link
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    />
  );
}
