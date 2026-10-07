import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bitcoin,
  Coins,
  Gauge,
  Landmark,
  LineChart,
  Layers,
  Server,
  ShieldCheck,
  Timer,
  TrendingUp,
} from "lucide-react";

import { InstrumentTable } from "@/components/products/instrument-table";
import { SpecNav, type SpecNavItem } from "@/components/products/spec-nav";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Aurora, GridBackdrop } from "@/components/ui/aurora";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getInstruments } from "@/db/queries";
import {
  ASSET_CLASSES,
  type AssetClass,
} from "@/lib/market";
import { signupUrl } from "@/lib/site";
import { getServerLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionaries";
import { localizedAssetClass } from "@/lib/asset-class-locales";
import { routeCopy } from "@/lib/i18n/route-copy";

export const metadata: Metadata = {
  title: "Products & Instruments",
  description:
    "Full contract specifications for every instrument Connect Funded quotes: forex, metals, energy, indices, crypto and share CFDs, with spreads, tick sizes, leverage and session hours.",
};

const classIcons: Record<AssetClass, typeof Coins> = {
  forex: Coins,
  metals: Landmark,
  commodities: Activity,
  indices: LineChart,
  crypto: Bitcoin,
  stocks: TrendingUp,
};

/**
 * Session detail per class. Every window agrees with the hours code carried on
 * the instruments themselves.
 */
const sessionNotes: Record<AssetClass, string> = {
  forex:
    "Continuous from the Sydney open on Sunday at 21:00 UTC to the New York close on Friday at 21:00 UTC. Rollover is processed at 21:00 UTC each day.",
  metals:
    "Spot metals track the same continuous window as forex, from Sunday 21:00 UTC to Friday 21:00 UTC, priced against the deepest London and Comex venues.",
  commodities:
    "Energy CFDs quote from Sunday 21:00 UTC to Friday 21:00 UTC, so inventory reports and OPEC+ headlines are tradable as they land rather than at the next open.",
  indices:
    "US cash indices quote for 23 hours a day with a one-hour maintenance break at 21:00 UTC. European cash indices follow their primary session, 07:00 to 21:00 UTC. The Nikkei quotes for 22 hours with a two-hour settlement break.",
  crypto:
    "Quoted continuously, including weekends and public holidays, with no swap fees for overnight positions.",
  stocks:
    "Regular US trading hours only: 13:30 to 20:00 UTC, shifting by one hour when the United States moves to daylight saving. No pre-market or after-hours quoting.",
};

/** Lot conventions published per class, matching the platform contract specs. */
const contractSpecs: Record<AssetClass, string[]> = {
  forex: [
    "1 standard lot = 100,000 units of the base currency",
    "Minimum trade size 0.01 lots, in 0.01 increments",
    "Pip value on a USD-quoted major: $10 per standard lot",
    "Majors quote to 5 decimals and JPY crosses to 3 — the final digit is a fractional pip",
  ],
  metals: [
    "Gold, platinum and palladium: 1 lot = 100 troy ounces",
    "Silver: 1 lot = 5,000 troy ounces",
    "Minimum trade size 0.01 lots",
  ],
  commodities: [
    "WTI and Brent: 1 lot = 1,000 barrels",
    "Natural gas: 1 lot = 10,000 MMBtu",
    "Minimum trade size 0.1 lots on energy",
  ],
  indices: [
    "1 lot = 1 contract, worth one unit of the quote currency per index point",
    "Minimum trade size 0.1 lots",
    "Cash CFDs — no expiry, no roll and no swap fees",
  ],
  crypto: [
    "1 lot = 1 coin (BTC, ETH or SOL)",
    "Minimum trade size 0.01 lots",
    "No swap fees for positions held overnight",
  ],
  stocks: [
    "1 lot = 1 share",
    "Minimum trade size 1 share",
    "Corporate actions adjusted on the ex-date; dividends applied as a cash adjustment",
  ],
};

const executionPoints = [
  {
    icon: Server,
    title: "Tier-1 liquidity, aggregated",
    body: "Pricing is aggregated from a panel of tier-1 banks and non-bank market makers. The best available bid and offer is what reaches your terminal — the $10,000 account routes through the same bridge as the $200,000 one.",
  },
  {
    icon: ShieldCheck,
    title: "No dealing-desk intervention",
    body: "There is no manual desk sitting between your order and the aggregated book. Nobody reprices a fill after the fact, and there is no plug that widens quotes for a profitable account.",
  },
  {
    icon: Timer,
    title: "No widening mandate around news",
    body: "Spreads move when the underlying book moves and not because a release is on the calendar. We do not apply a scheduled-news markup, do not raise margin ahead of an event, and do not close positions into one.",
  },
  {
    icon: Gauge,
    title: "Symmetric slippage",
    body: "In a fast market you may fill away from your requested price. When that movement is in your favour it is passed through to you in full, exactly as it is when it is against you.",
  },
] as const;

const financingPoints = [
  {
    title: "No swap fees",
    body: "Connect Funded does not charge overnight financing or swap fees on any asset class, on evaluation or funded accounts.",
  },
  {
    title: "Hold positions overnight",
    body: "Positions may remain open through the daily rollover without a swap deduction.",
  },
  {
    title: "Rollover and market hours",
    body: "Daily maintenance windows can affect when some instruments quote. They do not add an overnight financing fee.",
  },
  {
    title: "What to check",
    body: "Instrument specifications show spreads, leverage and contract sizes. Contact the desk if you need help comparing markets.",
  },
] as const;

export default async function ProductsPage() {
  const [instruments, locale] = await Promise.all([getInstruments(), getServerLocale()]);
  const t = (key: Parameters<typeof routeCopy>[1]) => routeCopy(locale, key);
  const contractCopy = locale === "en" ? contractSpecs : locale === "fr" ? {
    forex: ["1 lot standard = 100 000 unités de la devise de base", "Taille minimale : 0,01 lot, par incréments de 0,01", "Valeur du pip sur une paire majeure en USD : 10 $ par lot standard", "Les paires majeures sont cotées à 5 décimales et les paires en JPY à 3 ; le dernier chiffre correspond à une fraction de pip"],
    metals: ["Or, platine et palladium : 1 lot = 100 onces troy", "Argent : 1 lot = 5 000 onces troy", "Taille minimale : 0,01 lot"],
    commodities: ["WTI et Brent : 1 lot = 1 000 barils", "Gaz naturel : 1 lot = 10 000 MMBtu", "Taille minimale : 0,1 lot sur l’énergie"],
    indices: ["1 lot = 1 contrat, valorisé à une unité de la devise de cotation par point d’indice", "Taille minimale : 0,1 lot", "CFD au comptant : sans échéance, reconduction ni swap"],
    crypto: ["1 lot = 1 unité (BTC, ETH ou SOL)", "Taille minimale : 0,01 lot", "Aucun swap pour les positions conservées overnight"],
    stocks: ["1 lot = 1 action", "Taille minimale : 1 action", "Les opérations sur titres sont ajustées à la date de détachement ; les dividendes sont crédités ou débités en espèces"],
  } : {
    forex: ["اللوت القياسي الواحد = 100,000 وحدة من عملة الأساس", "الحد الأدنى للتداول 0.01 لوت، بزيادة قدرها 0.01", "قيمة النقطة في الأزواج الرئيسية المسعرة بالدولار: 10 دولارات للوت القياسي", "تُسعّر الأزواج الرئيسية بخمس خانات عشرية وأزواج الين بثلاث؛ الخانة الأخيرة جزء من النقطة"],
    metals: ["الذهب والبلاتين والبلاديوم: اللوت = 100 أونصة تروي", "الفضة: اللوت = 5,000 أونصة تروي", "الحد الأدنى للتداول 0.01 لوت"],
    commodities: ["خام غرب تكساس وبرنت: اللوت = 1,000 برميل", "الغاز الطبيعي: اللوت = 10,000 مليون وحدة حرارية بريطانية", "الحد الأدنى لتداول الطاقة 0.1 لوت"],
    indices: ["اللوت = عقد واحد، بقيمة وحدة من عملة التسعير لكل نقطة مؤشر", "الحد الأدنى للتداول 0.1 لوت", "عقود فروقات نقدية بلا انتهاء أو ترحيل أو رسوم تبييت"],
    crypto: ["اللوت = عملة واحدة (BTC أو ETH أو SOL)", "الحد الأدنى للتداول 0.01 لوت", "لا رسوم تبييت على المراكز المحتفظ بها لليوم التالي"],
    stocks: ["اللوت = سهم واحد", "الحد الأدنى للتداول سهم واحد", "تُسوّى إجراءات الشركات في تاريخ الاستحقاق وتُضاف توزيعات الأرباح أو تُخصم نقدًا"],
  };
  const sessionCopy = locale === "en" ? sessionNotes : locale === "fr" ? {
    forex: "Cotation continue de l’ouverture de Sydney le dimanche à 21 h UTC à la clôture de New York le vendredi à 21 h UTC. Le rollover a lieu chaque jour à 21 h UTC.",
    metals: "Les métaux au comptant suivent les horaires continus du forex, du dimanche 21 h UTC au vendredi 21 h UTC, selon les principales places de Londres et du COMEX.",
    commodities: "Les CFD sur l’énergie sont cotés du dimanche 21 h UTC au vendredi 21 h UTC ; les rapports sur les stocks et les annonces de l’OPEP+ sont ainsi accessibles dès leur publication.",
    indices: "Les indices américains au comptant sont cotés 23 heures par jour, avec une pause d’une heure à 21 h UTC. Les indices européens suivent leur séance principale, de 7 h à 21 h UTC. Le Nikkei est coté 22 heures avec une pause de règlement de deux heures.",
    crypto: "Cotation continue, y compris les week-ends et jours fériés, sans swap pour les positions conservées overnight.",
    stocks: "Séance américaine normale uniquement : 13 h 30 à 20 h UTC, avec un décalage d’une heure lors du changement d’heure aux États-Unis. Pas de cotation avant ou après la séance.",
  } : {
    forex: "تسعير مستمر من افتتاح سيدني يوم الأحد الساعة 21:00 UTC حتى إغلاق نيويورك يوم الجمعة في الوقت نفسه. ويُجرى الترحيل يوميًا عند الساعة 21:00 UTC.",
    metals: "تتبع المعادن الفورية ساعات الفوركس الممتدة من الأحد 21:00 UTC إلى الجمعة 21:00 UTC، وفقًا لأسواق لندن وكومكس الرئيسية.",
    commodities: "تُسعّر عقود الطاقة من الأحد 21:00 UTC حتى الجمعة 21:00 UTC، لتتمكن من التداول عند صدور بيانات المخزون وأخبار أوبك+.",
    indices: "تُسعّر المؤشرات الأمريكية النقدية 23 ساعة يوميًا مع توقف ساعة عند 21:00 UTC. وتتبع المؤشرات الأوروبية جلستها الرئيسية من 07:00 إلى 21:00 UTC. ويُسعّر مؤشر نيكاي 22 ساعة مع توقف تسوية لساعتين.",
    crypto: "تسعير مستمر، بما في ذلك عطلات نهاية الأسبوع والعطل الرسمية، ومن دون رسوم تبييت للمراكز المفتوحة لليوم التالي.",
    stocks: "ساعات التداول الأمريكية المعتادة فقط: 13:30 إلى 20:00 UTC، مع اختلاف ساعة عند بدء التوقيت الصيفي في الولايات المتحدة. لا تتوفر أسعار قبل الجلسة أو بعدها.",
  };
  const executionCopy = locale === "en" ? executionPoints : locale === "fr" ? [
    { title: "Liquidité de premier rang agrégée", body: "Les cours agrègent les prix de banques de premier rang et de teneurs de marché non bancaires. La meilleure offre disponible arrive sur votre terminal ; les comptes de 10 000 $ et 200 000 $ passent par la même passerelle." },
    { title: "Aucune intervention d’un dealing desk", body: "Aucun bureau manuel ne s’interpose entre votre ordre et le carnet agrégé. Les exécutions ne sont pas repricées après coup et les spreads ne sont pas élargis pour un compte rentable." },
    { title: "Pas d’élargissement systématique lors des annonces", body: "Les spreads évoluent avec le carnet sous-jacent, pas avec le calendrier économique. Pas de majoration prévue lors des annonces, de hausse de marge avant un événement ni de clôture forcée à cette occasion." },
    { title: "Slippage symétrique", body: "Sur un marché rapide, l’exécution peut différer du prix demandé. Si l’écart vous est favorable, il vous revient intégralement, comme lorsqu’il vous est défavorable." },
  ] : [
    { title: "سيولة مجمّعة من المستوى الأول", body: "تُجمع الأسعار من بنوك رائدة وصناع سوق غير مصرفيين. يصل أفضل سعر متاح إلى منصتك، وتمر حسابات 10,000 و200,000 دولار عبر البنية نفسها." },
    { title: "لا تدخل من مكتب تداول", body: "لا يتدخل مكتب يدوي بين أمرك ودفتر الأسعار المجمّع. لا يعاد تسعير التنفيذ بعد حدوثه، ولا يُوسّع السبريد للحسابات الرابحة." },
    { title: "لا توسيع مجدول للسبريد وقت الأخبار", body: "يتحرك السبريد وفق دفتر الأسعار الأساسي، لا وفق مواعيد الأخبار. لا نضيف زيادة مجدولة، ولا نرفع الهامش قبل الحدث، ولا نغلق المراكز بسببه." },
    { title: "انزلاق سعري متماثل", body: "قد يختلف التنفيذ عن السعر المطلوب في الأسواق السريعة. وإذا كان الفرق لصالحك، تحصل عليه كاملًا كما تتحمل الفرق عندما يكون ضدك." },
  ];
  const financingCopy = locale === "en" ? financingPoints : locale === "fr" ? [
    { title: "Aucun swap", body: "Connect Funded ne facture pas de frais de financement overnight ni de swap, quelle que soit la classe d’actifs." },
    { title: "Conserver une position overnight", body: "Vous pouvez garder vos positions ouvertes pendant le rollover quotidien sans déduction de swap." },
    { title: "Rollover et horaires de marché", body: "Les pauses quotidiennes de maintenance peuvent modifier les horaires de cotation de certains instruments, sans ajouter de frais de financement overnight." },
    { title: "À vérifier", body: "Les spécifications indiquent les spreads, l’effet de levier et la taille des contrats. Contactez l’équipe pour comparer les marchés." },
  ] : [
    { title: "لا رسوم تبييت", body: "لا تفرض Connect Funded رسوم تمويل لليلة أو تبييت على أي فئة من الأصول." },
    { title: "الاحتفاظ بالمراكز لليوم التالي", body: "يمكن إبقاء المراكز مفتوحة خلال موعد الترحيل اليومي من دون خصم رسوم تبييت." },
    { title: "الترحيل وساعات السوق", body: "قد تؤثر فترات الصيانة اليومية في مواعيد تسعير بعض الأدوات، لكنها لا تضيف رسوم تمويل لليلة." },
    { title: "ما الذي ينبغي مراجعته؟", body: "توضح مواصفات الأدوات السبريد والرافعة وأحجام العقود. تواصل مع الفريق إذا احتجت إلى مقارنة الأسواق." },
  ];

  const grouped = ASSET_CLASSES.map((assetClass) => ({
    assetClass,
    items: instruments.filter(
      (instrument) => instrument.assetClass === assetClass,
    ),
  })).filter((group) => group.items.length > 0);

  const navItems: SpecNavItem[] = grouped.map((group) => ({
    id: group.assetClass,
    label: translate(locale, `asset.${group.assetClass}` as Parameters<typeof translate>[1]),
    count: group.items.length,
  }));

  return (
    <>
      <PageHero total={instruments.length} groups={grouped.length} locale={locale} />

      <SpecNav items={navItems} />

      <Section className="pt-16 sm:pt-20 lg:pt-24">
        <Container className="space-y-24 lg:space-y-28">
          {grouped.map((group) => {
            const Icon = classIcons[group.assetClass];
            const label = translate(locale, `asset.${group.assetClass}` as Parameters<typeof translate>[1]);

            return (
              <section
                key={group.assetClass}
                id={group.assetClass}
                aria-labelledby={`${group.assetClass}-heading`}
                className="scroll-mt-36"
              >
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-12">
                  <Reveal>
                    <div className="flex items-center gap-3">
                      <span className="border-line-soft bg-sunken text-brand-light grid size-10 place-items-center rounded-xl border">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <span className="text-faint font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
                        {group.items.length} {group.items.length === 1 ? t("product.instrument") : t("product.instruments")}
                      </span>
                    </div>

                    <h2
                      id={`${group.assetClass}-heading`}
                      className="text-h3 mt-5"
                    >
                      {label}
                    </h2>
                    <p className="text-muted mt-3 leading-relaxed">
                      {localizedAssetClass(locale, group.assetClass).tagline}
                    </p>

                    <div className="border-line-soft mt-7 border-t pt-6">
                      <h3 className="text-faint font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
                        {t("product.contracts")}
                      </h3>
                      <ul className="mt-3 space-y-2">
                        {contractCopy[group.assetClass].map((spec) => (
                          <li
                            key={spec}
                            className="text-muted flex gap-2.5 text-[0.8125rem] leading-relaxed"
                          >
                            <span
                              className="chev mt-1.5 shrink-0"
                              aria-hidden="true"
                            />
                            {spec}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <p className="text-faint mt-6 text-[0.8125rem] leading-relaxed">
                      {sessionCopy[group.assetClass]}
                    </p>
                  </Reveal>

                  <Reveal delay={0.08} direction="left">
                    <InstrumentTable
                      assetClass={group.assetClass}
                      instruments={group.items}
                      caption={locale === "ar" ? `مواصفات عقود ${label}: السبريد وحجم التكة والرافعة وساعات الجلسات` : locale === "fr" ? `Spécifications des contrats ${label} : spread, tick, levier et horaires` : `${label} contract specifications: spread, tick size, leverage and session hours`}
                      locale={locale}
                    />
                    <p className="text-faint mt-3 text-xs">
                      {t("product.typical")} {" "}
                      <Link
                        href="/markets"
                        className="text-brand-light hover:underline"
                      >
                        {t("product.terminalLink")}
                      </Link>
                      .
                    </p>
                  </Reveal>
                </div>
              </section>
            );
          })}
        </Container>
      </Section>

      <Section
        id="execution"
        className="border-line-soft bg-raised/40 border-y"
      >
        <Container>
          <SectionHeading
            eyebrow={t("product.execution")}
            title={t("product.executionTitle")}
            lead={t("product.executionLead")}
          />

          <StaggerGroup className="mt-12 grid gap-5 md:grid-cols-2">
            {executionCopy.map((point, index) => {
              const Icon = executionPoints[index].icon;
              return <StaggerItem
                key={point.title}
                className="border-line-soft bg-panel rounded-2xl border p-6 sm:p-7"
              >
                <Icon
                  className="text-brand-light size-5"
                  aria-hidden="true"
                />
                <h3 className="text-ink font-display mt-5 text-base font-semibold">
                  {point.title}
                </h3>
                <p className="text-muted mt-2.5 text-sm leading-relaxed">
                  {point.body}
                </p>
              </StaggerItem>;
            })}
          </StaggerGroup>

          <Reveal delay={0.1}>
            <div className="border-line-soft bg-panel mt-6 grid gap-8 rounded-2xl border p-6 sm:grid-cols-3 sm:p-8">
              <div>
                <p className="text-ink font-display text-2xl font-semibold">{t("product.marketExecution")}</p>
                <p className="text-muted mt-2 text-sm leading-relaxed">
                  {t("product.marketExecutionBody")}
                </p>
              </div>
              <div>
                <p className="text-ink font-display text-2xl font-semibold">
                  {t("product.noStopDistance")}
                </p>
                <p className="text-muted mt-2 text-sm leading-relaxed">
                  {t("product.noStopDistanceBody")}
                </p>
              </div>
              <div>
                <p className="text-ink font-display text-2xl font-semibold">
                  {t("product.partialFills")}
                </p>
                <p className="text-muted mt-2 text-sm leading-relaxed">
                  {t("product.partialFillsBody")}
                </p>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section id="financing">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
            <SectionHeading
              eyebrow={t("product.swapPolicy")}
              title={t("product.noSwaps")}
              lead={t("product.swapLead")}
            />

            <Reveal delay={0.06}>
              <dl className="border-line-soft divide-line-soft divide-y rounded-2xl border">
                {financingCopy.map((point) => (
                  <div key={point.title} className="p-6 sm:p-7">
                    <dt className="text-ink font-display text-base font-semibold">
                      {point.title}
                    </dt>
                    <dd className="text-muted mt-2 text-sm leading-relaxed">
                      {point.body}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <div className="border-line-soft bg-sunken/50 mt-10 flex flex-col gap-5 rounded-2xl border p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="flex items-start gap-4">
                <Layers
                  className="text-brand-light mt-1 size-5 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-ink text-[0.9375rem] font-semibold">
                    {t("product.overnight")}
                  </p>
                  <p className="text-muted mt-1.5 max-w-2xl text-sm leading-relaxed">
                    {t("product.overnightBody")}
                  </p>
                </div>
              </div>
              <ButtonLink href="/contact" variant="soft" className="shrink-0">
                {t("product.conditions")}
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </Section>

      <ConversionBand locale={locale} />
    </>
  );
}

function PageHero({ total, groups, locale }: { total: number; groups: number; locale: "en" | "fr" | "ar" }) {
  const t = (key: Parameters<typeof routeCopy>[1]) => routeCopy(locale, key);
  return (
    <section className="bg-noise relative overflow-hidden pt-14 pb-16 sm:pt-20 lg:pt-24 lg:pb-20">
      <Aurora intensity="strong" />
      <GridBackdrop />
      <div
        aria-hidden="true"
        className="from-bg pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t to-transparent"
      />

      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end">
          <div>
            <Reveal direction="none">
              <span className="eyebrow">
                <span className="chev" />
                {t("product.eyebrow")}
              </span>
            </Reveal>
            <Reveal delay={0.06}>
              <h1 className="text-h1 mt-6">
                {t("product.title")}
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="text-lead text-muted mt-6 max-w-2xl">
                {t("product.lead").replace("{total}", String(total)).replace("{groups}", String(groups))}
              </p>
            </Reveal>
            <Reveal delay={0.18} className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/markets" size="lg">
                {t("product.terminal")}
                <ArrowRight />
              </ButtonLink>
              <ButtonLink href="#execution" variant="soft" size="lg">
                {t("product.commitments")}
              </ButtonLink>
            </Reveal>
          </div>

          <Reveal delay={0.2} direction="left">
            <dl className="border-line-soft bg-line-soft grid grid-cols-2 gap-px overflow-hidden rounded-2xl border">
              {ASSET_CLASSES.map((assetClass) => {
                const Icon = classIcons[assetClass];
                return (
                  <div key={assetClass} className="bg-panel p-5">
                    <dt className="flex items-center gap-2">
                      <Icon
                        className="text-brand-light size-3.5"
                        aria-hidden="true"
                      />
                      <span className="text-ink text-[0.8125rem] font-semibold">
                        {translate(locale, `asset.${assetClass}` as Parameters<typeof translate>[1])}
                      </span>
                    </dt>
                    <dd className="text-faint mt-1.5 text-xs leading-snug">
                      <a
                        href={`#${assetClass}`}
                        className="hover:text-brand-light transition-colors"
                      >
                        {locale === "ar" ? "عرض المواصفات" : locale === "fr" ? "Voir les spécifications" : "View specifications"}
                      </a>
                    </dd>
                  </div>
                );
              })}
            </dl>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function ConversionBand({ locale }: { locale: "en" | "fr" | "ar" }) {
  const copy = locale === "ar"
    ? { eyebrow: "حساب واحد، جميع الأسواق", title: "تداول جميع الأسواق من حساب ممول واحد.", lead: "اجتز تقييماً من مرحلتين لتحصل على مجموعة المنتجات كاملةً عبر المنصات الثلاث، مع إعلان نسبة اقتسام الأرباح مسبقًا.", create: "أنشئ حسابًا", compare: "قارن أنواع الحسابات" }
    : locale === "fr"
      ? { eyebrow: "Un compte, tous les marchés", title: "Accédez à tous les marchés depuis un seul compte financé.", lead: "Réussissez l’évaluation en deux phases pour accéder à toute la gamme sur les trois plateformes, avec le partage des profits publié à l’avance.", create: "Créer un compte", compare: "Comparer les comptes" }
      : { eyebrow: "One account, every market", title: "Trade all of it from a single funded login.", lead: "Pass a two-phase evaluation and the whole product range is yours, on any of the three platforms, with the profit split published up front.", create: "Create account", compare: "Compare account tiers" };
  return (
    <Section className="relative overflow-hidden">
      <Aurora intensity="medium" />
      <Container className="relative">
        <div className="border-line-soft bg-panel/80 rounded-3xl border p-8 backdrop-blur-sm sm:p-12 lg:p-16">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.2fr)_auto]">
            <div>
              <span className="eyebrow">
                <span className="chev" />
                {copy.eyebrow}
              </span>
              <h2 className="text-h2 mt-5 max-w-2xl">
                {copy.title}
              </h2>
              <p className="text-lead text-muted mt-5 max-w-xl">
                {copy.lead}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <ButtonLink href={signupUrl} size="lg">
                {copy.create}
                <ArrowRight />
              </ButtonLink>
              <ButtonLink href="/accounts" variant="soft" size="lg">
                {copy.compare}
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
