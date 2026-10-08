"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  Gauge,
  Image as ImageIcon,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  ShieldCheck,
  UserPlus,
  Users,
  Wallet,
  X,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { useLocale } from "@/components/i18n/locale-provider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DictionaryKey } from "@/lib/i18n/dictionaries";
import { localizedPath } from "@/lib/i18n/locale";
import { RouteTransition } from "@/components/motion/route-transition";

const shellLabelKeys: Partial<Record<string, DictionaryKey>> = {
  Dashboard: "shell.dashboard", Accounts: "shell.accounts", Payouts: "shell.payouts",
  Verification: "shell.verification", Support: "shell.support", Content: "shell.content",
  Media: "shell.media", Leads: "shell.leads", "KYC review": "shell.kyc",
  Operations: "shell.operations", "Support desk": "shell.supportDesk", "Sales desk": "shell.salesDesk",
  "Client portal": "shell.clientPortal",
  Trader: "shell.trader", "Support agent": "shell.supportDesk",
  Overview: "shell.dashboard", "CRM leads": "shell.leads", "KYC queue": "shell.kyc",
};

const icons = {
  dashboard: LayoutDashboard,
  accounts: Gauge,
  payouts: Wallet,
  kyc: BadgeCheck,
  support: LifeBuoy,
  traders: Users,
  leads: UserPlus,
  compliance: ShieldCheck,
  treasury: Banknote,
  media: ImageIcon,
} as const;

export type NavIcon = keyof typeof icons;

export type AppNavItem = {
  label: string;
  href: string;
  icon: NavIcon;
  /** Rendered as a small count pill on the right of the row. */
  count?: number;
  exact?: boolean;
};

export type AppShellUser = {
  fullName: string;
  email: string;
  roleLabel: string;
};

export function AppShell({
  nav,
  user,
  workspaceLabel,
  homeHref,
  children,
}: {
  nav: AppNavItem[];
  user: AppShellUser;
  workspaceLabel: string;
  homeHref: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { direction, t } = useLocale();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  /** The drawer copy closes itself on navigation; the docked copy never opens. */
  const renderSidebar = (onNavigate?: () => void) => (
    <SidebarContent
      nav={nav}
      user={user}
      workspaceLabel={workspaceLabel}
      homeHref={homeHref}
      pathname={pathname}
      onNavigate={onNavigate}
    />
  );

  return (
    <div className="bg-bg min-h-dvh lg:grid lg:grid-cols-[16.5rem_1fr]">
      <aside className="border-line-soft bg-panel sticky top-0 hidden h-dvh flex-col border-e lg:flex">
        {renderSidebar()}
      </aside>

      <header className="glass border-line-soft sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b px-4 lg:hidden">
        <Link href={homeHref} aria-label="Connect Funded">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t("shell.openNavigation")}
            aria-expanded={open}
            className="border-line text-muted hover:text-ink grid size-9 place-items-center rounded-lg border"
          >
            <Menu className="size-[18px]" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label={t("shell.closeNavigation")}
              className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px] lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="bg-panel border-line-soft fixed inset-y-0 start-0 z-50 flex w-[17.5rem] flex-col border-e lg:hidden"
              initial={reduced ? { opacity: 0 } : { x: direction === "rtl" ? "100%" : "-100%" }}
              animate={reduced ? { opacity: 1 } : { x: 0 }}
              exit={reduced ? { opacity: 0 } : { x: direction === "rtl" ? "100%" : "-100%" }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label={`${t(shellLabelKeys[workspaceLabel] ?? "shell.clientPortal")} navigation`}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("shell.closeNavigation")}
                className="border-line text-muted hover:text-ink absolute top-4 end-4 grid size-8 place-items-center rounded-lg border"
              >
                <X className="size-4" />
              </button>
              {renderSidebar(() => setOpen(false))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="min-w-0 pb-20"><RouteTransition>{children}</RouteTransition></main>
    </div>
  );
}

function SidebarContent({
  nav,
  user,
  workspaceLabel,
  homeHref,
  pathname,
  onNavigate,
}: {
  nav: AppNavItem[];
  user: AppShellUser;
  workspaceLabel: string;
  homeHref: string;
  pathname: string;
  onNavigate?: () => void;
}) {
  const { t, locale } = useLocale();
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-line-soft flex h-16 shrink-0 items-center gap-2.5 border-b px-5">
        <Link
          href={homeHref}
          className="inline-flex items-center"
          aria-label="Connect Funded home"
        >
          <Logo markClassName="h-7 sm:h-8" />
        </Link>
      </div>

      <div className="px-5 pt-5 pb-3">
        <Badge tone="brand">{t(shellLabelKeys[workspaceLabel] ?? "shell.clientPortal")}</Badge>
      </div>

      <nav
        aria-label={`${t(shellLabelKeys[workspaceLabel] ?? "shell.clientPortal")} ${t("shell.sections")}`}
        className="min-h-0 flex-1 overflow-y-auto px-3"
      >
        <ul className="flex flex-col gap-0.5">
          {nav.map((item) => {
            const Icon = icons[item.icon];
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.875rem] transition-colors",
                    active
                      ? "bg-brand-dim/45 text-ink font-medium"
                      : "text-muted hover:bg-sunken hover:text-ink",
                  )}
                >
                  {active && (
                    <span
                      className="bg-brand absolute top-1/2 start-0 h-5 w-[3px] -translate-y-1/2 rounded-e-full"
                      aria-hidden="true"
                    />
                  )}
                  <Icon
                    className={cn(
                      "size-[18px] shrink-0",
                      active
                        ? "text-brand-light"
                        : "text-faint group-hover:text-muted",
                    )}
                  />
                  <span className="truncate">{shellLabelKeys[item.label] ? t(shellLabelKeys[item.label]!) : item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="bg-brand/15 text-brand-light tabular ms-auto rounded-full px-2 py-0.5 font-mono text-[0.6875rem]">
                      {item.count}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="border-line-soft mt-5 border-t px-3 pt-4">
          <LocaleSwitcher className="mb-3 w-full justify-center" />
          <Link
            href={localizedPath("/", locale)}
            onClick={onNavigate}
            className="text-faint hover:text-brand-light inline-flex items-center gap-1.5 text-[0.8125rem] transition-colors"
          >
            {t("shell.backToSite")}
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </nav>

      <div className="border-line-soft shrink-0 border-t p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <span
            className="bg-brand-dim text-brand-light font-display grid size-9 shrink-0 place-items-center rounded-full text-[0.8125rem] font-semibold"
            aria-hidden="true"
          >
            {initials(user.fullName)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.8125rem] font-medium">
              {user.fullName}
            </p>
            <p className="text-faint truncate text-[0.75rem]">{user.email}</p>
          </div>
        </div>
        <div className="mt-1">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}

function SignOutButton() {
  const { t } = useLocale();
  const [pending, setPending] = useState(false);

  return (
    <form
      action="/api/auth/logout"
      method="post"
      className="flex-1"
      onSubmit={() => setPending(true)}
    >
      <button
        type="submit"
        disabled={pending}
        className="border-line text-muted hover:border-loss/50 hover:text-loss flex h-9 w-full items-center justify-center gap-2 rounded-lg border text-[0.8125rem] transition-colors disabled:opacity-60"
      >
        <LogOut className="size-4" />
        {pending ? t("shell.signingOut") : t("shell.signOut")}
      </button>
    </form>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
