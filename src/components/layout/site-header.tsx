"use client";

import { AnimatePresence, motion, type Variants } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { SiteSearch } from "@/components/search/site-search";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useIntroStage } from "@/lib/home-intro";
import {
  isHomeIntroPath,
  isProductLandingPath,
} from "@/lib/products";
import { getPrimaryNav, signupUrl, type NavGroup } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/locale-provider";

const CINEMA_EASE = [0.22, 1, 0.36, 1] as const;

/** Matches the `h-18` bar; the hero only counts as covering it above this line. */
const BAR_H = 72;
const goldCtaClass =
  "bg-[#d6ad62] text-[#142237] shadow-[inset_0_1px_0_0_rgb(255_255_255/0.28)] hover:bg-[#e5bd73]";

const barMotion: Variants = {
  hidden: { opacity: 0, y: -20 },
  shown: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: CINEMA_EASE,
      delay: 0.5,
      delayChildren: 0.58,
      staggerChildren: 0.08,
    },
  },
};

const barItemMotion: Variants = {
  hidden: { opacity: 0, y: -12 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.7, ease: CINEMA_EASE } },
};

const useBeforePaint =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

type HeaderSurface = { scrolled: boolean; onHero: boolean };

function useHeaderSurface(pathname: string): HeaderSurface {
  const [surface, setSurface] = useState<HeaderSurface>(() => ({
    scrolled: false,
    onHero: isProductLandingPath(pathname),
  }));

  const measure = useCallback(() => {
    const hero = document.querySelector<HTMLElement>("[data-hero-stage]");
    const next: HeaderSurface = {
      scrolled: window.scrollY > 12,
      onHero: hero !== null && hero.getBoundingClientRect().bottom > BAR_H,
    };
    setSurface((prev) =>
      prev.scrolled === next.scrolled && prev.onHero === next.onHero
        ? prev
        : next,
    );
  }, []);

  useBeforePaint(() => {
    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        measure();
      });
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [measure, pathname]);

  return surface;
}

