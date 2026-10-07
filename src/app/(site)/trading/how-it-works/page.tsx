import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  Landmark,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import Image from "next/image";

import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Aurora, GridBackdrop } from "@/components/ui/aurora";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  brokerHowItWorksStages,
} from "@/lib/landing/broker";
import { guardProduct } from "@/lib/product-guard";
import { signupUrl } from "@/lib/site";
import { createMediaResolver } from "@/lib/cms/media";
import { getServerLocale } from "@/lib/i18n/server";
import { routeCopy } from "@/lib/i18n/route-copy";

export const metadata: Metadata = {
  title: "How Live Trading Works",
  description:
    "Register, complete KYC once, fund your balance and trade live markets on MetaTrader 5, cTrader or the Web Terminal.",
};

const stageIcons = [BadgeCheck, ShieldCheck, Wallet, Landmark] as const;

const stageDetail: Record<
  string,
  { rules: string[]; next: string }
> = {
  "01": {
    rules: [
      "Choose Standard, Pro or VIP at signup — you can upgrade later from the portal.",
      "Pick MetaTrader 5, cTrader or the Web Terminal; credentials land in the portal immediately.",
      "Demo and live share the same login so you can rehearse before funding.",
    ],
    next: "Your profile opens the KYC queue. You can browse markets and the portal while verification runs.",
  },
  "02": {
    rules: [
      "Upload a government photo ID and a proof of address dated within three months.",
      "Automated screening runs first; a human desk reviews exceptions the same business day in most cases.",
      "Verification is required before the first withdrawal, not before your first deposit.",
    ],
    next: "Once cleared, withdrawal rails unlock. Deposits are available as soon as registration completes.",
  },
  "03": {
    rules: [
      "Cards and crypto credit instantly; bank transfers typically settle in one to two business days.",
      "There is no deposit fee on the published rails. Minimums start at $100 on Standard.",
      "Your full cleared balance is tradable from the moment it lands — nothing is held back.",
    ],
    next: "Open the platform from the portal and place your first live order on any quoted instrument.",
  },
  "04": {
    rules: [
      "Trade forex, metals, energy, indices and crypto under the account type you selected.",
      "Leverage is published on Standard and Pro — up to 1:500. Ask the desk for VIP terms.",
      "Request a withdrawal on the same rail you deposited with; reviews complete within 24 hours on open market days.",
    ],
    next: "Scale your volume and upgrade account type when tighter spreads or raw pricing become the better fit.",
  },
};

