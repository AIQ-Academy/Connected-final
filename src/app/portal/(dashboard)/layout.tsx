import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppShell, type AppNavItem } from "@/components/app/app-shell";
import { loadWorkspace } from "@/components/portal/workspace-data";
import { requireSession, type SessionRole } from "@/lib/auth";
import { getServerLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Client portal",
    template: "%s · Connect Funded client portal",
  },
  robots: { index: false, follow: false },
};

export default async function PortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireSession("/portal");
  const [workspace, locale] = await Promise.all([
    loadWorkspace(session.userId),
    getServerLocale(),
  ]);
  const dictionary = getDictionary(locale);
  const t = (key: keyof typeof dictionary) => dictionary[key];
  const roleLabels: Record<SessionRole, string> = {
    trader: t("shell.trader"),
    admin: locale === "fr" ? "Opérations" : locale === "ar" ? "العمليات" : "Operations",
    support_agent: t("shell.supportDesk"),
    sales_agent: t("shell.salesDesk"),
  };

  const openTickets =
    workspace?.tickets.filter(({ ticket }) => ticket.status !== "closed").length ??
    0;

  const nav: AppNavItem[] = [
    { label: t("shell.dashboard"), href: "/portal", icon: "dashboard", exact: true },
    { label: t("shell.accounts"), href: "/portal/accounts", icon: "accounts" },
    { label: t("shell.payouts"), href: "/portal/payouts", icon: "payouts" },
    { label: t("shell.verification"), href: "/portal/kyc", icon: "kyc" },
    {
      label: t("shell.support"),
      href: "/portal/support",
      icon: "support",
      count: openTickets,
    },
  ];

  return (
    <AppShell
      nav={nav}
      user={{
        fullName: workspace?.user.fullName ?? session.fullName,
        email: workspace?.user.email ?? session.email,
        roleLabel: roleLabels[session.role],
      }}
      workspaceLabel={t("shell.clientPortal")}
      homeHref="/portal"
    >
      {children}
    </AppShell>
  );
}
