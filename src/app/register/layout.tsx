import Link from "next/link";
import type { ReactNode } from "react";

import { SiteHeader } from "@/components/layout/site-header";
import { Container } from "@/components/ui/container";
import { riskDisclosure, site } from "@/lib/site";

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-line-soft border-t py-8">
        <Container className="flex flex-col gap-4">
          <p className="text-faint text-[0.75rem] leading-relaxed">
            {riskDisclosure}
          </p>
          <div className="text-faint flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.75rem]">
            <span>
              © {new Date().getFullYear()} {site.name}
            </span>
            <Link
              href="/legal/terms"
              className="hover:text-ink transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/legal/privacy"
              className="hover:text-ink transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/legal/risk-disclosure"
              className="hover:text-ink transition-colors"
            >
              Risk disclosure
            </Link>
            <Link href="/contact" className="hover:text-ink transition-colors">
              Contact
            </Link>
          </div>
        </Container>
      </footer>
    </div>
  );
}
