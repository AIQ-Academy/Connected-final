/**
 * Marketing content shared by more than one surface. Anything that appears
 * both on the home page and a deep page lives here so the two can never
 * disagree about a number.
 *
 * Each exported list is split into a locale-independent "shape" (ids,
 * categories, icons, numeric specs) and a per-locale text map, merged by
 * the `getX(locale)` getters below. That keeps every language guaranteed
 * to carry the same fields — nothing to accidentally translate three times
 * and nothing to forget in one of them.
 */
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locale";

// --------------------------------------------------------------- payments
export type PaymentMethod = {
  name: string;
  category: "card" | "bank" | "wallet" | "crypto";
  deposit: string;
  payout: string;
  limits: string;
  direction: string;
  detail: string;
};

type PaymentMethodShape = { id: string; category: PaymentMethod["category"]; limits: string };
type PaymentMethodText = { name: string; deposit: string; payout: string; direction: string; detail: string };

const paymentMethodShapes: PaymentMethodShape[] = [
  { id: "visa", category: "card", limits: "$25–$5,000" },
  { id: "bankTransfer", category: "bank", limits: "$25–$25,000" },
  { id: "usdt", category: "crypto", limits: "$20–$50,000" },
  { id: "whish", category: "wallet", limits: "$25–$5,000 · $10,000 daily cap" },
  { id: "omt", category: "wallet", limits: "$25–$5,000 · $10,000 daily cap" },
  { id: "bob", category: "wallet", limits: "$25–$5,000 · $10,000 daily cap" },
];

const paymentMethodText: Record<Locale, Record<string, PaymentMethodText>> = {
  en: {
    visa: { name: "Visa", deposit: "Instant", payout: "Instant", direction: "Deposits and withdrawals", detail: "Use a card in your own name. Fees, currency support and verification are shown at checkout." },
    bankTransfer: { name: "Local bank transfer", deposit: "1–3 business days", payout: "1–3 business days", direction: "Deposits and withdrawals", detail: "Bank account ownership and legal-name matching may be required before release." },
    usdt: { name: "USDT (Tether)", deposit: "Instant", payout: "Instant", direction: "Deposits and withdrawals", detail: "Confirm the supported network and wallet address carefully before sending." },
    whish: { name: "Whish Money", deposit: "Instant", payout: "Instant", direction: "Deposits and withdrawals", detail: "The wallet must be registered to the verified account holder." },
    omt: { name: "OMT", deposit: "Instant", payout: "Instant", direction: "Deposits and withdrawals", detail: "Use an account registered to the verified account holder. Any provider-side conversion is shown before checkout." },
    bob: { name: "BOB Finance", deposit: "Instant", payout: "Instant", direction: "Deposits and withdrawals", detail: "Use an account registered to the verified account holder. Any provider-side conversion is shown before checkout." },
  },
  ar: {
    visa: { name: "فيزا", deposit: "فوري", payout: "فوري", direction: "إيداعات وسحوبات", detail: "استخدم بطاقة باسمك الشخصي. تظهر الرسوم والعملات المدعومة وإجراءات التحقق عند الدفع." },
    bankTransfer: { name: "تحويل بنكي محلي", deposit: "1–3 أيام عمل", payout: "1–3 أيام عمل", direction: "إيداعات وسحوبات", detail: "قد تكون ملكية الحساب البنكي ومطابقة الاسم القانوني مطلوبة قبل الإفراج عن الأموال." },
    usdt: { name: "USDT (Tether)", deposit: "فوري", payout: "فوري", direction: "إيداعات وسحوبات", detail: "تحقّق بعناية من الشبكة المدعومة وعنوان المحفظة قبل الإرسال." },
    whish: { name: "Whish Money", deposit: "فوري", payout: "فوري", direction: "إيداعات وسحوبات", detail: "يجب أن تكون المحفظة مسجّلة باسم صاحب الحساب الموثّق." },
    omt: { name: "OMT", deposit: "فوري", payout: "فوري", direction: "إيداعات وسحوبات", detail: "استخدم حسابًا مسجلًا باسم صاحب الحساب الموثّق. تظهر أي عملية تحويل من مزود الخدمة قبل إتمام الدفع." },
    bob: { name: "BOB Finance", deposit: "فوري", payout: "فوري", direction: "إيداعات وسحوبات", detail: "استخدم حسابًا مسجلًا باسم صاحب الحساب الموثّق. تظهر أي عملية تحويل من مزود الخدمة قبل إتمام الدفع." },
  },
  fr: {
    visa: { name: "Visa", deposit: "Instantané", payout: "Instantané", direction: "Dépôts et retraits", detail: "Utilisez une carte à votre propre nom. Les frais, devises prises en charge et la vérification s'affichent au moment du paiement." },
    bankTransfer: { name: "Virement bancaire local", deposit: "1 à 3 jours ouvrés", payout: "1 à 3 jours ouvrés", direction: "Dépôts et retraits", detail: "La propriété du compte bancaire et la correspondance du nom légal peuvent être exigées avant le déblocage." },
    usdt: { name: "USDT (Tether)", deposit: "Instantané", payout: "Instantané", direction: "Dépôts et retraits", detail: "Vérifiez soigneusement le réseau pris en charge et l'adresse du portefeuille avant tout envoi." },
    whish: { name: "Whish Money", deposit: "Instantané", payout: "Instantané", direction: "Dépôts et retraits", detail: "Le portefeuille doit être enregistré au nom du titulaire de compte vérifié." },
    omt: { name: "OMT", deposit: "Instantané", payout: "Instantané", direction: "Dépôts et retraits", detail: "Utilisez un compte au nom du titulaire vérifié. Toute conversion par le prestataire est affichée avant le paiement." },
    bob: { name: "BOB Finance", deposit: "Instantané", payout: "Instantané", direction: "Dépôts et retraits", detail: "Utilisez un compte au nom du titulaire vérifié. Toute conversion par le prestataire est affichée avant le paiement." },
  },
};

