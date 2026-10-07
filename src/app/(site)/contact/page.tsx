import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Clock,
  Handshake,
  Headphones,
  Mail,
  MapPin,
  Phone,
  TrendingUp,
} from "lucide-react";

import { openRoles } from "@/components/about/careers";
import { ContactForm } from "@/components/contact/contact-form";
import { SocialLinks } from "@/components/layout/social-links";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { Aurora, GridBackdrop } from "@/components/ui/aurora";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { Eyebrow, SectionHeading } from "@/components/ui/section-heading";
import { site } from "@/lib/site";
import { getServerLocale } from "@/lib/i18n/server";
import { routeCopy } from "@/lib/i18n/route-copy";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach Connect Funded support, sales, partnerships or the hiring desk. Response times, the channel each enquiry should take, and where the firm is based.",
};

const channels = [
  {
    icon: Headphones,
    title: "Account support",
    email: site.email,
    response: "Within one business hour",
    body: "Evaluation rules, drawdown questions, platform issues, verification and payouts on an existing account. Portal tickets reach the same queue and carry your account context with them, so they are answered fastest.",
    action: { label: "Open a portal ticket", href: "/portal" },
  },
  {
    icon: TrendingUp,
    title: "Funding & pricing",
    email: site.salesEmail,
    response: "Same business day",
    body: "Which of the five tiers suits your average risk per trade, how scaling works before you commit, and multi-account structures inside the $400,000 combined allocation cap.",
    action: { label: "Compare account tiers", href: "/accounts" },
  },
  {
    icon: Handshake,
    title: "Partnerships & affiliates",
    email: site.salesEmail,
    response: "Within two business days",
    body: "Introducing brokers, educators, communities and technology partners. Send the audience or integration you have in mind and the commercial terms you are looking for.",
    action: { label: "Read how the model works", href: "/about#why" },
  },
] as const;

const contactFaqs = [
  {
    question: "Which channel actually gets the fastest answer?",
    answer:
      "A ticket raised inside the client portal. It arrives with your account number, tier, evaluation phase and current drawdown headroom already attached, which removes the first two messages of almost every support conversation. Email reaches the same queue without that context.",
  },
  {
    question: "Is there phone support?",
    answer:
      "The published number reaches the Dubai office during UAE business hours and is the right route for partnership and press enquiries. Account matters are handled in writing so that there is a record of the answer you were given, which protects you as much as us.",
  },
  {
    question: "What should I include for an account issue?",
    answer:
      "Your account number, the platform you were trading on, the instrument, and the time of the event in UTC. If it concerns an order, the ticket number from MetaTrader 5 or cTrader lets operations pull the exact execution record rather than reconstruct it.",
  },
  {
    question: "Do you reply at weekends?",
    answer:
      "Support runs 24 hours a day, five days a week, from the Sydney open on Monday to the New York close on Friday. Messages sent over the weekend are queued and answered from the Monday open. Nothing time-critical to a funded account can occur while the markets are closed.",
  },
  {
    question: "How do I apply for a role?",
    answer:
      "Use this form with the careers topic selected and it routes to the hiring desk rather than to support. Name the role in the first line, and include anything you have built or operated that is relevant. Every application is read by a person.",
  },
];

