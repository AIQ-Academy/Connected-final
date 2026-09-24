import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppShell, type AppNavItem } from "@/components/app/app-shell";
import { loadWorkspace } from "@/components/portal/workspace-data";
import { requireSession, type SessionRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Client portal",
    template: "%s · Connect Funded client portal",
  },
  robots: { index: false, follow: false },
};

const roleLabels: Record<SessionRole, string> = {
  trader: "Trader",
  admin: "Operations",
  support_agent: "Support desk",
  sales_agent: "Sales desk",
};

export default async function PortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireSession("/portal");
  const workspace = await loadWorkspace(session.userId);

  const openTickets =
    workspace?.tickets.filter(({ ticket }) => ticket.status !== "closed").length ??
    0;

  const nav: AppNavItem[] = [
    { label: "Dashboard", href: "/portal", icon: "dashboard", exact: true },
    { label: "Accounts", href: "/portal/accounts", icon: "accounts" },
    { label: "Payouts", href: "/portal/payouts", icon: "payouts" },
    { label: "Verification", href: "/portal/kyc", icon: "kyc" },
    {
      label: "Support",
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
      workspaceLabel="Client portal"
      homeHref="/portal"
    >
      {children}
    </AppShell>
  );
}