export function getPaymentMethods(locale: Locale): PaymentMethod[] {
  const text = paymentMethodText[locale] ?? paymentMethodText.en;
  return paymentMethodShapes.map((shape) => ({ ...shape, ...text[shape.id] }));
}

/** @deprecated Use {@link getPaymentMethods} so copy follows the visitor's locale. */
export const paymentMethods: PaymentMethod[] = getPaymentMethods("en");

const paymentCategoryLabelsByLocale: Record<Locale, Record<PaymentMethod["category"], string>> = {
  en: { card: "Cards & mobile wallets", bank: "Bank transfer", wallet: "E-wallets", crypto: "Cryptocurrency" },
  ar: { card: "البطاقات والمحافظ الرقمية", bank: "التحويل البنكي", wallet: "المحافظ الإلكترونية", crypto: "العملات الرقمية" },
  fr: { card: "Cartes et portefeuilles mobiles", bank: "Virement bancaire", wallet: "Portefeuilles électroniques", crypto: "Cryptomonnaie" },
};

export function getPaymentCategoryLabels(locale: Locale) {
  return paymentCategoryLabelsByLocale[locale] ?? paymentCategoryLabelsByLocale.en;
}

/** @deprecated Use {@link getPaymentCategoryLabels}. */
export const paymentCategoryLabels = getPaymentCategoryLabels("en");

// ------------------------------------------------------------ differentiators
export type Differentiator = {
  title: string;
  body: string;
  /** lucide-react icon name resolved by the consuming component. */
  icon:
    | "ShieldCheck"
    | "Zap"
    | "Clock"
    | "LayoutDashboard"
    | "Monitor"
    | "GraduationCap"
    | "Scale"
    | "Globe"
    | "Rocket";
};

type DifferentiatorText = { title: string; body: string };

