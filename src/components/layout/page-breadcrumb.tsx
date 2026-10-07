"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { Container } from "@/components/ui/container";
import { breadcrumbsFor } from "@/lib/breadcrumbs";
import { cn } from "@/lib/utils";

/**
 * Path-tree under the site header. Hidden on the homepage. Current page is
 * plain text; ancestors link back when they have a real landing URL.
 */
export function PageBreadcrumb({ className }: { className?: string }) {
  const pathname = usePathname();
  const crumbs = breadcrumbsFor(pathname);

  if (!crumbs || crumbs.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "border-line-soft bg-raised/50 border-b",
        className,
      )}
    >
      <Container className="flex h-11 items-center sm:h-12">
        <ol className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-[0.8125rem]">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;

            return (
              <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                {index > 0 ? (
                  <ChevronRight
                    className="text-faint size-3.5 shrink-0"
                    aria-hidden="true"
                  />
                ) : null}
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="text-muted hover:text-ink truncate font-medium transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      "truncate font-medium",
                      isLast ? "text-ink" : "text-muted",
                    )}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {crumb.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </Container>
    </nav>
  );
}
