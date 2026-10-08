import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, LineChart, ShieldCheck, Timer } from "lucide-react";

import { LoginForm } from "@/components/portal/login-form";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { Logo } from "@/components/brand/logo";
import { Aurora } from "@/components/ui/aurora";
import { getSession } from "@/lib/auth";
import { getServerLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizedPath } from "@/lib/i18n/locale";

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
  const [session, locale] = await Promise.all([getSession(), getServerLocale()]);
  const t = getDictionary(locale);
  const copy = locale === "fr" ? {
    portal: "Portail client", welcome: "Ravi de vous revoir", lead: "Suivez votre évaluation, demandez un retrait et contactez le desk depuis un seul espace.", back: "Retour au site", quote: "Les règles de l’évaluation étaient claires dès le premier jour et le premier retrait a été versé exactement à la date prévue. Cela suffit à placer Connect Funded devant les deux sociétés avec lesquelles j’avais tradé auparavant.", trader: "Marwan Haddad — trader financé, Émirats arabes unis", benefits: [
      ["Application des règles de risque côté serveur", "Les limites de drawdown sont appliquées au moment du dépassement, sans réexamen a posteriori."],
      ["Aucune échéance d’évaluation", "Quatre jours de trading minimum, sans pression calendaire pour aucune phase."],
      ["Un compte, tous les marchés", "Forex, métaux, matières premières, indices, CFD sur actions et cryptomonnaies sans autorisations distinctes."],
    ], risk: t["footer.riskWarning"],
  } : locale === "ar" ? {
    portal: "بوابة العميل", welcome: "مرحبًا بعودتك", lead: "تابع تقييمك واطلب السحب وتواصل مع فريق التداول من مكان واحد.", back: "العودة إلى الموقع", quote: "كانت قواعد التقييم واضحة منذ اليوم الأول، ووصل أول سحب في موعده تمامًا. وهذا وحده يجعل Connect Funded أفضل من الشركتين اللتين تداولت معهما سابقًا.", trader: "مروان حداد — متداول ممول، الإمارات العربية المتحدة", benefits: [
      ["تطبيق المخاطر على الخادم", "تُطبّق حدود التراجع فور تجاوزها، ولا تُراجع بأثر رجعي."],
      ["لا موعد نهائي للتقييم", "أربعة أيام تداول كحد أدنى، دون ضغط زمني على أي مرحلة."],
      ["حساب واحد لجميع الأسواق", "الفوركس والمعادن والسلع والمؤشرات وعقود الأسهم مقابل الفروقات والعملات المشفرة دون أذونات منفصلة."],
    ], risk: t["footer.riskWarning"],
  } : {
    portal: "Client portal", welcome: "Welcome back", lead: "Track your evaluation, request a payout and reach the desk — all from one place.", back: "Back to the site", quote: "The evaluation rules were clear from day one and the first payout landed exactly on schedule. That alone puts Connect Funded ahead of the two firms I traded with before.", trader: "Marwan Haddad — funded trader, United Arab Emirates", benefits: [
      ["Server-side risk enforcement", "Drawdown limits are applied at the moment of the breach, never reviewed after the fact."],
      ["No evaluation deadline", "Four minimum trading days, and no calendar pressure on either phase."],
      ["One account, every market", "Forex, metals, commodities, indices, share CFDs and crypto without separate permissions."],
    ], risk: t["footer.riskWarning"],
  };

  if (session) redirect(session.role === "admin" ? "/admin" : "/portal");

  const safeNext = next && /^\/(?!\/)/.test(next) ? next : undefined;

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative flex flex-col justify-between px-5 py-8 sm:px-10 lg:px-14">
        <div className="flex items-center justify-between gap-4">
          <Link href={localizedPath("/", locale)} aria-label="Connect Funded home">
            <Logo />
          </Link>
          <LocaleSwitcher />
        </div>

        <div className="mx-auto w-full max-w-md py-12">
          <span className="eyebrow mb-4">
            <span className="chev" />
            {copy.portal}
          </span>
          <h1 className="font-display text-[2rem] leading-tight font-semibold tracking-[-0.03em]">
            {copy.welcome}
          </h1>
          <p className="text-muted mt-2 mb-8 text-[0.9375rem]">
            {copy.lead}
          </p>

          <LoginForm next={safeNext} />
        </div>

        <Link
          href={localizedPath("/", locale)}
          className="text-faint hover:text-ink inline-flex items-center gap-1.5 text-[0.8125rem] transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          {copy.back}
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
              “{copy.quote}”
            </p>
            <footer className="text-muted mt-5 text-[0.875rem]">
              {copy.trader}
            </footer>
          </blockquote>

          <ul className="mt-12 grid max-w-md gap-5">
            {[
              { icon: ShieldCheck, title: copy.benefits[0][0], body: copy.benefits[0][1] },
              { icon: Timer, title: copy.benefits[1][0], body: copy.benefits[1][1] },
              { icon: LineChart, title: copy.benefits[2][0], body: copy.benefits[2][1] },
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
            {copy.risk}
          </p>
        </div>
      </div>
    </div>
  );
}