const differentiatorIcons: Differentiator["icon"][] = [
  "ShieldCheck",
  "Zap",
  "Scale",
  "Globe",
  "Monitor",
  "Clock",
  "LayoutDashboard",
  "Rocket",
  "GraduationCap",
];

const differentiatorText: Record<Locale, DifferentiatorText[]> = {
  en: [
    { title: "Institutional-grade infrastructure", body: "Tier-1 aggregated liquidity, segregated client funds and bank-level encryption on every account, with consistent routing at every balance size." },
    { title: "Execution measured, not claimed", body: "Median order-to-fill latency and the fill rate are measured at the matching engine in LD4 and published. Nothing about execution quality is left to a marketing adjective." },
    { title: "Spreads that are not widened by policy", body: "We hold no mandate to widen spreads around scheduled releases. If the book thins during an NFP print, that is the only reason your spread moves." },
    { title: "One account, every asset class", body: "Forex, metals, energies, indices, share CFDs and crypto from a single login and a single balance. No separate permissions, no per-class add-ons, no surprise restrictions." },
    { title: "Trade on your platform", body: "MetaTrader 5 and a browser-based Web Terminal both connect to the same live account." },
    { title: "Withdrawals on your schedule", body: "Request whenever the markets are open. Requests are reviewed within one business day, returned to the method you funded with, and we absorb the processing fee on every rail." },
    { title: "A client area that tells the truth", body: "Live margin level, open exposure, full trade history, KYC status and every deposit and withdrawal in one dashboard, updated as your positions move." },
    { title: "Negative balance protection", body: "Retail accounts cannot go below zero. If a weekend gap takes an account negative, the balance is reset at our expense rather than invoiced to you." },
    { title: "Education that continues after funding", body: "Structured courses, weekly desk notes and a glossary written against our own specifications. Opening the account is the start of the relationship, not the end." },
  ],
  ar: [
    { title: "بنية تحتية بمستوى المؤسسات", body: "سيولة مجمّعة من مزودين من الطبقة الأولى، وأموال عملاء منفصلة، وتشفير بمستوى مصرفي على كل حساب، مع توجيه متسق مهما كان حجم الرصيد." },
    { title: "تنفيذ يُقاس، لا يُروَّج له فقط", body: "يُقاس زمن الاستجابة الوسيط من الطلب إلى التنفيذ ونسبة التنفيذ عند محرك المطابقة في LD4 ويُنشر علناً. لا شيء في جودة التنفيذ يُترك لصفة تسويقية." },
    { title: "فروقات لا تُوسَّع بقرار سياسة", body: "لا نملك تفويضاً لتوسيع الفروقات حول الإصدارات المجدولة. إذا خفّ عمق السوق خلال إصدار بيانات التوظيف الأمريكية، فهذا هو السبب الوحيد لتحرّك فارقك." },
    { title: "حساب واحد، كل فئات الأصول", body: "الفوركس والمعادن والطاقة والمؤشرات وعقود فروقات الأسهم والعملات الرقمية من تسجيل دخول واحد ورصيد واحد. بلا صلاحيات منفصلة، وبلا إضافات لكل فئة، وبلا قيود مفاجئة." },
    { title: "تداول على منصتك", body: "ميتاتريدر 5 ومحطة ويب تعمل عبر المتصفح، وكلاهما متصل بالحساب المباشر نفسه." },
    { title: "سحوبات في التوقيت الذي يناسبك", body: "اطلب السحب في أي وقت تكون الأسواق مفتوحة فيه. تُراجع الطلبات خلال يوم عمل واحد، وتُعاد إلى وسيلة التمويل نفسها، ونتحمّل رسوم المعالجة على كل قناة." },
    { title: "منطقة عميل تعكس الحقيقة", body: "مستوى الهامش المباشر، والتعرّض المفتوح، والسجل الكامل للصفقات، وحالة التحقق من الهوية، وكل عملية إيداع وسحب — في لوحة واحدة تتحدّث مع تحرك مراكزك." },
    { title: "حماية من الرصيد السالب", body: "لا يمكن لحسابات التداول الفردية أن تنخفض دون الصفر. إذا أدت فجوة سعرية في عطلة نهاية الأسبوع إلى رصيد سالب، تتم إعادة ضبط الرصيد على حسابنا لا على حسابك." },
    { title: "تعليم يستمر بعد التمويل", body: "دورات منظمة، وملاحظات أسبوعية من المكتب، ومسرد مكتوب بحسب مواصفاتنا الخاصة. فتح الحساب هو بداية العلاقة، لا نهايتها." },
  ],
  fr: [
    { title: "Infrastructure de niveau institutionnel", body: "Liquidité agrégée de niveau 1, fonds clients ségrégués et chiffrement de niveau bancaire sur chaque compte. Le solde de 100 $ passe par le même pont que celui de 500 000 $." },
    { title: "Exécution mesurée, pas seulement annoncée", body: "La latence médiane entre l'ordre et l'exécution ainsi que le taux d'exécution sont mesurés au niveau du moteur de rapprochement à LD4, puis publiés. Rien dans la qualité d'exécution n'est laissé à un adjectif marketing." },
    { title: "Des spreads jamais élargis par politique", body: "Nous n'avons aucun mandat pour élargir les spreads autour des publications programmées. Si la profondeur du marché se réduit lors d'un NFP, c'est la seule raison pour laquelle votre spread bouge." },
    { title: "Un compte, toutes les classes d'actifs", body: "Forex, métaux, énergies, indices, CFD sur actions et cryptomonnaies depuis une seule connexion et un seul solde. Pas de permissions séparées, pas d'options par classe, pas de restriction surprise." },
    { title: "Tradez sur votre plateforme", body: "MetaTrader 5 et un Web Terminal accessible depuis le navigateur se connectent au même compte réel." },
    { title: "Des retraits selon votre calendrier", body: "Demandez un retrait dès que les marchés sont ouverts. Les demandes sont examinées en un jour ouvré, renvoyées vers le moyen utilisé pour le dépôt, et nous prenons en charge les frais de traitement sur chaque circuit." },
    { title: "Un espace client qui dit la vérité", body: "Niveau de marge en direct, exposition ouverte, historique complet des transactions, statut KYC et chaque dépôt ou retrait, réunis dans un seul tableau de bord mis à jour au fil de vos positions." },
    { title: "Protection contre le solde négatif", body: "Les comptes particuliers ne peuvent pas descendre sous zéro. Si un écart de cours du week-end rend un compte négatif, le solde est remis à zéro à nos frais, jamais facturé." },
    { title: "Une formation qui continue après le financement", body: "Des cours structurés, des notes de desk hebdomadaires et un glossaire rédigé selon nos propres spécifications. L'ouverture du compte est le début de la relation, pas sa fin." },
  ],
};