export default async function TradingHowItWorksPage() {
  await guardProduct("broker");
  const [image, locale] = await Promise.all([createMediaResolver(), getServerLocale()]);
  const t = (key: Parameters<typeof routeCopy>[1]) => routeCopy(locale, key);
  const stageCopy = locale === "en" ? null : locale === "fr" ? [
    { kicker: "Inscription", title: "Créez votre profil", body: "Inscrivez-vous par e-mail, choisissez Standard, Pro ou VIP, puis sélectionnez MetaTrader 5 ou Web Terminal.", points: ["Compte réel et démo avec les mêmes identifiants", "Aucun frais d’évaluation", "Accès au portail en moins de deux minutes"] },
    { kicker: "Vérification", title: "Effectuez la vérification KYC une fois", body: "Déposez une pièce d’identité officielle et un justificatif de domicile dans le portail. La plupart des profils sont validés le jour même.", points: ["Pièce d’identité et justificatif de domicile", "Contrôle automatisé puis examen humain", "Vérification requise avant le premier retrait"] },
    { kicker: "Dépôt", title: "Approvisionnez votre compte de trading", body: "Déposez par carte, Whish Money, OMT, BOB ou crypto. Les paiements admissibles par carte, portefeuille et crypto sont crédités instantanément.", points: ["Dès 100 $ avec Standard", "Carte, Whish Money, OMT, BOB et crypto", "Solde visible dès le traitement du paiement"] },
    { kicker: "Trading", title: "Négociez sur les marchés en direct", body: "Forex, métaux, énergie, indices et crypto avec un seul identifiant. Retirez vos fonds par le même moyen que pour le dépôt.", points: ["Avantages selon le type de compte", "Effet de levier jusqu’à 1:100", "Retraits examinés sous 24 heures"] },
  ] : [
    { kicker: "التسجيل", title: "أنشئ ملفك الشخصي", body: "سجل ببريدك الإلكتروني، واختر Standard أو Pro أو VIP، ثم حدد MetaTrader 5 أو Web Terminal.", points: ["الحساب التجريبي والمباشر بتسجيل الدخول نفسه", "لا رسوم تقييم", "الوصول إلى البوابة في أقل من دقيقتين"] },
    { kicker: "التحقق", title: "أكمل التحقق من الهوية مرة واحدة", body: "ارفع وثيقة هوية حكومية وإثبات عنوان عبر البوابة. تُعتمد معظم الملفات في يوم العمل نفسه.", points: ["وثيقة هوية وإثبات عنوان", "فحص آلي ثم مراجعة من الفريق", "التحقق مطلوب قبل أول عملية سحب"] },
    { kicker: "الإيداع", title: "أودع رصيد التداول", body: "أودع باستخدام البطاقة أو Whish Money أو OMT أو BOB أو العملات الرقمية. تُضاف المدفوعات المؤهلة بالبطاقة والمحفظة والعملات الرقمية فورًا.", points: ["ابتداءً من 100 دولار مع Standard", "بطاقة وWhish Money وOMT وBOB وعملات رقمية", "يظهر الرصيد فور إتمام المعالجة"] },
    { kicker: "التداول", title: "تداول الأسواق المباشرة", body: "تداول الفوركس والمعادن والطاقة والمؤشرات والعملات الرقمية بتسجيل دخول واحد. اطلب السحب باستخدام وسيلة الإيداع نفسها.", points: ["تختلف المزايا حسب نوع الحساب", "رافعة مالية تصل إلى 1:100", "مراجعة السحب خلال 24 ساعة"] },
  ];
  const rulesByLocale = locale === "fr" ? [
    ["Choisissez Standard, Pro ou VIP à l’inscription ; vous pourrez changer de formule depuis le portail.", "Sélectionnez MetaTrader 5, cTrader ou Web Terminal ; vos identifiants apparaissent immédiatement dans le portail.", "Le compte démo et le compte réel partagent les mêmes identifiants pour vous entraîner avant le dépôt."],
    ["Téléversez une pièce d’identité officielle avec photo et un justificatif de domicile de moins de trois mois.", "Un contrôle automatisé est suivi d’un examen humain ; les cas particuliers sont généralement traités le jour ouvré même.", "La vérification est nécessaire avant le premier retrait, mais pas avant le premier dépôt."],
    ["Les cartes et cryptomonnaies sont créditées instantanément ; un virement bancaire prend généralement un à deux jours ouvrés.", "Aucun frais de dépôt sur les moyens publiés. Le minimum Standard est de 100 $.", "La totalité du solde crédité peut être utilisée dès sa réception."],
    ["Négociez le forex, les métaux, l’énergie, les indices et les cryptomonnaies selon le compte choisi.", "Le levier publié atteint 1:500 pour Standard et Pro. Contactez l’équipe pour les conditions VIP.", "Demandez un retrait par le même moyen que votre dépôt ; l’examen prend jusqu’à 24 heures les jours de marché."],
  ] : [
    ["اختر Standard أو Pro أو VIP عند التسجيل، ويمكنك الترقية لاحقًا من البوابة.", "اختر MetaTrader 5 أو cTrader أو Web Terminal؛ ستظهر بيانات الدخول في البوابة فورًا.", "يستخدم الحساب التجريبي والمباشر بيانات الدخول نفسها للتدرب قبل الإيداع."],
    ["ارفع بطاقة هوية حكومية تحمل صورة وإثبات عنوان صادرًا خلال الأشهر الثلاثة الماضية.", "يبدأ التحقق آليًا، ثم يراجع الفريق الحالات الاستثنائية؛ وتُنجز معظمها في يوم العمل نفسه.", "يلزم التحقق قبل أول سحب، لا قبل أول إيداع."],
    ["تُضاف إيداعات البطاقات والعملات الرقمية فورًا؛ وقد يستغرق التحويل المصرفي يومًا إلى يومي عمل.", "لا رسوم على وسائل الإيداع المنشورة. يبدأ الحد الأدنى لحساب Standard من 100 دولار.", "يمكنك تداول كامل الرصيد بعد وصوله من دون حجز أي جزء منه."],
    ["تداول الفوركس والمعادن والطاقة والمؤشرات والعملات الرقمية وفق نوع الحساب الذي اخترته.", "الرافعة المنشورة لحسابي Standard وPro تصل إلى 1:500. تواصل مع الفريق لمعرفة شروط VIP.", "اطلب السحب عبر وسيلة الإيداع نفسها؛ وتُراجع الطلبات خلال 24 ساعة في أيام فتح الأسواق."],
  ];

  return (
    <>
      <section className="bg-noise relative overflow-hidden pt-14 pb-16 sm:pt-20 lg:pt-24 lg:pb-20">
        <Aurora intensity="strong" />
        <GridBackdrop />
        <div
          aria-hidden
          className="from-bg pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t to-transparent"
        />
        <Container className="relative max-w-3xl">
          <Reveal direction="none">
            <span className="eyebrow">
              <span className="chev" />
              {t("how.eyebrow")}
            </span>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="text-h1 mt-6">
              {t("how.title")}
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="text-lead text-muted mt-6">
              {t("how.lead")}
            </p>
          </Reveal>
          <Reveal delay={0.18} className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={signupUrl} size="lg">
              {t("how.open")}
              <ArrowRight />
            </ButtonLink>
            <ButtonLink href="/trading/accounts" variant="soft" size="lg">
              {t("how.compare")}
            </ButtonLink>
          </Reveal>
        </Container>
      </section>

      <Section id="stages" className="pt-4 sm:pt-6">
        <Container>
          <SectionHeading
            eyebrow={t("how.path")}
            title={t("how.portalTitle")}
            lead={t("how.portalLead")}
          />

          <div className="mt-14 space-y-8 lg:space-y-10">
            {brokerHowItWorksStages.map((sourceStage, index) => {
              const stage = stageCopy ? { ...sourceStage, ...stageCopy[index] } : sourceStage;
              const Icon = stageIcons[index] ?? BadgeCheck;
              const englishDetail = stageDetail[stage.index];
              const detail = locale === "en" ? englishDetail : { rules: rulesByLocale[index], next: locale === "fr" ? ["Votre profil rejoint la file de vérification. Vous pouvez consulter les marchés et le portail pendant le traitement.", "Après validation, les moyens de retrait sont activés. Les dépôts sont possibles dès la fin de l’inscription.", "Ouvrez la plateforme depuis le portail et passez votre premier ordre réel sur un instrument coté.", "Augmentez votre volume et changez de formule lorsque des spreads plus serrés ou une tarification brute vous conviennent mieux."][index] : ["يُضاف ملفك إلى قائمة التحقق. ويمكنك تصفح الأسواق والبوابة أثناء مراجعة هويتك.", "بعد اعتماد هويتك، تتاح وسائل السحب. ويمكنك الإيداع فور إكمال التسجيل.", "افتح المنصة من البوابة ونفذ أول أمر مباشر على أي أداة متاحة.", "زد حجم تداولك ورقِّ نوع الحساب عندما تصبح السبريدات الأضيق أو الأسعار الخام أنسب لك."][index] };
              const frame = image(`trading.how-it-works.stage-${index + 1}`);

              return (
                <Reveal key={stage.index}>
                  <article className="border-line-soft bg-panel grid overflow-hidden rounded-3xl border lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                    <div className="relative min-h-[14rem] lg:min-h-full">
                      {frame && (
                        <Image
                          src={frame.src}
                          alt={frame.alt}
                          fill
                          sizes="(min-width: 1024px) 40vw, 100vw"
                          className="object-cover"
                          {...(frame.blurDataURL
                            ? {
                                placeholder: "blur" as const,
                                blurDataURL: frame.blurDataURL,
                              }
                            : {})}
                        />
                      )}
                      <div
                        aria-hidden
                        className="absolute inset-0 bg-[linear-gradient(to_top,rgb(var(--cf-hero-rgb)/0.75),transparent_55%)] lg:bg-[linear-gradient(to_right,transparent_40%,rgb(var(--cf-bg-rgb)/0.35))]"
                      />
                      <div className="absolute inset-x-0 bottom-0 p-6 lg:inset-auto lg:top-6 lg:start-6">
                        <span className="font-mono text-[0.6875rem] tracking-[0.16em] text-white/70 uppercase">
                          {t("how.stage")} {stage.index}
                        </span>
                        <p className="font-display mt-1 text-xl font-semibold text-white">
                          {stage.kicker}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8 lg:p-10">
                      <div className="flex items-start gap-3">
                        <span className="bg-brand/12 text-brand-light ring-brand/25 grid size-10 shrink-0 place-items-center rounded-xl ring-1">
                          <Icon className="size-4" aria-hidden />
                        </span>
                        <div>
                          <h2 className="text-ink font-display text-xl font-semibold">
                            {stage.title}
                          </h2>
                          <p className="text-muted mt-2 text-sm leading-relaxed">
                            {stage.body}
                          </p>
                        </div>
                      </div>

                      <ul className="mt-6 space-y-2.5">
                        {(detail?.rules ?? stage.points).map((rule) => (
                          <li
                            key={rule}
                            className="text-muted flex gap-2.5 text-sm leading-relaxed"
                          >
                            <span
                              aria-hidden
                              className="bg-mint mt-2 size-1.5 shrink-0 rounded-full"
                            />
                            {rule}
                          </li>
                        ))}
                      </ul>

                      {detail?.next && (
                        <p className="border-line-soft text-faint mt-7 border-t pt-5 text-xs leading-relaxed">
                          {t("how.next")} {detail.next}
                        </p>
                      )}
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section
        id="platforms"
        className="border-line-soft bg-raised/40 border-y"
      >
        <Container>
          <SectionHeading
            eyebrow={t("how.afterLive")}
            title={t("how.stackTitle")}
            lead={t("how.stackLead")}
            action={
              <ButtonLink href="/platforms" variant="outline">
              {t("how.seePlatforms")}
                <ArrowRight />
              </ButtonLink>
            }
          />
          <StaggerGroup className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              {
                title: t("how.platforms"),
                body: t("how.platformsBody"),
              },
              {
                title: t("how.markets"),
                body: t("how.marketsBody"),
              },
              {
                title: t("how.desk"),
                body: t("how.deskBody"),
              },
            ].map((item) => (
              <StaggerItem
                key={item.title}
                className="border-line-soft bg-panel rounded-2xl border p-6"
              >
                <h3 className="text-ink font-display text-base font-semibold">
                  {item.title}
                </h3>
                <p className="text-muted mt-2.5 text-sm leading-relaxed">
                  {item.body}
                </p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </Section>

      <Section className="relative overflow-hidden">
        <Aurora intensity="subtle" />
        <Container className="relative">
          <div className="border-line-soft bg-panel mx-auto max-w-3xl rounded-3xl border px-6 py-10 text-center sm:px-10 sm:py-12">
            <h2 className="text-h2">{t("how.ready")}</h2>
            <p className="text-lead text-muted mx-auto mt-4 max-w-xl">
              {t("how.fundLead")}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink href={signupUrl} size="lg">
                {t("how.open")}
                <ArrowRight />
              </ButtonLink>
              <ButtonLink href="/contact" variant="soft" size="lg">
                {t("how.talk")}
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
