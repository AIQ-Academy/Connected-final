"use client";

import { AnimatePresence, motion, type Variants } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { SiteSearch } from "@/components/search/site-search";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useIntroStage } from "@/lib/home-intro";
import { isHomeIntroPath, isProductLandingPath } from "@/lib/products";
import { primaryNav, signupUrl, type NavGroup } from "@/lib/site";
import { cn } from "@/lib/utils";

const CINEMA_EASE = [0.22, 1, 0.36, 1] as const;

/** Matches the `h-18` bar; the hero only counts as covering it above this line. */
const BAR_H = 72;

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
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { scrolled, onHero } = useHeaderSurface(pathname);
  const introStage = useIntroStage(isHomeIntroPath(pathname));
  const onHeroSurface = onHero;

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
    href && (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const navLink = (active: unknown) =>
    cn(
      "relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
      "after:pointer-events-none after:absolute after:right-3.5 after:bottom-1 after:left-3.5 after:h-[2px] after:origin-left after:rounded-full after:transition-transform after:duration-300 hover:after:scale-x-100",
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

  return (
    <header
      data-on-hero={onHeroSurface || undefined}
      className={cn(
        "sticky top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300",
        isProductLandingPath(pathname) && "-mb-18",
        onHeroSurface
          ? "border-b border-transparent bg-transparent"
          : cn(
              "border-b border-line/60 bg-white",
              scrolled &&
                "shadow-[0_16px_50px_-30px_rgb(var(--cf-shadow-color)/0.7)]",
            ),
      )}
      onMouseLeave={scheduleClose}
    >
      <Container>
        <motion.div
          initial={false}
          variants={barMotion}
          animate={introStage === "waiting" ? "hidden" : "shown"}
          className="flex h-18 items-center justify-between gap-6"
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
                tone={onHeroSurface ? "onDark" : "default"}
              />
            </Link>
          </motion.div>

          <motion.nav
            variants={barItemMotion}
            aria-label="Primary"
            className="hidden items-center gap-1 lg:flex"
          >
            {primaryNav.map((group) => {
              const hasPanel = Boolean(group.columns);
              const open = openMenu === group.label;

              if (!hasPanel) {
                return (
                  <Link
                    key={group.label}
                    href={group.href ?? "#"}
                    onMouseEnter={() => {
                      cancelClose();
                      setOpenMenu(null);
                    }}
                    className={navLink(isActive(group.href))}
                  >
                    {group.label}
                  </Link>
                );
              }

              // Groups that own a landing page (Trading → /trading) render the
              // label as a real link so the landing pages are reachable
              // directly from the bar, while hover still opens the mega-menu.
              // A bare chevron toggles the panel for keyboard and touch
              // without hijacking the link.
              if (group.href) {
                return (
                  <div
                    key={group.label}
                    className="relative flex items-center"
                    onMouseEnter={() => {
                      cancelClose();
                      setOpenMenu(group.label);
                    }}
                  >
                    <Link
                      href={group.href}
                      className={cn(
                        "pr-1",
                        navLink(open || isActive(group.href)),
                      )}
                    >
                      {group.label}
                    </Link>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-haspopup="true"
                      aria-label={`${group.label} menu`}
                      onClick={() => setOpenMenu(open ? null : group.label)}
                      className={cn(
                        "-ml-1 rounded-lg p-1.5 transition-colors",
                        onHeroSurface
                          ? "text-white/70 hover:text-white"
                          : "text-muted hover:text-ink",
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
                  key={group.label}
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
                      navLink(open || isActive(group.href)),
                    )}
                  >
                    {group.label}
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
            className="flex items-center gap-2"
          >
            <SiteSearch
              className={cn(
                onHeroSurface &&
                  "border-white/25 text-white/80 hover:border-white/50 hover:text-white [&_kbd]:border-white/25 [&_kbd]:bg-white/10 [&_kbd]:text-white/70",
              )}
            />
            {/* <ButtonLink
              href="/portal"
              variant="ghost"
              size="sm"
              className={cn(
                "hidden md:inline-flex",
                onHeroSurface &&
                  "text-white/80 hover:bg-white/10 hover:text-white",
              )}
            >
              Client Login
            </ButtonLink> */}
            <ButtonLink
              href={signupUrl}
              size="sm"
              className={cn(
                "hidden sm:inline-flex",
                onHeroSurface &&
                  "bg-white text-[#06070e] shadow-none hover:bg-white/90",
              )}
            >
              Create account
            </ButtonLink>
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
              className={cn(
                "grid size-9 place-items-center rounded-lg border lg:hidden",
                onHeroSurface
                  ? "border-white/25 text-white"
                  : "border-line text-ink",
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
        onEnter={cancelClose}
        onLeave={scheduleClose}
      />

      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        createAccountHref={signupUrl}
      />
    </header>
  );
}

function MegaMenu({
  group,
  onEnter,
  onLeave,
}: {
  group: NavGroup | null;
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
          className="absolute inset-x-0 top-full hidden border-b border-line/60 bg-white shadow-[0_30px_60px_-30px_rgb(0_0_0/0.12)] lg:block"
        >
          <Container className="relative">
            <div className="grid gap-10 py-9 lg:grid-cols-[1fr_1fr_minmax(0,340px)]">
              {group.columns.map((column) => (
                <div key={column.title}>
                  <p className="eyebrow mb-4">{column.title}</p>
                  <ul className="space-y-1">
                    {column.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="group -mx-3 block rounded-xl px-3 py-2.5 transition-colors hover:bg-brand-dim/25"
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
                  className="group relative overflow-hidden rounded-2xl border border-line bg-[#f6f7fb] p-6"
                >
                  <div className="absolute -top-16 -right-16 size-40 rounded-full bg-brand/25 blur-3xl" />
                  <div className="relative">
                    <span className="chev mb-4 block size-3.5" />
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
}: {
  open: boolean;
  onClose: () => void;
  createAccountHref: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-bg fixed inset-x-0 top-18 bottom-0 z-40 overflow-y-auto lg:hidden"
        >
          <Container className="py-6">
            <nav aria-label="Mobile" className="space-y-7">
              {primaryNav.map((group) =>
                group.columns ? (
                  <div key={group.label}>
                    {group.href ? (
                      <Link
                        href={group.href}
                        onClick={onClose}
                        className="eyebrow mb-3 hover:text-brand-light"
                      >
                        {group.label}
                      </Link>
                    ) : (
                      <p className="eyebrow mb-3">{group.label}</p>
                    )}
                    <ul className="border-line-soft space-y-0.5 border-l pl-4">
                      {group.columns
                        .flatMap((c) => c.links)
                        .map((link) => (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              onClick={onClose}
                              className="text-ink flex items-center justify-between py-2.5 text-[0.9375rem] font-medium"
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
                    className="text-ink block text-base font-semibold"
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
                onClick={onClose}
              >
                Create account
              </ButtonLink>
              {/* <ButtonLink
                href="/portal"
                variant="soft"
                size="lg"
                block
                onClick={onClose}
              >
                Client Login
              </ButtonLink> */}
            </div>
          </Container>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