export function getDifferentiators(locale: Locale): Differentiator[] {
  const text = differentiatorText[locale] ?? differentiatorText.en;
  return text.map((entry, index) => ({ ...entry, icon: differentiatorIcons[index] }));
}

/** @deprecated Use {@link getDifferentiators}. */
export const differentiators: Differentiator[] = getDifferentiators("en");

// ----------------------------------------------------------------- platforms
export type Platform = {
  name: string;
  slug: string;
  tagline: string;
  body: string;
  best: string;
  features: string[];
  spec: { label: string; value: string }[];
};

type PlatformShape = { slug: string; specValues: string[] };
type PlatformText = { name: string; tagline: string; body: string; best: string; features: string[] };

const platformShapes: PlatformShape[] = [
  { slug: "mt5", specValues: ["6", "21", "MQL5 / EAs"] },
  { slug: "ctrader", specValues: ["8", "26", "cAlgo / C#"] },
  { slug: "web", specValues: ["4", "12", "—"] },
];

function platformSpecLabels(locale: Locale) {
  const t = getDictionary(locale);
  const permitted =
    locale === "ar" ? "مسموح بها" : locale === "fr" ? "Autorisé" : "Permitted";
  const notSupported =
    locale === "ar" ? "غير مدعوم" : locale === "fr" ? "Non prise en charge" : "Not supported";
  const orderTypes =
    locale === "ar" ? "أنواع الأوامر" : locale === "fr" ? "Types d'ordres" : "Order types";
  const timeframes =
    locale === "ar" ? "الأطر الزمنية للرسوم" : locale === "fr" ? "Échéances graphiques" : "Charting timeframes";
  const automation =
    locale === "ar" ? "الأتمتة" : locale === "fr" ? "Automatisation" : "Automation";
  const hedging =
    locale === "ar" ? "التغطية" : locale === "fr" ? "Couverture" : "Hedging";
  void t;
  return { orderTypes, timeframes, automation, hedging, permitted, notSupported };
}

