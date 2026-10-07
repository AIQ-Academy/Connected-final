import type { Metadata } from "next";
import { ArrowRight, Headphones, MessageSquare } from "lucide-react";

import { FaqExplorer } from "@/components/faq/faq-explorer";
import { Reveal } from "@/components/motion/reveal";
import { Aurora, GridBackdrop } from "@/components/ui/aurora";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/section-heading";
import { getFaqs } from "@/db/queries";
import { site } from "@/lib/site";
import { getServerLocale } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers on the two-phase evaluation, drawdown limits, profit splits, payout timing, permitted strategies, KYC and payment methods — searchable and grouped by topic.",
};

const ruleSummary = [
  { label: "Max daily drawdown", value: "5%" },
  { label: "Max overall drawdown", value: "10%" },
  { label: "Minimum trading days", value: "4" },
  { label: "Profit split", value: "80–90%" },
] as const;

export default async function FaqPage() {
  const [faqs, locale] = await Promise.all([getFaqs(), getServerLocale()]);
  const categories = [...new Set(faqs.map((faq) => faq.category))];
  const copy = locale === "ar"
    ? { support: "الدعم", title: "القواعد بوضوح، وبالتفصيل.", lead: "إجابات عن التقييم وحدود السحب وتقاسم الأرباح ومواعيد الدفع والاستراتيجيات المسموحة والتحقق.", how: "كيف يعمل التقييم", ask: "اسأل عن موضوع آخر", four: "أربعة أرقام تفسر معظم الإجابات", daily: "أقصى سحب يومي", overall: "أقصى سحب إجمالي", days: "الحد الأدنى لأيام التداول", split: "نسبة الأرباح", stuck: "ما زال لديك سؤال؟", stuckBody: "إذا لم تجد الإجابة هنا، فقد تكون حالتك مرتبطة بحسابك. أرسل رقم الحساب إلى الفريق وسنرد عليك مباشرةً.", contact: "تواصل مع فريق الدعم", ticket: "افتح تذكرة عبر البوابة", open: "ساعات عمل الفريق", openBody: "يعمل الدعم خمسة أيام أسبوعيًا من افتتاح سيدني يوم الاثنين حتى إغلاق نيويورك يوم الجمعة. تُجاب تذاكر البوابة أولًا، وتُعالج رسائل نهاية الأسبوع عند افتتاح الاثنين.", general: "الدعم العام", funding: "التمويل والأسعار", cta: "اقرأ القواعد، ثم تداول وفقها.", ctaBody: "لا تتغير الشروط بعد الشراء. تُطبّق حدود الحساب الموضحة هنا من جهة الخادم.", create: "إنشاء حساب", compare: "قارن أنواع الحسابات" }
    : locale === "fr"
      ? { support: "Assistance", title: "Les règles, clairement et dans leur intégralité.", lead: "Réponses sur l’évaluation, les limites de perte, le partage des gains, les retraits, les stratégies autorisées et la vérification.", how: "Voir le fonctionnement de l’évaluation", ask: "Poser une autre question", four: "Quatre chiffres au cœur des réponses", daily: "Perte quotidienne maximale", overall: "Perte totale maximale", days: "Jours de trading minimum", split: "Part des gains", stuck: "Une question reste en suspens ?", stuckBody: "Si la réponse n’est pas ici, votre situation est peut-être propre à votre compte. Indiquez votre numéro de compte et notre équipe vous répondra directement.", contact: "Contacter l’équipe", ticket: "Ouvrir un ticket client", open: "Disponibilité de l’équipe", openBody: "L’assistance est disponible cinq jours sur sept, de l’ouverture de Sydney le lundi à la clôture de New York le vendredi. Les tickets du portail sont traités en priorité ; les messages du week-end sont repris à l’ouverture du lundi.", general: "Assistance générale", funding: "Financement et tarifs", cta: "Lisez les règles. Puis tradez en connaissance de cause.", ctaBody: "Les conditions ne changent pas après l’achat. Les limites présentées ici sont appliquées côté serveur à votre compte.", create: "Créer un compte", compare: "Comparer les comptes" }
      : { support: "Support", title: "The rules, in plain language and in full.", lead: "Answers on the evaluation, drawdown limits, profit splits, payouts, permitted strategies and verification.", how: "See how the evaluation works", ask: "Ask something else", four: "The four numbers behind most answers", daily: "Max daily drawdown", overall: "Max overall drawdown", days: "Minimum trading days", split: "Profit split", stuck: "Still stuck on something?", stuckBody: "If the answer is not here, your situation may be specific to your account. Send your account number and the desk will answer directly.", contact: "Contact the desk", ticket: "Open a portal ticket", open: "When the desk is open", openBody: "Support runs five days a week, from the Sydney open on Monday to the New York close on Friday. Portal tickets are answered first; weekend messages are picked up at Monday’s open.", general: "General support", funding: "Funding and pricing", cta: "Read the rules. Then trade them.", ctaBody: "Nothing changes after you buy. The limits shown here are enforced server-side on your account.", create: "Create account", compare: "Compare account tiers" };

  // Built from the full, unfiltered list so search state can never change
  // what the crawler sees.
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <section className="bg-noise relative overflow-hidden pt-14 pb-16 sm:pt-20 lg:pt-24 lg:pb-20">
        <Aurora intensity="medium" />
        <GridBackdrop />
        <div
          aria-hidden="true"
          className="from-bg pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t to-transparent"
        />

        <Container className="relative">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-end lg:gap-16">
            <div>
              <Reveal direction="none">
                <Eyebrow>{copy.support} · {faqs.length} {locale === "ar" ? "إجابة" : locale === "fr" ? "réponses" : "answers"}</Eyebrow>
              </Reveal>

              <Reveal delay={0.06}>
                <h1 className="text-h1 mt-6 max-w-2xl">
                  {copy.title}
                </h1>
              </Reveal>

              <Reveal delay={0.12}>
                <p className="text-lead text-muted mt-6 max-w-xl">
                  {copy.lead} ({categories.length})
                </p>
              </Reveal>

              <Reveal delay={0.18} className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/how-it-works" variant="soft" size="lg">
                  {copy.how}
                </ButtonLink>
                <ButtonLink href="/contact" variant="ghost" size="lg">
                  {copy.ask}
                  <ArrowRight />
                </ButtonLink>
              </Reveal>
            </div>

            <Reveal delay={0.15} direction="left">
              <div className="border-line-soft bg-panel/70 overflow-hidden rounded-2xl border backdrop-blur-sm">
                <p className="border-line-soft text-faint border-b px-5 py-3 font-mono text-[0.625rem] tracking-[0.14em] uppercase">
                  {copy.four}
                </p>
                <dl className="divide-line-soft divide-y">
              {ruleSummary.map((rule, index) => (
                    <div
                      key={rule.label}
                      className="flex items-baseline justify-between gap-6 px-5 py-4"
                    >
                      <dt className="text-muted text-sm">{locale === "ar" ? [copy.daily, copy.overall, copy.days, copy.split][index] : locale === "fr" ? [copy.daily, copy.overall, copy.days, copy.split][index] : rule.label}</dt>
                      <dd className="text-ink font-display tabular text-lg font-semibold">
                        {rule.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <Section className="pt-4 sm:pt-6 lg:pt-8">
        <Container>
          <FaqExplorer faqs={faqs} />
        </Container>
      </Section>

      <Section className="bg-raised border-line-soft border-y">
        <Container>
          <div className="grid gap-8 lg:grid-cols-2">
            <Reveal className="border-line-soft bg-panel flex flex-col rounded-2xl border p-8">
              <span className="border-line-soft bg-raised text-brand-light grid size-11 place-items-center rounded-xl border">
                <MessageSquare className="size-[18px]" aria-hidden="true" />
              </span>
              <h2 className="text-h3 mt-5">{copy.stuck}</h2>
              <p className="text-muted mt-3 text-sm leading-relaxed">
                {copy.stuckBody}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href="/contact">
                  {copy.contact}
                  <ArrowRight />
                </ButtonLink>
                <ButtonLink href="/portal" variant="soft">
                  {copy.ticket}
                </ButtonLink>
              </div>
            </Reveal>

            <Reveal
              delay={0.08}
              className="border-line-soft bg-panel flex flex-col rounded-2xl border p-8"
            >
              <span className="border-line-soft bg-raised text-mint grid size-11 place-items-center rounded-xl border">
                <Headphones className="size-[18px]" aria-hidden="true" />
              </span>
              <h2 className="text-h3 mt-5">{copy.open}</h2>
              <p className="text-muted mt-3 text-sm leading-relaxed">
                {copy.openBody}
              </p>
              <dl className="border-line-soft mt-6 space-y-3 border-t pt-5 text-sm">
                <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-muted">{copy.general}</dt>
                  <dd className="text-ink font-mono text-[0.8125rem]">
                    {site.email}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-muted">{copy.funding}</dt>
                  <dd className="text-ink font-mono text-[0.8125rem]">
                    {site.salesEmail}
                  </dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal className="border-line-soft bg-panel relative overflow-hidden rounded-3xl border px-6 py-14 text-center sm:px-12 lg:py-20">
            <Aurora intensity="subtle" />
            <div className="relative mx-auto flex max-w-2xl flex-col items-center">
              <h2 className="text-h2">{copy.cta}</h2>
              <p className="text-lead text-muted mt-4">
                {copy.ctaBody}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <ButtonLink href={site.signupUrl} size="lg">
                  {copy.create}
                  <ArrowRight />
                </ButtonLink>
                <ButtonLink href="/accounts" variant="soft" size="lg">
                  {copy.compare}
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
