"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { useLocale } from "@/components/i18n/locale-provider";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { SocialLinks } from "@/components/layout/social-links";
import { Container } from "@/components/ui/container";
import { getFooterNav, getRiskDisclosure, site, type FooterColumnKey } from "@/lib/site";
import { localizedPath } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils";

const contactItems = [
  { icon: MapPin, label: site.address },
  { icon: Mail, label: site.email, href: `mailto:${site.email}` },
  {
    icon: Phone,
    label: site.phone,
    href: `tel:${site.phone.replace(/[^+\d]/g, "")}`,
  },
];

const META_COLUMN_KEYS: FooterColumnKey[] = ["company", "legal"];

export function SiteFooter() {
  const { t, locale } = useLocale();
  const footerNav = getFooterNav(locale);
  const columnFor = (key: FooterColumnKey) => footerNav.find((column) => column.key === key);

  const productLanes = [
    {
      key: "markets" as const,
      tone: "brand" as const,
      index: "01",
      eyebrow: t("footer.lane1Eyebrow"),
      title: t("footer.lane1Title"),
      body: t("footer.lane1Body"),
      href: "/trade",
      cta: t("footer.lane1Cta"),
    },
    {
      key: "trading" as const,
      tone: "mint" as const,
      index: "02",
      eyebrow: t("footer.lane2Eyebrow"),
      title: t("footer.lane2Title"),
      body: t("footer.lane2Body"),
      href: "/trading/accounts",
      cta: t("footer.lane2Cta"),
    },
  ];

  const metaColumns = META_COLUMN_KEYS.map(columnFor).filter(
    (column): column is NonNullable<typeof column> => Boolean(column),
  );

  return (
    <footer className="relative isolate overflow-hidden bg-[var(--cf-hero-bg)] text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_-10%,rgb(var(--cf-brand-glow)/0.38),transparent_48%),radial-gradient(circle_at_92%_120%,rgb(var(--cf-accent-glow)/0.12),transparent_44%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
      />

      <Container className="relative">
        {/* CTA band — headline and its buttons stay in one left-aligned stack so
            the action never floats away from the sentence that earns it. */}
        <div className="border-b border-white/16 py-16 lg:py-24">
          <p className="font-mono text-xs tracking-[0.22em] text-white/75 uppercase">
            {t("footer.ctaEyebrow")}
          </p>
          <h2 className="font-display mt-6 max-w-[52rem] text-[clamp(2.125rem,1.25rem+3.1vw,3.5rem)] leading-[1.06] font-semibold tracking-[-0.03em] text-white">
            {t("footer.ctaTitle")}
            <span className="block">{t("footer.ctaTitleLine2")}</span>
          </h2>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={site.signupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-glow group inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-white shadow-[0_0_24px_rgb(var(--cf-brand-glow)/0.4)] transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[var(--cf-brand-hover)] hover:shadow-[0_0_28px_rgb(var(--cf-brand-glow)/0.55)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:w-auto"
            >
              {t("header.create")}
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/35 px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:border-white/60 hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:w-auto"
            >
              {t("footer.talkToDesk")}
            </Link>
          </div>
        </div>

        {/* Editorial product split — both landings lead. Open columns divided by
            a fading hairline rather than butted panels. */}
        <div className="relative grid border-b border-white/16 lg:grid-cols-2">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-14 left-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/12 to-transparent lg:block"
          />
          {productLanes.map((lane, index) => {
            const column = columnFor(lane.key);
            return (
              <div
                key={lane.href}
                className={cn(
                  "py-12 lg:py-16",
                  index === 0
                    ? "lg:pe-16"
                    : "border-t border-white/16 lg:border-t-0 lg:ps-16",
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className={cn(
                      "h-4 w-[3px] rounded-full",
                      lane.tone === "brand" ? "bg-brand" : "bg-mint",
                    )}
                  />
                  <span className="font-mono text-xs tracking-[0.18em] text-white/60">
                    {lane.index}
                  </span>
                  <span className="font-mono text-xs tracking-[0.18em] text-white/75 uppercase">
                    {lane.eyebrow}
                  </span>
                </div>

                <Link href={lane.href} className="mt-5 block">
                  <h3 className="font-display text-[1.75rem] font-semibold tracking-[-0.02em] text-white sm:text-[2rem]">
                    {lane.title}
                  </h3>
                </Link>
                <p className="mt-4 max-w-[46ch] text-[0.9375rem] leading-relaxed text-white/78">
                  {lane.body}
                </p>

                {column && (
                  <ul className="mt-8 grid gap-x-8 sm:grid-cols-2">
                    {column.links.map((link) => (
                      <li
                        key={`${lane.key}-${link.href}`}
                        className="border-t border-white/16"
                      >
                        <Link
                          href={link.href}
                          className="block py-2.5 text-sm text-white/80 transition-colors hover:text-white"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                <Link
                  href={lane.href}
                  className="group mt-8 inline-flex items-center gap-2 rounded-full border border-white/35 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/8"
                >
                  {lane.cta}
                  <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:scale-x-[-1]" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Meta grid — brand + contact, link columns, newsletter. */}
        <div className="grid gap-12 border-b border-white/16 py-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)_minmax(0,1.3fr)] lg:gap-16">
          <div>
            <Link href={localizedPath("/", locale)} aria-label="Connect Funded home">
              <Logo tone="onDark" />
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/72">
              {t("footer.brandDescription")}
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-white/75">
              {contactItems.map((item) => (
                <li key={item.label} className="flex items-start gap-2.5">
                  <item.icon className="mt-0.5 size-4 shrink-0 text-white/60" />
                  {item.href ? (
                    <a
                      href={item.href}
                      className="transition-colors hover:text-white"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span>{item.label}</span>
                  )}
                </li>
              ))}
            </ul>
            <SocialLinks className="mt-7" tone="onDark" />
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {metaColumns.map((column) => (
              <nav key={column.key} aria-label={column.title}>
                <h4 className="font-mono text-xs tracking-[0.18em] text-white/70 uppercase">
                  {column.title}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={`${column.key}-${link.href}`}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/75 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <div className="rounded-2xl border border-white/18 bg-white/[0.05] p-6 sm:p-7">
            <h4 className="font-display text-base font-semibold text-white">
              {t("footer.marketNotesTitle")}
            </h4>
            <p className="mt-1.5 text-sm leading-relaxed text-white/72">
              {t("footer.marketNotesBody")}
            </p>
            <NewsletterForm className="mt-5" tone="onDark" />
          </div>
        </div>

        {/* Bottom bar — risk, copyright, locales. */}
        <div className="py-9">
          <p className="max-w-4xl text-xs leading-relaxed text-white/60">
            <span className="font-semibold text-white/85">{t("footer.riskDisclosureLabel")}</span>{" "}
            {getRiskDisclosure(locale)}
          </p>
          <div className="mt-6 flex flex-col gap-3 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {site.name}. {t("footer.rightsReserved")}
            </p>
            <LocaleSwitcher className="border-white/20 bg-white/[0.06] text-white/80" />
          </div>
        </div>
      </Container>
    </footer>
  );
}