const platformText: Record<Locale, Record<string, PlatformText>> = {
  en: {
    mt5: { name: "MetaTrader 5", tagline: "The institutional standard", body: "The platform most traders already know, connected to our liquidity bridge with full expert-advisor support and no execution restrictions.", best: "Algorithmic traders and anyone migrating an existing MT5 workflow", features: ["Expert advisors and custom indicators", "21 timeframes and 38 built-in indicators", "Depth of market and one-click execution", "Strategy tester with real tick data", "Desktop, mobile and web builds"] },
    ctrader: { name: "cTrader", tagline: "Depth-of-market native", body: "Level II pricing, precise partial fills and a cleaner order ticket. The choice when execution quality matters more than plugin breadth.", best: "Discretionary scalpers and order-flow traders", features: ["Full Level II depth of market", "cBots written in C#", "Detachable multi-monitor charting", "Advanced take-profit and stop laddering", "Native macOS build"] },
    web: { name: "Web Terminal", tagline: "Nothing to install", body: "A browser terminal that connects to the same live account. Open a position from any machine without carrying a platform install with you.", best: "Traders on locked-down or shared machines", features: ["Runs in any modern browser", "Shared watchlists with the desktop platforms", "Integrated economic calendar", "Live margin level in the header", "Touch-optimised on tablets"] },
  },
  ar: {
    mt5: { name: "ميتاتريدر 5", tagline: "المعيار المؤسسي", body: "المنصة التي يعرفها معظم المتداولين مسبقاً، متصلة بجسر السيولة لدينا مع دعم كامل للمستشارين الآليين وبلا قيود على التنفيذ.", best: "المتداولون الخوارزميون وأي شخص ينقل سير عمل MT5 حالياً", features: ["مستشارون آليون ومؤشرات مخصصة", "21 إطاراً زمنياً و38 مؤشراً مدمجاً", "عمق السوق والتنفيذ بنقرة واحدة", "أداة اختبار الاستراتيجيات ببيانات تيك حقيقية", "إصدارات لسطح المكتب والجوال والويب"] },
    ctrader: { name: "cTrader", tagline: "مصمم لعمق السوق", body: "تسعير من المستوى الثاني، وتنفيذ جزئي دقيق، وتذكرة أوامر أوضح. الخيار الأمثل عندما تكون جودة التنفيذ أهم من عدد الإضافات.", best: "متداولو السكالبينج التقديريون ومتداولو تدفق الأوامر", features: ["عمق سوق كامل من المستوى الثاني", "روبوتات cBots مكتوبة بلغة C#", "رسوم بيانية قابلة للفصل على عدة شاشات", "تدرّج متقدم لجني الأرباح وأوامر الوقف", "إصدار أصلي لنظام macOS"] },
    web: { name: "محطة الويب", tagline: "لا حاجة لأي تثبيت", body: "محطة تعمل عبر المتصفح وتتصل بنفس الحساب المباشر. افتح مركزاً من أي جهاز دون الحاجة لحمل تثبيت المنصة معك.", best: "المتداولون على أجهزة مقيّدة أو مشتركة", features: ["يعمل على أي متصفح حديث", "قوائم مراقبة مشتركة مع منصات سطح المكتب", "تقويم اقتصادي مدمج", "مستوى الهامش المباشر في الأعلى", "محسّن للعمل باللمس على الأجهزة اللوحية"] },
  },
  fr: {
    mt5: { name: "MetaTrader 5", tagline: "La référence institutionnelle", body: "La plateforme que la plupart des traders connaissent déjà, connectée à notre pont de liquidité avec un support complet des experts-conseils et aucune restriction d'exécution.", best: "Traders algorithmiques et toute personne migrant un flux MT5 existant", features: ["Experts-conseils et indicateurs personnalisés", "21 unités de temps et 38 indicateurs intégrés", "Profondeur de marché et exécution en un clic", "Testeur de stratégie avec données tick réelles", "Versions bureau, mobile et web"] },
    ctrader: { name: "cTrader", tagline: "Pensé pour la profondeur de marché", body: "Cotation de niveau II, exécutions partielles précises et un ticket d'ordre plus clair. Le choix quand la qualité d'exécution compte plus que le nombre de plugins.", best: "Scalpeurs discrétionnaires et traders de flux d'ordres", features: ["Profondeur de marché complète de niveau II", "cBots écrits en C#", "Graphiques détachables multi-écrans", "Échelonnage avancé des take-profit et stops", "Version native macOS"] },
    web: { name: "Web Terminal", tagline: "Rien à installer", body: "Un terminal navigateur connecté au même compte réel. Ouvrez une position depuis n'importe quelle machine sans transporter d'installation.", best: "Traders sur postes verrouillés ou partagés", features: ["Fonctionne sur tout navigateur récent", "Listes de suivi partagées avec les plateformes bureau", "Calendrier économique intégré", "Niveau de marge en direct dans l'en-tête", "Optimisé tactile sur tablette"] },
  },
};