export default async function ContactPage() {
  const locale = await getServerLocale();
  const t = (key: Parameters<typeof routeCopy>[1]) => routeCopy(locale, key);
  const channelCopy = locale === "en" ? channels : locale === "fr" ? [
    { ...channels[0], title: "Assistance compte", response: "Sous une heure ouvrée", body: "Règles d’évaluation, questions sur le drawdown, problèmes de plateforme, vérification et retraits. Les tickets du portail arrivent dans la même file avec le contexte du compte, pour une réponse plus rapide.", action: { label: "Ouvrir un ticket dans le portail", href: "/portal" } },
    { ...channels[1], title: "Comptes et tarifs", response: "Le jour ouvré même", body: "Choix de la formule selon votre risque moyen, options de progression et gestion de plusieurs comptes dans la limite d’allocation combinée de 400 000 $.", action: { label: "Comparer les comptes", href: "/accounts" } },
    { ...channels[2], title: "Partenariats et affiliations", response: "Sous deux jours ouvrés", body: "Courtiers introducteurs, formateurs, communautés et partenaires technologiques : décrivez votre audience ou intégration ainsi que les conditions recherchées.", action: { label: "Découvrir notre modèle", href: "/about#why" } },
  ] : [
    { ...channels[0], title: "دعم الحسابات", response: "خلال ساعة عمل", body: "استفسارات قواعد التقييم والتراجع ومشكلات المنصة والتحقق والسحب. تصل تذاكر البوابة إلى الفريق نفسه مع تفاصيل حسابك، ما يساعد على الرد بسرعة.", action: { label: "افتح تذكرة عبر البوابة", href: "/portal" } },
    { ...channels[1], title: "الحسابات والأسعار", response: "في يوم العمل نفسه", body: "اختيار نوع الحساب المناسب لمخاطرتك المعتادة، وخيارات الترقية، وإدارة عدة حسابات ضمن حد التخصيص الإجمالي البالغ 400,000 دولار.", action: { label: "قارن أنواع الحسابات", href: "/accounts" } },
    { ...channels[2], title: "الشراكات والبرامج التابعة", response: "خلال يومي عمل", body: "للوسطاء المعرفين والمدربين والمجتمعات وشركاء التقنية: أرسل تفاصيل جمهورك أو التكامل المقترح والشروط التجارية التي تبحث عنها.", action: { label: "تعرّف إلى آلية العمل", href: "/about#why" } },
  ];
  const faqCopy = locale === "en" ? contactFaqs : locale === "fr" ? [
    { question: "Quel canal permet d’obtenir la réponse la plus rapide ?", answer: "Un ticket envoyé depuis le portail client. Il inclut votre numéro de compte, votre formule, votre phase d’évaluation et votre marge de drawdown. L’e-mail arrive dans la même file, sans ces informations." },
    { question: "Proposez-vous une assistance téléphonique ?", answer: "Le numéro publié permet de joindre le bureau de Dubaï pendant les heures ouvrées aux Émirats arabes unis ; il convient aux partenariats et aux demandes presse. Les questions de compte sont traitées par écrit afin de conserver une trace de la réponse." },
    { question: "Quelles informations fournir pour un problème de compte ?", answer: "Indiquez votre numéro de compte, la plateforme, l’instrument et l’heure de l’incident en UTC. Pour un ordre, le numéro de ticket MetaTrader 5 ou cTrader permet à l’équipe de retrouver l’exécution exacte." },
    { question: "Répondez-vous le week-end ?", answer: "L’assistance est disponible 24 h/24, cinq jours par semaine, de l’ouverture de Sydney le lundi à la clôture de New York le vendredi. Les messages du week-end sont traités à la réouverture le lundi." },
    { question: "Comment postuler ?", answer: "Sélectionnez le sujet Carrières dans ce formulaire pour transmettre votre candidature à l’équipe recrutement. Indiquez le poste dès la première ligne et vos réalisations pertinentes ; chaque candidature est lue par une personne." },
  ] : [
    { question: "ما أسرع قناة للحصول على رد؟", answer: "إرسال تذكرة عبر بوابة العميل. تصل ومعها رقم حسابك ونوعه ومرحلة التقييم والهامش المتبقي للتراجع، ما يوفر تبادل الرسائل الأولي. تصل رسائل البريد إلى الفريق نفسه من دون هذه المعلومات." },
    { question: "هل يتوفر الدعم عبر الهاتف؟", answer: "يصل الرقم المنشور إلى مكتب دبي خلال ساعات العمل في الإمارات، وهو مناسب لاستفسارات الشراكات والإعلام. تُعالج أمور الحسابات كتابيًا للاحتفاظ بسجل للإجابة." },
    { question: "ما المعلومات التي أرسلها بشأن مشكلة في الحساب؟", answer: "أرسل رقم الحساب والمنصة والأداة ووقت الواقعة بتوقيت UTC. وإذا تعلقت المشكلة بأمر تداول، أرفق رقم التذكرة من MetaTrader 5 أو cTrader ليسترجع الفريق سجل التنفيذ الدقيق." },
    { question: "هل تردون في عطلة نهاية الأسبوع؟", answer: "يتوفر الدعم خمسة أيام أسبوعيًا على مدار الساعة، من افتتاح سيدني يوم الاثنين إلى إغلاق نيويورك يوم الجمعة. تُعالج رسائل نهاية الأسبوع عند افتتاح الأسواق يوم الاثنين." },
    { question: "كيف أتقدم لوظيفة؟", answer: "اختر موضوع الوظائف في هذا النموذج ليصل طلبك إلى فريق التوظيف. اذكر الوظيفة في بداية الرسالة وخبراتك ذات الصلة. يراجع أحد أعضاء الفريق كل طلب." },
  ];
  return (
    <>
      <PageHero locale={locale} />

      <Section className="pt-4 sm:pt-6 lg:pt-8">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
            <Reveal className="border-line-soft bg-panel rounded-3xl border p-6 sm:p-8">
              <h2 className="text-h3">{t("contact.sendTitle")}</h2>
              <p className="text-muted mt-2 text-sm leading-relaxed">
                {t("contact.sendBody")}
              </p>
              <div className="mt-8">
                <ContactForm />
              </div>
            </Reveal>

            <div className="flex flex-col gap-5">
              {channelCopy.map((channel, index) => (
                <Reveal
                  key={channel.title}
                  delay={index * 0.06}
                  direction="left"
                  className="border-line-soft bg-panel rounded-2xl border p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="border-line-soft bg-raised text-brand-light grid size-11 place-items-center rounded-xl border">
                      <channel.icon className="size-[18px]" aria-hidden="true" />
                    </span>
                    <Badge tone="mint" className="gap-1.5">
                      <Clock className="size-3" aria-hidden="true" />
                      {channel.response}
                    </Badge>
                  </div>

                  <h3 className="text-ink font-display mt-4 text-lg font-semibold">
                    {channel.title}
                  </h3>
                  <p className="text-muted mt-2.5 text-sm leading-relaxed">
                    {channel.body}
                  </p>

                  <div className="border-line-soft mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                    <a
                      href={`mailto:${channel.email}`}
                      className="text-ink hover:text-brand-light inline-flex items-center gap-2 font-mono text-[0.8125rem] transition-colors"
                    >
                      <Mail className="size-3.5" aria-hidden="true" />
                      {channel.email}
                    </a>
                    <Link
                      href={channel.action.href}
                      className="text-brand-light inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold hover:underline"
                    >
                      {channel.action.label}
                      <ArrowUpRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-raised border-line-soft border-y">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
            <Reveal>
              <Eyebrow className="mb-4">{t("contact.where")}</Eyebrow>
              <h2 className="text-h2 max-w-lg">
                {t("contact.officeTitle")}
              </h2>
              <p className="text-muted mt-5 max-w-lg leading-relaxed">
                {t("contact.officeBody")}
              </p>

              <dl className="mt-8 space-y-5">
                <div className="flex gap-3.5">
                  <MapPin
                    className="text-brand-light mt-0.5 size-[18px] shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <dt className="text-faint font-mono text-[0.625rem] tracking-[0.14em] uppercase">
                      {t("contact.registered")}
                    </dt>
                    <dd className="text-ink mt-1 text-sm">{site.address}</dd>
                  </div>
                </div>

                <div className="flex gap-3.5">
                  <Phone
                    className="text-brand-light mt-0.5 size-[18px] shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <dt className="text-faint font-mono text-[0.625rem] tracking-[0.14em] uppercase">
                      {t("contact.officeLine")}
                    </dt>
                    <dd className="text-ink mt-1 text-sm">
                      <a
                        href={`tel:${site.phone.replace(/[^+\d]/g, "")}`}
                        className="hover:text-brand-light font-mono transition-colors"
                      >
                        {site.phone}
                      </a>
                    </dd>
                  </div>
                </div>

                <div className="flex gap-3.5">
                  <Clock
                    className="text-brand-light mt-0.5 size-[18px] shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <dt className="text-faint font-mono text-[0.625rem] tracking-[0.14em] uppercase">
                      {t("contact.hours")}
                    </dt>
                    <dd className="text-ink mt-1 text-sm leading-relaxed">
                      24 hours a day, five days a week — from the Sydney open on
                      Monday to the New York close on Friday. Weekend messages
                      are answered from the Monday open. The office line keeps
                      UAE business hours.
                    </dd>
                  </div>
                </div>
              </dl>

              <div className="border-line-soft mt-8 border-t pt-6">
                <p className="text-faint mb-3 font-mono text-[0.625rem] tracking-[0.14em] uppercase">
                  {t("contact.alsoHere")}
                </p>
                <SocialLinks />
              </div>
            </Reveal>

            <Reveal delay={0.1} direction="left">
              <div className="border-line-soft bg-panel relative overflow-hidden rounded-3xl border">
                <div
                  aria-hidden="true"
                  className="bg-grid relative h-56 w-full overflow-hidden sm:h-72"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgb(var(--cf-brand-glow)/0.35),transparent_65%)]" />
                  <div className="absolute inset-0 grid place-items-center">
                    <span className="relative grid place-items-center">
                      <span className="border-brand/40 animate-pulse-ring absolute size-24 rounded-full border" />
                      <span className="bg-brand grid size-11 place-items-center rounded-full text-white">
                        <MapPin className="size-5" />
                      </span>
                    </span>
                  </div>
                  <div className="from-panel absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t to-transparent" />
                </div>

                <div className="border-line-soft border-t p-6">
                  <p className="text-faint font-mono text-[0.625rem] tracking-[0.14em] uppercase">
                    {t("contact.languageTitle")}
                  </p>
                  <p className="text-ink mt-2 text-sm leading-relaxed">
                    {t("contact.languageBody").replace("{locales}", site.locales.join(" · "))}
                  </p>
                  <p className="text-muted border-line-soft mt-4 border-t pt-4 text-[0.8125rem] leading-relaxed">
                    {t("contact.legacyDisclaimer")}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section id="careers" className="scroll-mt-28">
        <Container>
          <SectionHeading
            eyebrow={t("contact.careers")}
            title={t("contact.careersTitle")}
            lead={t("contact.careersLead")}
            action={
              <Badge tone="mint" size="md">
                {openRoles.length} {t("contact.openRoles")}
              </Badge>
            }
          />

          <StaggerGroup className="mt-12 grid gap-5 lg:grid-cols-3">
            <StaggerItem className="border-line-soft bg-panel rounded-2xl border p-6">
              <span className="border-line-soft bg-raised text-brand-light grid size-11 place-items-center rounded-xl border">
                <Briefcase className="size-[18px]" aria-hidden="true" />
              </span>
              <h3 className="text-ink font-display mt-5 text-base font-semibold">
                {t("contact.readRole")}
              </h3>
              <p className="text-muted mt-2.5 text-sm leading-relaxed">
                {t("contact.readRoleBody")}
              </p>
              <Link
                href="/about#careers"
                className="text-brand-light mt-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold hover:underline"
              >
                {t("contact.seeRoles").replace("{count}", String(openRoles.length))}
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </Link>
            </StaggerItem>

            <StaggerItem className="border-line-soft bg-panel rounded-2xl border p-6">
              <span className="border-line-soft bg-raised text-brand-light grid size-11 place-items-center rounded-xl border">
                <Mail className="size-[18px]" aria-hidden="true" />
              </span>
              <h3 className="text-ink font-display mt-5 text-base font-semibold">
                {t("contact.writeHiring")}
              </h3>
              <p className="text-muted mt-2.5 text-sm leading-relaxed">
                {t("contact.writeHiringBody")}
              </p>
              <a
                href={`mailto:${site.email}?subject=${encodeURIComponent("Careers enquiry")}`}
                className="text-brand-light mt-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold hover:underline"
              >
                {t("contact.emailDesk")}
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </a>
            </StaggerItem>

            <StaggerItem className="border-line-soft bg-panel rounded-2xl border p-6">
              <span className="border-line-soft bg-raised text-brand-light grid size-11 place-items-center rounded-xl border">
                <Clock className="size-[18px]" aria-hidden="true" />
              </span>
              <h3 className="text-ink font-display mt-5 text-base font-semibold">
                {t("contact.expectAnswer")}
              </h3>
              <p className="text-muted mt-2.5 text-sm leading-relaxed">
                {t("contact.expectAnswerBody")}
              </p>
            </StaggerItem>
          </StaggerGroup>
        </Container>
      </Section>

      <Section className="bg-raised border-line-soft border-y">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <Reveal>
              <Eyebrow className="mb-4">{t("contact.beforeWrite")}</Eyebrow>
              <h2 className="text-h2">{t("contact.quickAnswers")}</h2>
              <p className="text-muted mt-5 leading-relaxed">
                {t("contact.quickAnswersBody")}
              </p>
              <ButtonLink href="/faq" variant="soft" className="mt-6">
                {t("contact.readFaq")}
                <ArrowRight />
              </ButtonLink>
            </Reveal>

            <Reveal delay={0.1} className="border-line-soft bg-panel rounded-2xl border px-6">
              <Accordion>
                {faqCopy.map((faq) => (
                  <AccordionItem key={faq.question} question={faq.question}>
                    {faq.answer}
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal className="border-line-soft bg-panel relative overflow-hidden rounded-3xl border px-6 py-14 text-center sm:px-12 lg:py-20">
            <Aurora intensity="subtle" />
            <div className="relative mx-auto flex max-w-2xl flex-col items-center">
              <h2 className="text-h2">
                {t("contact.skip")}
              </h2>
              <p className="text-lead text-muted mt-4">
                {t("contact.skipBody")}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <ButtonLink href={site.signupUrl} size="lg">
                  {t("contact.create")}
                  <ArrowRight />
                </ButtonLink>
                <ButtonLink href="/accounts" variant="soft" size="lg">
                  {t("contact.compare")}
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}

function PageHero({ locale }: { locale: "en" | "fr" | "ar" }) {
  const t = (key: Parameters<typeof routeCopy>[1]) => routeCopy(locale, key);
  return (
    <section className="bg-noise relative overflow-hidden pt-14 pb-16 sm:pt-20 lg:pt-24 lg:pb-20">
      <Aurora intensity="medium" />
      <GridBackdrop />
      <div
        aria-hidden="true"
        className="from-bg pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t to-transparent"
      />

      <Container className="relative">
        <Reveal direction="none">
          <Eyebrow>{t("contact.eyebrow")}</Eyebrow>
        </Reveal>

        <Reveal delay={0.06}>
          <h1 className="text-h1 mt-6 max-w-3xl">
            {t("contact.title")}
          </h1>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="text-lead text-muted mt-6 max-w-xl">
            {t("contact.lead")}
          </p>
        </Reveal>

        <Reveal delay={0.18}>
          <dl className="border-line-soft mt-10 grid max-w-2xl gap-x-8 gap-y-6 border-t pt-8 sm:grid-cols-3">
            {[
              { term: t("contact.coverage"), detail: locale === "ar" ? "على مدار الساعة، 5 أيام أسبوعيًا" : locale === "fr" ? "24 h/24, 5 jours/7" : "24 hours, 5 days a week" },
              { term: t("contact.reply"), detail: locale === "ar" ? "ساعة عمل واحدة" : locale === "fr" ? "Une heure ouvrée" : "One business hour" },
              { term: t("contact.languages"), detail: t("contact.languagesList") },
            ].map((item) => (
              <div key={item.term}>
                <dt className="text-faint font-mono text-[0.625rem] tracking-[0.14em] uppercase">
                  {item.term}
                </dt>
                <dd className="text-ink mt-1.5 text-[0.9375rem] font-medium">
                  {item.detail}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </section>
  );
}
