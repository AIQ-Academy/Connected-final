import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { RegisterExperience } from "@/components/register/register-experience";
import type { WizardTier } from "@/components/register/register-wizard";
import { Aurora } from "@/components/ui/aurora";
import { Container } from "@/components/ui/container";
import { getServerLocale } from "@/lib/i18n/server";
import { getAccountTiers, getSiteSettings } from "@/db/queries";
import {
  productComingSoonHref,
  productIsEnabled,
  type ProductKey,
} from "@/lib/products";

export const metadata: Metadata = {
  title: "Create your account",
  description:
    "Open a Connect Funded evaluation with AI-guided onboarding or the classic form. Choose an account from $10,000 to $200,000 and keep up to 90% of the profit.",
};

export const revalidate = 300;

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{
    tier?: string;
    mode?: string;
    type?: string;
  }>;
}) {
  const params = await searchParams;
  const [flags, locale] = await Promise.all([getSiteSettings(), getServerLocale()]);
  const copy = locale === "fr" ? {
    eyebrow: "Inscription", title: "Commencez votre parcours avec un accompagnement par IA", lead: "Échangez sur la configuration de votre évaluation, remplissez les formulaires sécurisés pour votre identité et les conditions, puis accédez à l’espace client pour effectuer la vérification et le paiement. Vous préférez un parcours guidé ? Passez au formulaire classique à tout moment.", existing: "Vous avez déjà un compte ?", signIn: "Connectez-vous à l’espace client",
  } : locale === "ar" ? {
    eyebrow: "التسجيل", title: "ابدأ مع إعداد موجّه بالذكاء الاصطناعي", lead: "ناقش إعداد التقييم، وأكمل النماذج الآمنة الخاصة بالهوية والشروط، ثم انتقل إلى بوابة العميل لإتمام التحقق والدفع. إذا كنت تفضّل خطوات ثابتة، يمكنك التبديل إلى النموذج التقليدي في أي وقت.", existing: "لديك حساب بالفعل؟", signIn: "سجّل الدخول إلى بوابة العميل",
  } : {
    eyebrow: "Registration", title: "Start with AI-guided onboarding", lead: "Chat through your evaluation setup, fill secure form cards for identity and terms, and land in the client portal ready for KYC and payment. Prefer a fixed wizard? Switch to the classic form anytime.", existing: "Already have an account?", signIn: "Sign in to the client portal",
  };

  const product: ProductKey = params.type === "broker" ? "broker" : "funded";
  const enabled = productIsEnabled(product, flags);
  if (!enabled) {
    // Product is disabled in admin; send user to the coming-soon landing.
    redirect(productComingSoonHref(product));
  }

  const tiers = await getAccountTiers();

  const wizardTiers: WizardTier[] = tiers.map((tier) => ({
    id: tier.id,
    code: tier.code,
    name: tier.name,
    accountSize: Number(tier.accountSize),
    price: Number(tier.price),
    phase1TargetPct: Number(tier.phase1TargetPct),
    phase2TargetPct: Number(tier.phase2TargetPct),
    maxDailyDrawdownPct: Number(tier.maxDailyDrawdownPct),
    maxOverallDrawdownPct: Number(tier.maxOverallDrawdownPct),
    minTradingDays: Number(tier.minTradingDays),
    profitSplitPct: Number(tier.profitSplitPct),
    payoutFrequency: tier.payoutFrequency,
    maxLeverage: tier.maxLeverage,
    isFeatured: tier.isFeatured,
  }));

  const initialMode = params.mode === "classic" ? "classic" : "ai";

  return (
    <div className="relative pt-10 pb-20 sm:pt-14">
      <Aurora className="opacity-70" />

      <Container>
        <div className="mb-9 max-w-2xl">
          <span className="eyebrow mb-4">
            <span className="chev" />
            {copy.eyebrow}
          </span>
          <h1 className="text-h1">
            {copy.title}
          </h1>
          <p className="text-lead text-muted mt-4">
            {copy.lead}
          </p>
          <p className="text-faint mt-3 text-[0.8125rem]">
            {copy.existing}{" "}
            <Link
              href="/portal/login"
              className="text-brand-light underline-offset-4 hover:underline"
            >
              {copy.signIn}
            </Link>
            .
          </p>
        </div>

        <RegisterExperience
          tiers={wizardTiers}
          initialTierCode={params.tier}
          initialMode={initialMode}
        />
      </Container>
    </div>
  );
}
