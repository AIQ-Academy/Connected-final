"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Keep the shared price strip off the home hero, where it has its own slot. */
export function SitePriceNavigation({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const isHomepage = /^\/(?:fr|ar)?\/?$/.test(pathname);

  return isHomepage ? null : (
    <div className="sticky top-[76px] z-40">{children}</div>
  );
}
