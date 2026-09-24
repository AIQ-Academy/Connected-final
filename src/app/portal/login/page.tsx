import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, LineChart, ShieldCheck, Timer } from "lucide-react";

import { LoginForm } from "@/components/portal/login-form";
import { Logo } from "@/components/brand/logo";
import { Aurora } from "@/components/ui/aurora";
import { getSession } from "@/lib/auth";
import { riskDisclosure } from "@/lib/site";

export const metadata: Metadata = {
  title: "Client portal sign in",
  description:
    "Sign in to the Connect Funded client portal to track your evaluation, manage payouts, complete KYC and talk to support.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; signedOut?: string }>;
}) {
  const { next } = await searchParams;
  const session = await getSession();

  if (session) redirect(session.role === "admin" ? "/admin" : "/portal");

  const safeNext = next && /^\/(?!\/)/.test(next) ? next : undefined;

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative flex flex-col justify-between px-5 py-8 sm:px-10 lg:px-14">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" aria-label="Connect Funded home">
            <Logo />
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md py-12">
          <span className="eyebrow mb-4">
            <span className="chev" />
            Client portal
          </span>
          <h1 className="font-display text-[2rem] leading-tight font-semibold tracking-[-0.03em]">
            Welcome back
          </h1>
          <p className="text-muted mt-2 mb-8 text-[0.9375rem]">
            Track your evaluation, request a payout and reach the desk — all from one
            place.
          </p>

          <LoginForm next={safeNext} />
        </div>

        <Link
          href="/"
          className="text-faint hover:text-ink inline-flex items-center gap-1.5 text-[0.8125rem] transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to the site
        </Link>
      </div>

      <div className="bg-sunken relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-center">
        <Aurora intensity="strong" />
        <div
          aria-hidden="true"
          className="bg-grid mask-fade-b pointer-events-none absolute inset-0"
        />

        <div className="relative z-10 px-14 py-16">
          <blockquote className="max-w-md">
            <p className="font-display text-[1.5rem] leading-snug font-medium tracking-[-0.02em]">
              “The evaluation rules were clear from day one and the first payout landed
              exactly on schedule. That alone puts Connect Funded ahead of the two firms
              I traded with before.”
            </p>
            <footer className="text-muted mt-5 text-[0.875rem]">
              Marwan Haddad — funded trader, United Arab Emirates
            </footer>
          </blockquote>

          <ul className="mt-12 grid max-w-md gap-5">
            {[
              {
                icon: ShieldCheck,
                title: "Server-side risk enforcement",
                body: "Drawdown limits are applied at the moment of the breach, never reviewed after the fact.",
              },
              {
                icon: Timer,
                title: "No evaluation deadline",
                body: "Four minimum trading days, and no calendar pressure on either phase.",
              },
              {
                icon: LineChart,
                title: "One account, every market",
                body: "Forex, metals, commodities, indices, share CFDs and crypto without separate permissions.",
              },
            ].map((item) => (
              <li key={item.title} className="flex gap-3.5">
                <span className="border-brand/35 bg-brand/10 text-brand-light grid size-9 shrink-0 place-items-center rounded-xl border">
                  <item.icon className="size-[18px]" />
                </span>
                <span>
                  <span className="block text-[0.9375rem] font-medium">
                    {item.title}
                  </span>
                  <span className="text-muted block text-[0.8125rem]">{item.body}</span>
                </span>
              </li>
            ))}
          </ul>

          <p className="text-faint mt-12 max-w-md text-[0.6875rem] leading-relaxed">
            {riskDisclosure}
          </p>
        </div>
      </div>
    </div>
  );
}
