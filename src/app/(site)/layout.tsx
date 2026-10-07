import type { ReactNode } from "react";

import { ChatWidget } from "@/components/chat/chat-widget";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { SkipToContent } from "@/components/layout/skip-to-content";
import { TickerTapeSection } from "@/components/sections/ticker-tape";
import { SitePriceNavigation } from "@/components/sections/site-price-navigation";
import { RouteTransition } from "@/components/motion/route-transition";

import "../marketing.css";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  return (
      <div className="flex min-h-dvh flex-col">
      <SkipToContent />
      <SiteHeader />
      <SitePriceNavigation>
        <TickerTapeSection />
      </SitePriceNavigation>
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 outline-none"
      >
        <SiteBreadcrumb />
        <RouteTransition>{children}</RouteTransition>
      </main>
      <SiteFooter />
      <ChatWidget />
      </div>
  );
}
