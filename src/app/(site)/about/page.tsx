import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, Eye, Target } from "lucide-react";

import { DeskTeams } from "@/components/about/desk-teams";
import { SocialWallSection } from "@/components/sections/social-wall";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Aurora, GridBackdrop } from "@/components/ui/aurora";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { Eyebrow, SectionHeading } from "@/components/ui/section-heading";
import { getCompanyStats } from "@/lib/content";
import { getServerLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionaries";
import { pageCopy } from "@/lib/i18n/page-copy";
import { FeaturePageImage } from "@/components/sections/feature-page-image";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Meet the people and operating principles behind Connect Funded, a multi-asset trading company based in Beirut.",
};

export default async function AboutPage() {
  const locale = await getServerLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);

  return (
    <>
      <PageHero locale={locale} />

      <Section className="border-line-soft relative isolate overflow-hidden border-y bg-raised">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_8%_10%,rgb(var(--cf-brand-glow)/0.10),transparent_34%),radial-gradient(ellipse_at_92%_88%,rgb(var(--cf-accent-glow)/0.09),transparent_36%)]" />
        <Container className="relative">
          <Reveal className="mb-8 max-w-2xl">
            <Eyebrow>{locale === "ar" ? "غايتنا واتجاهنا" : locale === "fr" ? "Notre mission et notre vision" : "Our purpose and direction"}</Eyebrow>
            <h2 className="text-h2 mt-3">{locale === "ar" ? "نبني بيئة تداول جديرة بالثقة." : locale === "fr" ? "Un environnement de trading digne de confiance." : "A trading environment built to earn trust."}</h2>
          </Reveal>
          <div className="grid items-stretch gap-5 lg:grid-cols-2 lg:gap-6">
            {[
              { title: pageCopy(locale, "page.mission"), body: pageCopy(locale, "about.mission"), Icon: Target, number: "01", accent: "from-sky-400 via-blue-500 to-blue-700", iconTone: "text-blue-700 dark:text-sky-200", glow: "bg-blue-400/10" },
              { title: pageCopy(locale, "page.vision"), body: pageCopy(locale, "about.vision"), Icon: Eye, number: "02", accent: "from-amber-300 via-amber-500 to-yellow-700", iconTone: "text-amber-700 dark:text-amber-200", glow: "bg-amber-400/10" },
            ].map(({ title, body, Icon, number, accent, iconTone, glow }) => (
              <article key={title} className="border-line-soft bg-panel group relative flex h-full min-h-64 flex-col overflow-hidden rounded-[1.75rem] border p-6 shadow-[0_18px_52px_-42px_rgb(var(--cf-shadow-color)/0.5)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-40px_rgb(var(--cf-shadow-color)/0.55)] sm:p-8 lg:p-9">
                <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
                <span aria-hidden="true" className={`pointer-events-none absolute -end-14 -top-16 size-48 rounded-full blur-3xl ${glow}`} />
                <div className="relative flex items-center justify-between gap-4">
                  <span className={`grid size-12 place-items-center rounded-2xl border border-line-soft bg-raised ${iconTone}`}><Icon className="size-5" strokeWidth={1.8} aria-hidden="true" /></span>
                  <span className="text-faint font-mono text-[0.625rem] tracking-[0.18em]">{number} / 02</span>
                </div>
                <div className="relative mt-7">
                  <Eyebrow>{title}</Eyebrow>
                  <p className="text-ink font-display mt-3 text-lg leading-8 font-medium sm:text-xl sm:leading-9">{body}</p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
            <div>
              <Reveal>
                <Eyebrow className="mb-4">{locale === "ar" ? "الفكرة التأسيسية" : locale === "fr" ? "Notre thèse fondatrice" : "The founding thesis"}</Eyebrow>
                <h2 className="text-h2 max-w-xl">
                  {locale === "ar" ? "المشكلة في الوسيط، لا في المتداول." : locale === "fr" ? "Le courtier est la variable, pas le trader." : "The operator is the variable, not the trader."}
                </h2>
              </Reveal>

              <Reveal delay={0.08} className="text-muted mt-6 space-y-5">
                <p className="text-lead">
                  {locale === "ar" ? "تأسست الشركة على يد محترفين أمضوا مسيرتهم في مكاتب تداول مؤسسية، وكانوا يلتقون مرارًا بالمتداول نفسه: متمكن فنيًا ومنضبطًا، لكنه يخسر بصمت جزءًا كبيرًا من ميزته بسبب وسيطه." : locale === "fr" ? "L’entreprise a été fondée par des professionnels ayant travaillé sur des desks institutionnels. Ils rencontraient toujours le même profil : un trader compétent et discipliné qui perdait discrètement une partie de son avantage à cause de son propre courtier." : "We were assembled by people who had spent their careers on institutional desks, and who kept meeting the same trader: technically sound, properly disciplined, and quietly losing a third of their edge to their own broker."}
                </p>
                <p>
                  {locale === "ar" ? "لم يكن السبب أمرًا استثنائيًا، بل سبريد يتسع بقرار إداري عند صدور الأخبار، أو تنفيذ أسوأ بأربع تكات من السعر المعروض، أو رسوم تمويل لا يجدها أحد مكتوبة. قد يبدو كل منها بسيطًا منفردًا، لكنه يصبح مؤثرًا عند تراكمه خلال عام من التداول." : locale === "fr" ? "Pas à cause d’un incident spectaculaire, mais d’un spread élargi à la publication d’une annonce, d’une exécution quatre ticks moins favorable que le cours affiché ou de frais de financement introuvables par écrit. Pris séparément, ces écarts semblent minimes ; cumulés sur une année, ils font la différence." : "Not to anything dramatic. To a spread that widened by policy the moment news printed, to a fill that arrived four ticks worse than the screen, to a financing charge nobody could find in writing. Individually trivial. Compounded across a year of trading, decisive."}
                </p>
                <p>
                  {locale === "ar" ? "لذلك بنينا العمل حول سؤال واحد: كيف يبدو الوسيط إذا افترضنا كفاءة المتداول وأن الخلل قد يكون في الجهة المشغّلة؟ كانت الإجابة عملية وواضحة: نشر كل رقم قبل الإيداع، وقياس التنفيذ وإظهار نتائجه، وعدم توسيع السبريد بقرار إداري، وعدم إخفاء الرسوم في الشروط." : locale === "fr" ? "Nous avons donc bâti l’entreprise autour d’une question : à quoi ressemble un courtier si l’on considère le trader comme compétent et le courtier comme la variable ? La réponse est pragmatique : publier chaque chiffre avant le dépôt, mesurer et présenter la qualité d’exécution, ne jamais élargir un spread par décision interne et ne pas dissimuler de frais dans les conditions." : "So the business was built around one question: what does a broker look like if you assume the trader is competent and the operator is the variable? The answer turned out to be unglamorous. Publish every number before the deposit. Measure execution at the engine and show the measurement. Never widen a spread by policy. Refuse to bury a charge in a terms document that quietly makes the advertised pricing untrue."}
                </p>
                <p>
                  {locale === "ar" ? "نحتفظ بأموال العملاء في حسابات منفصلة، ونسعّر جميع فئات الأصول على رصيد واحد، وتأتي إيراداتنا من السبريد وعمولة محددة. ولا نفرض رسوم تبييت." : locale === "fr" ? "Les fonds des clients sont conservés sur des comptes séparés. Toutes les classes d’actifs sont accessibles depuis un seul solde. Notre rémunération provient du spread et d’une commission plafonnée ; aucun swap n’est facturé." : "We hold client money in segregated accounts, quote all asset classes against a single balance, and earn on the spread and a capped commission. We do not charge swap fees."}
                </p>
              </Reveal>
            </div>

            <Reveal delay={0.12} direction="left" className="lg:pt-16">
              <figure className="border-line-soft bg-panel relative overflow-hidden rounded-3xl border p-8">
                <Aurora intensity="subtle" />
                <blockquote className="relative">
                  <p className="text-ink font-display text-xl leading-snug font-medium sm:text-2xl">
                    &ldquo;{t("home.about.quote")}&rdquo;
                  </p>
                </blockquote>
                <figcaption className="border-line-soft text-muted relative mt-6 border-t pt-5 text-sm">
                  {t("home.about.caption")}
                </figcaption>
              </figure>

              <div className="border-line-soft bg-raised mt-5 rounded-2xl border p-6">
                <p className="text-faint font-mono text-[0.625rem] tracking-[0.14em] uppercase">
                  {locale === "ar" ? "المقر المسجل" : locale === "fr" ? "Siège social" : "Registered base"}
                </p>
                <p className="text-ink mt-2 flex items-start gap-2.5 text-sm leading-relaxed">
                  <Building2
                    className="text-brand-light mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  {site.address}
                </p>
                <p className="text-muted mt-3 text-[0.8125rem] leading-relaxed">
                  {locale === "ar" ? "تُدار العمليات الموجهة للعملاء من دبي عبر الجلسات الآسيوية والأوروبية والأمريكية، إلى جانب فرق عن بُعد في أوروبا والشرق الأوسط وأفريقيا." : locale === "fr" ? "Les opérations destinées aux traders sont pilotées depuis Dubaï pendant les séances asiatiques, européennes et américaines, avec des équipes à distance en Europe, au Moyen-Orient et en Afrique." : "Trader-facing operations run from Dubai across the Asian, European and US sessions, with remote desks throughout Europe, the Middle East and Africa."}
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <section className="bg-raised border-line-soft border-y">
        <Container>
          <StaggerGroup className="grid gap-y-10 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:py-16">
            {getCompanyStats(locale).map((stat) => (
              <StaggerItem key={stat.label} className="rounded-2xl p-4 text-center transition-transform duration-300 hover:-translate-y-1">
                <p className="text-ink font-display tabular text-4xl font-semibold sm:text-5xl">
                  {stat.value}
                </p>
                <p className="text-faint mt-2 font-mono text-[0.6875rem] tracking-[0.12em] uppercase">
                  {stat.label}
                </p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </section>

      <Section id="desks" className="bg-raised border-line-soft border-y">
        <Container>
          <SectionHeading
            eyebrow={locale === "ar" ? "فرق العمل" : locale === "fr" ? "Nos équipes" : "The desks"}
            title={locale === "ar" ? "المسؤوليات واضحة." : locale === "fr" ? "Des responsabilités clairement définies." : "Who is actually accountable for what."}
            lead={locale === "ar" ? "لا نستخدم صورًا أو سيرًا ذاتية مختلقة. عند حدوث مشكلة، المهم هو معرفة الفريق المسؤول عن القرار؛ لذلك ننشر هذه المسؤوليات." : locale === "fr" ? "Nous n’utilisons ni photos ni biographies inventées. En cas de problème, il est essentiel de savoir quelle équipe prend la décision : c’est ce que nous publions." : "There are no photographs on this page and no invented biographies. What matters when something goes wrong is which desk owns the decision, so that is what we publish."}
          />
          <div className="mt-12">
            <DeskTeams locale={locale} />
          </div>
        </Container>
      </Section>

      <SocialWallSection />

      <Section id="disclaimer" className="bg-sunken">
        <Container>
          <article className="border-line-soft bg-panel rounded-3xl border p-6 sm:p-9">
            <Eyebrow>{pageCopy(locale, "page.disclaimer")}</Eyebrow>
            <h2 className="text-h2 mt-3">{pageCopy(locale, "about.disclaimerTitle")}</h2>
            <div className="text-muted mt-5 max-w-4xl space-y-4 text-sm leading-relaxed sm:text-base">
              <p>{pageCopy(locale, "about.disclaimer1")}</p>
              <p>{pageCopy(locale, "about.disclaimer2")}</p>
              <p>{pageCopy(locale, "about.disclaimer3")}</p>
            </div>
          </article>
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal className="border-line-soft bg-panel relative overflow-hidden rounded-3xl border px-6 py-14 text-center sm:px-12 lg:py-20">
            <Aurora intensity="subtle" />
            <div className="relative mx-auto flex max-w-2xl flex-col items-center">
              <h2 className="text-h2">
                {locale === "ar" ? "الأرقام منشورة. والتنفيذ قابل للقياس." : locale === "fr" ? "Les chiffres sont publiés. L’exécution est mesurée." : "The numbers are published. The execution is measured."}
              </h2>
              <p className="text-lead text-muted mt-4">
                {locale === "ar" ? "افتح حسابًا ابتداءً من 100 دولار، وتداول جميع فئات الأصول برصيد واحد واحتفظ بكل ما تحققه." : locale === "fr" ? "Ouvrez un compte dès 100 $, négociez toutes les classes d’actifs avec un seul solde et conservez vos gains." : "Open an account from $100, trade all asset classes on one balance, and keep every dollar you make."}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <ButtonLink href={site.signupUrl} size="lg">
                  {locale === "ar" ? "إنشاء حساب" : locale === "fr" ? "Créer un compte" : "Create account"}
                  <ArrowRight />
                </ButtonLink>
                <ButtonLink href="/contact" variant="soft" size="lg">
                  {locale === "ar" ? "تواصل مع الفريق أولًا" : locale === "fr" ? "Parler d’abord à l’équipe" : "Talk to the desk first"}
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}

function PageHero({ locale }: { locale: "en" | "ar" | "fr" }) {
  const hubTopics = locale === "ar"
    ? ["الاستراتيجيات", "التحليل الفني", "رؤى السوق"]
    : locale === "fr"
      ? ["Stratégies", "Analyse technique", "Analyses de marché"]
      : ["Strategies", "Technical analysis", "Market insights"];
  const copy = locale === "ar"
    ? { eyebrow: "من نحن", title: "وسيط للمتداولين الذين يراجعون المواصفات.", lead: "نوفر للمتداولين المنضبطين إمكانية الوصول إلى الفوركس والمعادن الثمينة والطاقة والمؤشرات والأسهم والعملات الرقمية في حساب واحد، بشروط منشورة وواضحة.", meet: "تعرّف على فرقنا", contact: "تواصل مع الفريق" }
    : locale === "fr"
      ? { eyebrow: "À propos de Connect Funded", title: "Un courtier pour les traders qui lisent les spécifications.", lead: "Nous donnons aux traders disciplinés accès au forex, aux métaux précieux, à l’énergie, aux indices, aux CFD sur actions et aux cryptomonnaies dans un seul compte, selon des conditions publiées et mesurées.", meet: "Rencontrer nos équipes", contact: "Contacter l’équipe" }
      : { eyebrow: `About ${site.name}`, title: "A broker for traders who read the spec sheet.", lead: "We give disciplined traders access to forex, precious metals, energies, indices, share CFDs and crypto on one account — under conditions published in full and measured in software.", meet: "Meet our desks", contact: "Contact the desk" };
  return (
    <section className="relative isolate flex min-h-[650px] items-center overflow-hidden py-24 sm:min-h-[720px] sm:py-28">
      <FeaturePageImage
        src="/images/about.jpg"
        motionVariant="about"
        alt={locale === "ar" ? "فريق يناقش أعمال التداول في مكتب مشرق" : locale === "fr" ? "Une équipe échange sur le trading dans un bureau lumineux" : "A team discussing trading operations in a bright office"}
        objectPosition="center"
      />
      <GridBackdrop />

      <Container className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.72fr)] lg:gap-16">
        <div className="max-w-4xl">
          <Reveal direction="none">
            <Eyebrow>{copy.eyebrow}</Eyebrow>
          </Reveal>

          <Reveal delay={0.06}>
            <h1 className="text-h1 mt-6 max-w-4xl text-white">
              {copy.title}
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="text-lead mt-6 max-w-2xl text-white/80">
              {copy.lead}
            </p>
          </Reveal>

          <Reveal delay={0.18} className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="#desks" size="lg">
              {copy.meet}
              <ArrowRight />
            </ButtonLink>
            <ButtonLink href="/contact" variant="ghost" size="lg">
              {copy.contact}
            </ButtonLink>
          </Reveal>
        </div>

        <Reveal delay={0.16} direction="left">
          <aside className="border-white/20 bg-[#0b2345]/75 group relative overflow-hidden rounded-3xl border p-5 shadow-2xl backdrop-blur-xl transition-transform duration-500 hover:-translate-y-1 sm:p-6 xl:p-7">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_0%,rgb(108_167_216_/_0.24),transparent_46%)]" />
            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-[0.625rem] tracking-[0.16em] text-white/60 uppercase">Connect Funded · Research</p>
                <span className="flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2.5 py-1 text-[0.65rem] text-emerald-100"><span className="size-1.5 rounded-full bg-emerald-300" />{locale === "ar" ? "متاح" : locale === "fr" ? "Disponible" : "Available"}</span>
              </div>
              <h2 className="mt-7 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl"><span className="whitespace-nowrap">{locale === "ar" ? "مركز التداول" : locale === "fr" ? "Centre de trading" : "Trading Hub"}</span></h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">{locale === "ar" ? "مساحة متصلة للاستراتيجيات وتحليل السوق والتخطيط للمخاطر ومراجعة الأداء." : locale === "fr" ? "Un espace connecté pour les stratégies, l’analyse de marché, la gestion du risque et le suivi des performances." : "A connected workspace for strategies, market analysis, risk planning and performance review."}</p>
              <div aria-hidden="true" className="mt-8 flex h-24 items-end gap-2 border-b border-white/15 pb-2">
                {[30, 43, 37, 56, 48, 68, 62, 82, 74, 94, 88, 100].map((height, index) => <span key={index} className="about-chart-bar flex-1 rounded-t-sm bg-gradient-to-t from-blue-400/25 to-sky-200/90" style={{ height: `${height}%`, opacity: 0.52 + index * 0.035, animationDelay: `${index * 45}ms` }} />)}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {hubTopics.map((item) => <span key={item} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[0.65rem] text-white/75">{item}</span>)}
              </div>
              <Link href="/trading-edge" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-sky-200 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-200">
                {locale === "ar" ? "استكشف مركز التداول" : locale === "fr" ? "Découvrir le centre de trading" : "Explore Trading Hub"}<ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </Reveal>

      </Container>
    </section>
  );
}
