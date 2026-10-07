import type { ReactNode } from "react";

import { RouteTransition } from "@/components/motion/route-transition";

export default function PortalLoginLayout({ children }: { children: ReactNode }) {
  return <RouteTransition>{children}</RouteTransition>;
}
