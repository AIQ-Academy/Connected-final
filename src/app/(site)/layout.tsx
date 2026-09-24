import type { ReactNode } from "react";

import { ChatWidget } from "@/components/chat/chat-widget";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SkipToContent } from "@/components/layout/skip-to-content";

import "../marketing.css";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SkipToContent />
      <SiteHeader />
      <PageBreadcrumb />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 outline-none"
      >
        {children}
      </main>
      <SiteFooter />
      <ChatWidget />
    </div>
  );
}
