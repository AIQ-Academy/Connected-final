import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Panel({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "cf-interactive-card border-line-soft bg-panel relative rounded-[var(--radius-lg)] border",
        className,
      )}
      {...props}
    />
  );
}

export function PanelHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-line-soft flex flex-wrap items-start justify-between gap-4 border-b px-5 py-4 sm:px-6",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="font-display text-[0.9375rem] leading-tight font-semibold">
          {title}
        </h2>
        {description && (
          <p className="text-muted mt-1 text-[0.8125rem]">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function PanelBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("px-5 py-5 sm:px-6", className)} {...props} />;
}

/** Standard content column for every portal and admin page. */
export function AppMain({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-6xl flex-col gap-7 px-5 py-8 sm:px-7 lg:px-10 lg:py-10",
        className,
      )}
      {...props}
    />
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-5">
      <div className="max-w-2xl">
        {eyebrow && (
          <span className="eyebrow mb-3">
            <span className="chev" />
            {eyebrow}
          </span>
        )}
        <h1 className="font-display text-[1.75rem] leading-tight font-semibold tracking-[-0.02em] sm:text-[2rem]">
          {title}
        </h1>
        {description && <p className="text-muted mt-2 text-sm">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
