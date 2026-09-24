import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function TableWrap({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("-mx-px overflow-x-auto", className)}
      {...props}
    />
  );
}

export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <table
      className={cn("w-full min-w-[42rem] border-collapse text-left text-sm", className)}
      {...props}
    />
  );
}

export function Th({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      scope="col"
      className={cn(
        "border-line-soft text-faint border-b px-5 py-3 font-mono text-[0.6875rem] font-medium tracking-[0.12em] whitespace-nowrap uppercase sm:px-6",
        className,
      )}
      {...props}
    />
  );
}

export function Td({ className, ...props }: ComponentProps<"td">) {
  return (
    <td
      className={cn(
        "border-line-soft border-b px-5 py-3.5 align-middle sm:px-6",
        className,
      )}
      {...props}
    />
  );
}

export function Tr({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      className={cn("hover:bg-sunken/60 transition-colors", className)}
      {...props}
    />
  );
}
