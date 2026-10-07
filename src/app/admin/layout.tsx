import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppShell, type AppNavItem } from "@/components/app/app-shell";
import { getAdminKpis, getPayoutQueue } from "@/db/admin-queries";
import { requireRole } from "@/lib/auth";

// The desk is a live view of the operational database. Nothing here may be
// served from a cache: a registration completed seconds ago has to be visible
// on the next request.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Operations desk",
  description:
    "Connect Funded internal operations: registrations, CRM leads, KYC review, support and payouts.",
  robots: { index: false, follow: false },
};

const roleLabels: Record<string, string> = {
  admin: "Administrator",
  support_agent: "Support agent",
  sales_agent: "Sales agent",
  trader: "Trader",
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireRole("admin", { redirectTo: "/admin" });

  const [kpis, payoutQueue] = await Promise.all([
    getAdminKpis(),
    getPayoutQueue(),
  ]);

  const pendingPayouts = payoutQueue.filter(
    (row) => row.payout.status === "requested" || row.payout.status === "processing",
  ).length;

  const nav: AppNavItem[] = [
    { label: "Overview", href: "/admin", icon: "dashboard", exact: true },
    { label: "Content", href: "/admin/content", icon: "dashboard" },
    { label: "Media", href: "/admin/media", icon: "media" },
    { label: "Knowledge gaps", href: "/admin/knowledge", icon: "support" },
    {
      label: "CRM leads",
      href: "/admin/leads",
      icon: "leads",
      count: kpis?.newLeads ?? 0,
    },
    {
      label: "KYC queue",
      href: "/admin/kyc",
      icon: "compliance",
      count: kpis?.kycPending ?? 0,
    },
    {
      label: "Support",
      href: "/admin/support",
      icon: "support",
      count: kpis?.openTickets ?? 0,
    },
    {
      label: "Payouts",
      href: "/admin/payouts",
      icon: "treasury",
      count: pendingPayouts,
    },
  ];

  return (
    <AppShell
      nav={nav}
      user={{
        fullName: session.fullName,
        email: session.email,
        roleLabel: roleLabels[session.role] ?? "Operations",
      }}
      workspaceLabel="Operations"
      homeHref="/admin"
    >
      {children}
    </AppShell>
  );
}