export function SiteHeader() {
  const pathname = usePathname();
  const [currentHash, setCurrentHash] = useState("");
  const { t, locale } = useLocale();
  const primaryNav = useMemo(() => getPrimaryNav(locale), [locale]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { scrolled, onHero } = useHeaderSurface(pathname);
  const introStage = useIntroStage(isHomeIntroPath(pathname));
  const onHeroSurface = onHero;
  const controlsOnDark = onHeroSurface;

  useEffect(() => {
    const syncHash = () => setCurrentHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  const [renderedPath, setRenderedPath] = useState(pathname);
  if (renderedPath !== pathname) {
    setRenderedPath(pathname);
    setOpenMenu(null);
    setMobileOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpenMenu(null);
      setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 140);
  }

  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }

  const isActive = (href?: string) =>
    Boolean(href && isNavigationTargetActive(pathname, currentHash, href));
  const isGroupActive = (group: NavGroup) =>
    Boolean(
      isActive(group.href) ||
        group.columns?.some((column) => column.links.some((link) => isActive(link.href))),
    );

  const navLink = (active: unknown) =>
    cn(
      "relative whitespace-nowrap rounded-lg px-2.5 py-2 text-[15px] font-medium tracking-[-0.01em] transition-colors",
      "after:pointer-events-none after:absolute after:end-3.5 after:bottom-1 after:start-3.5 after:h-[2px] after:origin-left after:rounded-full after:transition-transform after:duration-300 hover:after:scale-x-100",
      onHeroSurface ? "after:bg-white/80" : "after:bg-brand-light",
      active ? "after:scale-x-100" : "after:scale-x-0",
      onHeroSurface
        ? active
          ? "text-white"
          : "text-white/70 hover:text-white"
        : active
          ? "text-ink"
          : "text-muted hover:text-ink",
    );

  const navLabel = (label: string) => label;

  return (
    <header
      data-on-hero={onHeroSurface || undefined}
      className={cn(
        "sticky top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300",
        isProductLandingPath(pathname) && "-mb-[76px]",
        onHeroSurface
          ? "border-b border-transparent bg-transparent"
          : cn(
              "border-b border-line-soft/80 text-ink backdrop-blur-xl",
              scrolled
                ? "bg-[color-mix(in_srgb,var(--cf-bg-raised)_92%,transparent)] shadow-[0_16px_50px_-30px_rgb(var(--cf-shadow-color)/0.7)]"
                : "bg-[color-mix(in_srgb,var(--cf-bg-raised)_72%,transparent)]",
            ),
      )}
      onMouseLeave={scheduleClose}
    >
      <Container className="px-3 sm:px-7 lg:px-8">
        <motion.div
          initial={false}
          variants={barMotion}
          animate={introStage === "waiting" ? "hidden" : "shown"}
            className="flex h-[76px] items-center justify-between gap-2 sm:gap-4 xl:gap-6"
        >
          <motion.div variants={barItemMotion} className="shrink-0">
            <Link
              href="/"
              className="rounded-md"
              aria-label={`Connect Funded home`}
            >
              <Logo
                key={pathname}
                priority
                animateMark={isProductLandingPath(pathname)}
                tone={controlsOnDark ? "onDark" : "auto"}
                markClassName="h-7 sm:h-8"
              />
            </Link>
          </motion.div>

          <motion.nav
            variants={barItemMotion}
            aria-label="Primary"
            className="hidden items-center gap-0.5 xl:flex"
          >
            {primaryNav.map((group) => {
              const hasPanel = Boolean(group.columns);
              const open = openMenu === group.label;
              const active = isGroupActive(group);

              if (!hasPanel) {
                return (
                  <Link
                    key={navLabel(group.label)}
                    href={group.href ?? "#"}
                    onMouseEnter={() => {
                      cancelClose();
                      setOpenMenu(null);
                    }}
                    className={navLink(isActive(group.href))}
                    aria-current={isActive(group.href) ? "page" : undefined}
                  >
                    {navLabel(group.label)}
                  </Link>
                );
              }

              // Groups that own a landing page (Funding → /funded, Trading →
              // /trading) render the label as a real link so the landing pages
              // are reachable directly from the bar, while hover still opens
              // the mega-menu. A bare chevron toggles the panel for keyboard
              // and touch without hijacking the link.
              if (group.href) {
                return (
                  <div
                    key={navLabel(group.label)}
                    className="relative flex items-center"
                    onMouseEnter={() => {
                      cancelClose();
                      setOpenMenu(group.label);
                    }}
                  >
                    <Link
                      href={group.href}
                      className={cn("pe-1", navLink(open || active))}
                      aria-current={active ? "page" : undefined}
                    >
                      {navLabel(group.label)}
                    </Link>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-haspopup="true"
                      aria-label={`${navLabel(group.label)} menu`}
                      onClick={() => setOpenMenu(open ? null : group.label)}
                      className={cn(
                        "-ml-1 rounded-lg p-1.5 transition-colors",
                        onHeroSurface
                          ? "text-white/70 hover:text-white"
                          : "text-[var(--cf-nav-muted)] hover:text-[var(--cf-nav-text)]",
                      )}
                    >
                      <ChevronDown
                        className={cn(
                          "size-3.5 transition-transform duration-200",
                          open && "rotate-180",
                        )}
                      />
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={navLabel(group.label)}
                  className="relative"
                  onMouseEnter={() => {
                    cancelClose();
                    setOpenMenu(group.label);
                  }}
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-haspopup="true"
                    onClick={() => setOpenMenu(open ? null : group.label)}
                    className={cn(
                      "flex items-center gap-1.5",
                      navLink(open || active),
                    )}
                  >
                    {navLabel(group.label)}
                    <ChevronDown
                      className={cn(
                        "size-3.5 transition-transform duration-200",
                        open && "rotate-180",
                      )}
                    />
                  </button>
                </div>
              );
            })}
          </motion.nav>

          <motion.div
            variants={barItemMotion}
            className="flex shrink-0 items-center gap-1 sm:gap-2"
          >
            <SiteSearch
              className={cn(
                "hidden sm:inline-flex",
                controlsOnDark
                  ? "border-white/30 bg-white/10 text-white/90 hover:border-white/55 hover:bg-white/15 hover:text-white [&_kbd]:border-white/25 [&_kbd]:bg-white/10 [&_kbd]:text-white/75"
                  : "border-line bg-panel/80 text-muted hover:border-brand-light/60 hover:bg-panel hover:text-ink [&_kbd]:border-line [&_kbd]:bg-bg [&_kbd]:text-muted",
              )}
            />
            <LocaleSwitcher
              tone={controlsOnDark ? "onDark" : "default"}
              className={cn(
                "gap-0 px-1 [&>span>span[aria-hidden=true]]:hidden [&_svg]:hidden sm:gap-1 sm:px-2 sm:[&>span>span[aria-hidden=true]]:inline sm:[&_svg]:inline-flex",
                controlsOnDark
                  ? "border-white/25 bg-white/10 text-white/90 hover:border-white/50 hover:text-white"
                  : "border-line bg-panel/80 text-muted hover:border-brand-light/60 hover:text-ink",
              )}
            />
            <ThemeToggle
              className={cn(
                controlsOnDark
                  ? "border-white/25 bg-white/10 text-white/90 hover:border-white/50 hover:bg-white/15 hover:text-white"
                  : "border-line bg-panel/80 text-muted hover:border-brand-light/60 hover:bg-panel hover:text-ink",
                "min-[375px]:hidden sm:grid",
              )}
            />
            <ButtonLink
              href="/portal"
              variant="ghost"
              size="sm"
              className={cn(
                "hidden md:inline-flex",
                controlsOnDark
                  ? "text-white/90 hover:bg-white/10 hover:text-white"
                  : "text-ink hover:bg-brand-dim/35 hover:text-brand-light",
              )}
            >
              {t("header.login")}
            </ButtonLink>
            <ButtonLink
              href={signupUrl}
              size="sm"
              className={cn("hidden min-[375px]:inline-flex", goldCtaClass)}
            >
              {t("header.create")}
            </ButtonLink>
            <button
              type="button"
              aria-label={mobileOpen ? t("header.close") : t("header.menu")}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
              className={cn(
                "grid size-9 place-items-center rounded-lg border xl:hidden",
                controlsOnDark
                  ? "border-white/30 bg-white/10 text-white"
                  : "border-line bg-panel/80 text-ink hover:border-brand-light/60 hover:bg-panel",
              )}
            >
              {mobileOpen ? (
                <X className="size-[18px]" />
              ) : (
                <Menu className="size-[18px]" />
              )}
            </button>
          </motion.div>
        </motion.div>
      </Container>

      <MegaMenu
        group={primaryNav.find((g) => g.label === openMenu) ?? null}
        pathname={pathname}
        currentHash={currentHash}
        onEnter={cancelClose}
        onLeave={scheduleClose}
      />

      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        createAccountHref={signupUrl}
        nav={primaryNav}
        pathname={pathname}
        currentHash={currentHash}
        t={t}
      />
    </header>
  );
}

function MegaMenu({
  group,
  pathname,
  currentHash,
  onEnter,
  onLeave,
}: {
  group: NavGroup | null;
  pathname: string;
  currentHash: string;
  onEnter: () => void;
  onLeave: () => void;
}) {
  return (
    <AnimatePresence>
      {group?.columns && (
        <motion.div
          key={group.label}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          className="absolute inset-x-0 top-full hidden border-b border-line/70 bg-raised/95 shadow-[0_30px_60px_-30px_rgb(var(--cf-brand-glow)/0.18)] backdrop-blur-xl lg:block"
        >
          <Container className="relative">
            <div className="grid gap-10 py-9 lg:grid-cols-[1fr_1fr_minmax(0,340px)]">
              {group.columns.map((column) => (
                <div key={column.title}>
                  <p className="eyebrow mb-4">{column.title}</p>
                  <ul className="space-y-1">
                    {column.links.map((link, index) => (
                      <li key={`${column.title}-${link.href}-${index}`}>
                        <Link
                          href={link.href}
                          target={link.external ? "_blank" : undefined}
                          rel={link.external ? "noopener noreferrer" : undefined}
                          aria-current={isNavigationTargetActive(pathname, currentHash, link.href) ? "page" : undefined}
                          className={cn(
                            "group -mx-3 block rounded-xl px-3 py-2.5 transition-colors hover:bg-brand-dim/25",
                            isNavigationTargetActive(pathname, currentHash, link.href) && "bg-brand-dim/25 text-brand-light",
                          )}
                        >
                          <span className="text-ink flex items-center gap-2 text-sm font-semibold">
                            {link.label}
                            {link.badge && (
                              <Badge tone="mint">{link.badge}</Badge>
                            )}
                            <ArrowRight className="text-brand-light size-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-60" />
                          </span>
                          {link.description && (
                            <span className="text-muted mt-0.5 block text-[0.8125rem] leading-snug">
                              {link.description}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {group.featured && (
                <Link
                  href={group.featured.href}
                  className="group relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-brand-dim/55 via-raised to-panel p-6"
                >
                  <div className="relative">
                    <h3 className="text-ink text-base font-semibold">
                      {group.featured.title}
                    </h3>
                    <p className="text-muted mt-2 text-[0.8125rem] leading-relaxed">
                      {group.featured.body}
                    </p>
                    <span className="text-brand-light mt-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold">
                      {group.featured.cta}
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              )}
            </div>
          </Container>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MobileDrawer({
  open,
  onClose,
  createAccountHref,
  nav,
  pathname,
  currentHash,
  t,
}: {
  open: boolean;
  onClose: () => void;
  createAccountHref: string;
  nav: NavGroup[];
  pathname: string;
  currentHash: string;
  t: (key: import("@/lib/i18n/dictionaries").DictionaryKey) => string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-bg fixed inset-x-0 top-[76px] bottom-0 z-40 overflow-y-auto lg:hidden"
        >
          <Container className="py-6">
            <nav aria-label="Mobile" className="space-y-7">
              {nav.map((group) =>
                group.columns ? (
                  <div key={group.label}>
                    {group.href ? (
                      <Link
                        href={group.href}
                        onClick={onClose}
                        aria-current={isNavigationGroupActive(pathname, currentHash, group) ? "page" : undefined}
                        className={cn(
                          "eyebrow mb-3 hover:text-brand-light",
                          isNavigationGroupActive(pathname, currentHash, group) && "text-brand-light",
                        )}
                      >
                        {group.label}
                      </Link>
                    ) : (
                      <p className={cn("eyebrow mb-3", isNavigationGroupActive(pathname, currentHash, group) && "text-brand-light")}>{group.label}</p>
                    )}
                    <ul className="border-line-soft space-y-0.5 border-s ps-4">
                      {group.columns
                        .flatMap((c) => c.links)
                        .map((link, index) => (
                          <li key={`${group.label}-${link.href}-${index}`}>
                            <Link
                              href={link.href}
                              target={link.external ? "_blank" : undefined}
                              rel={link.external ? "noopener noreferrer" : undefined}
                              onClick={onClose}
                              aria-current={isNavigationTargetActive(pathname, currentHash, link.href) ? "page" : undefined}
                              className={cn(
                                "text-ink flex items-center justify-between rounded-lg px-3 py-3 text-[17px] font-medium transition-colors",
                                isNavigationTargetActive(pathname, currentHash, link.href) && "bg-brand-dim/25 text-brand-light",
                              )}
                            >
                              {link.label}
                              {link.badge && (
                                <Badge tone="mint">{link.badge}</Badge>
                              )}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                ) : (
                  <Link
                    key={group.label}
                    href={group.href ?? "#"}
                    onClick={onClose}
                    aria-current={isNavigationTargetActive(pathname, currentHash, group.href ?? "#") ? "page" : undefined}
                    className={cn("block text-[18px] font-semibold", isNavigationTargetActive(pathname, currentHash, group.href ?? "#") && "text-brand-light")}
                  >
                    {group.label}
                  </Link>
                ),
              )}
            </nav>

            <div className="mt-9 flex flex-col gap-3">
              <ButtonLink
                href={createAccountHref}
                size="lg"
                block
                className={goldCtaClass}
                onClick={onClose}
              >
                {t("header.create")}
              </ButtonLink>
              <ButtonLink
                href="/portal"
                variant="soft"
                size="lg"
                block
                onClick={onClose}
              >
                {t("header.login")}
              </ButtonLink>
            </div>
          </Container>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function isNavigationTargetActive(pathname: string, currentHash: string, href: string) {
  if (!href || href.startsWith("http://") || href.startsWith("https://")) return false;

  const [hrefPath = "/", hrefHash = ""] = href.split("#", 2);
  const normalizePath = (path: string) => {
    const withoutLocale = path.replace(/^\/(?:ar|fr)(?=\/|$)/, "") || "/";
    const trimmed = withoutLocale.replace(/\/$/, "");
    return trimmed || "/";
  };

  const currentPath = normalizePath(pathname);
  const targetPath = normalizePath(hrefPath);
  const pathMatches =
    currentPath === targetPath ||
    (targetPath !== "/" && currentPath.startsWith(`${targetPath}/`));

  if (!pathMatches) return false;
  if (hrefHash && currentPath === targetPath) return currentHash === `#${hrefHash}`;
  return true;
}

function isNavigationGroupActive(pathname: string, currentHash: string, group: NavGroup) {
  if (group.href && isNavigationTargetActive(pathname, currentHash, group.href)) return true;
  return Boolean(
    group.columns?.some((column) =>
      column.links.some((link) => isNavigationTargetActive(pathname, currentHash, link.href)),
    ),
  );
}
