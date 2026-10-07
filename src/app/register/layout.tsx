import Link from "next/link";
import type { ReactNode } from "react";

import { SiteHeader } from "@/components/layout/site-header";
import { Container } from "@/components/ui/container";
import { getRiskDisclosure, site } from "@/lib/site";
import { getServerLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { RouteTransition } from "@/components/motion/route-transition";

export default async function RegisterLayout({ children }: { children: ReactNode }) {
  const locale = await getServerLocale();
  const t = getDictionary(locale);

  return (
      <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1"><RouteTransition>{children}</RouteTransition></main>
      <footer className="border-line-soft border-t py-8">
        <Container className="flex flex-col gap-4">
          <p className="text-faint text-[0.75rem] leading-relaxed">
            {getRiskDisclosure(locale)}
          </p>
          <div className="text-faint flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.75rem]">
            <span>
              © {new Date().getFullYear()} {site.name}
            </span>
            <Link
              href="/legal/terms"
              className="hover:text-ink transition-colors"
            >
              {t["footer.terms"]}
            </Link>
            <Link
              href="/legal/privacy"
              className="hover:text-ink transition-colors"
            >
              {t["footer.privacy"]}
            </Link>
            <Link
              href="/legal/risk-disclosure"
              className="hover:text-ink transition-colors"
            >
              {t["footer.riskDisclosure"]}
            </Link>
            <Link href="/contact" className="hover:text-ink transition-colors">
              {t["footer.contact"]}
            </Link>
          </div>
        </Container>
      </footer>
      </div>
  );
}