export function getPlatforms(locale: Locale): Platform[] {
  const text = platformText[locale] ?? platformText.en;
  const labels = platformSpecLabels(locale);
  return platformShapes.map((shape) => {
    const entry = text[shape.slug];
    return {
      ...entry,
      slug: shape.slug,
      spec: [
        { label: labels.orderTypes, value: shape.specValues[0] },
        { label: labels.timeframes, value: shape.specValues[1] },
        { label: labels.automation, value: shape.specValues[2] },
        { label: labels.hedging, value: labels.permitted },
      ],
    };
  });
}

/** @deprecated Use {@link getPlatforms}. */
export const platforms: Platform[] = getPlatforms("en");

// -------------------------------------------------------------- companyStats
type CompanyStat = { value: string; label: string };

const companyStatShapes = ["15,000+", "142", "$3.1B+", "4.7 / 5"] as const;

const companyStatLabels: Record<Locale, string[]> = {
  en: ["Instruments quoted", "Countries served", "Quarterly volume", "Average trader rating"],
  ar: ["أداة مسعّرة", "دولة نخدمها", "حجم التداول الفصلي", "متوسط تقييم المتداولين"],
  fr: ["Instruments cotés", "Pays desservis", "Volume trimestriel", "Note moyenne des traders"],
};

export function getCompanyStats(locale: Locale): CompanyStat[] {
  const labels = companyStatLabels[locale] ?? companyStatLabels.en;
  return companyStatShapes.map((value, index) => ({ value, label: labels[index] }));
}

/** @deprecated Use {@link getCompanyStats}. */
export const companyStats: CompanyStat[] = getCompanyStats("en");

// ------------------------------------------------------------------- stages
/** One numbered stage in an account-opening walkthrough. */
export type Stage = {
  index: string;
  kicker: string;
  title: string;
  body: string;
  points: string[];
};
