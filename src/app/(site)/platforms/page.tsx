import type { Metadata } from "next";
import { ArrowUpRight, Download, Monitor, Smartphone, Tablet, ShieldCheck } from "lucide-react";

import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Aurora, GridBackdrop } from "@/components/ui/aurora";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { TradingAppExperience } from "@/components/sections/trading-app-experience";
import { FeaturePageImage } from "@/components/sections/feature-page-image";
import { signupUrl } from "@/lib/site";
import { getServerLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  title: "Trading Platforms",
  description: "Access MetaTrader 5 on desktop, iOS and Android with Connect Funded.",
};

const downloads = [
  { id: "desktop", icon: Monitor, title: "Desktop Terminal", body: "Download the MT5 desktop application for Windows and trade with advanced charts, Expert Advisors and one-click execution.", detail: "Windows", href: "https://www.metatrader5.com/en/download", cta: "Download Desktop" },
  { id: "ios", icon: Smartphone, title: "Mobile iOS", body: "Get the official MT5 app for your iPhone or iPad. Monitor positions, review charts and manage orders while you are away from your desk.", detail: "iPhone · iPad", href: "https://www.metatrader5.com/en/mobile-trading/iphone-ipad", cta: "Download for iOS" },
  { id: "android", icon: Tablet, title: "Mobile Android", body: "Get the official MT5 app for your Android device with live quotes, technical analysis and secure account access.", detail: "Android phones · tablets", href: "https://www.metatrader5.com/en/mobile-trading/android", cta: "Download for Android" },
] as const;

const leverage = [["Forex", "1:100"], ["Indices", "1:200"], ["Metals", "1:200"], ["Energies", "1:200"], ["Stocks", "1:200"], ["Crypto", "1:200"]] as const;

export default async function PlatformsPage() {
  const locale = await getServerLocale();
  const copy = locale === "ar" ? {
    heading: "تداول احترافي عبر منصة MetaTrader 5.", lead: "تداول الأسواق العالمية عبر منصة مألوفة وأسعار مباشرة من الوسيط وأدوات لإدارة المخاطر قبل كل أمر وبعده.", open: "افتح حسابًا", choose: "اختر جهازك", access: "الوصول إلى MT5", devices: "منصة واحدة. كل الأجهزة.", deviceLead: "استخدم تطبيق MetaTrader 5 الرسمي على الكمبيوتر أو iOS أو Android. يبقى حساب التداول وقائمة المتابعة والأسعار متصلة بين أجهزتك.", downloadsNote: "تفتح روابط التنزيل مواقع MetaTrader الرسمية. تأكد من اختيار خادم الوسيط الصحيح وبيانات حسابك قبل تسجيل الدخول.", workspace: "مساحة التداول", workflow: "تعرّف على سير العمل قبل فتح أمر التداول.", workflowLead: "تنقل بين الأسواق المباشرة والرسوم البيانية وأدوات إدارة المخاطر والمساعد دون فقدان السياق.", workspaceLabels: ["سوق في مساحة عمل واحدة", "واجهات لاتخاذ القرار", "الرافعة المعلنة للفوركس", "إمكانية التداول"], conditions: "شروط الحساب", leverageTitle: "الرافعة واضحة قبل التداول.", leverageLead: "النسب المعلنة بحسب فئة الأصل. يعتمد التوفر النهائي على المنتج وفئة العميل والاختصاص القضائي وإعداد الحساب.", leverageWarning: "تضخم الرافعة المالية الأرباح والخسائر. راجع الهامش المتوقع والنسبة المطبقة قبل تأكيد الأمر، واستخدم حاسبة المراكز لتحديد المخاطر بحذر.", cards: [{ title: "منصة الكمبيوتر", body: "نزّل تطبيق MT5 لنظام Windows واستخدم الرسوم المتقدمة والمستشارين الخبراء والتنفيذ بنقرة واحدة.", detail: "Windows", cta: "تنزيل للكمبيوتر" }, { title: "الهاتف بنظام iOS", body: "احصل على تطبيق MT5 الرسمي لهاتف iPhone أو جهاز iPad لمتابعة المراكز والرسوم وإدارة الأوامر أثناء التنقل.", detail: "iPhone · iPad", cta: "تنزيل لـ iOS" }, { title: "الهاتف بنظام Android", body: "احصل على تطبيق MT5 الرسمي مع الأسعار المباشرة والتحليل الفني والوصول الآمن إلى الحساب.", detail: "هواتف وأجهزة Android اللوحية", cta: "تنزيل لـ Android" }]
  } : locale === "fr" ? {
    heading: "Un accès professionnel aux marchés avec MetaTrader 5.", lead: "Tradez les marchés mondiaux sur une plateforme familière, avec les cours du courtier en temps réel et les outils nécessaires pour gérer le risque avant et après chaque ordre.", open: "Ouvrir un compte", choose: "Choisir un appareil", access: "Accès MT5", devices: "Une plateforme. Tous vos appareils.", deviceLead: "Utilisez l’application officielle MetaTrader 5 sur ordinateur, iOS ou Android. Votre compte, votre liste de suivi et les cours restent synchronisés.", downloadsNote: "Les liens de téléchargement ouvrent les sites officiels MetaTrader. Vérifiez le serveur du courtier et vos identifiants avant de vous connecter.", workspace: "Espace de trading", workflow: "Découvrez le processus avant d’ouvrir un ticket.", workflowLead: "Passez des marchés en direct aux graphiques, aux outils de risque et à l’assistant du site sans perdre le fil.", workspaceLabels: ["Marchés dans un espace", "Vues de décision", "Levier forex annoncé", "Accès aux marchés"], conditions: "Conditions du compte", leverageTitle: "Le levier est affiché avant le trading.", leverageLead: "Ratios annoncés par classe d’actifs. La disponibilité finale dépend du produit, de la catégorie du client, de la juridiction et de la configuration du compte.", leverageWarning: "L’effet de levier amplifie gains et pertes. Consultez la marge estimée et le ratio applicable avant de confirmer l’ordre, et utilisez la calculatrice pour dimensionner votre risque avec prudence.", cards: [{ title: "Terminal ordinateur", body: "Téléchargez MT5 pour Windows et profitez des graphiques avancés, des Expert Advisors et de l’exécution en un clic.", detail: "Windows", cta: "Télécharger pour ordinateur" }, { title: "Mobile iOS", body: "Installez l’application MT5 officielle sur iPhone ou iPad pour suivre vos positions, consulter les graphiques et gérer vos ordres où que vous soyez.", detail: "iPhone · iPad", cta: "Télécharger pour iOS" }, { title: "Mobile Android", body: "Installez l’application MT5 officielle sur Android avec cours en direct, analyse technique et accès sécurisé au compte.", detail: "Téléphones et tablettes Android", cta: "Télécharger pour Android" }]
  } : {
    heading: "Professional trading access through MetaTrader 5.", lead: "Trade global markets with a familiar platform, real-time broker pricing and the tools you need to manage risk before and after every order.", open: "Open an account", choose: "Choose your device", access: "MT5 access", devices: "One platform. Every device.", deviceLead: "Use the official MetaTrader 5 application on desktop, iOS or Android. Your trading account, watchlist and market prices remain connected across devices.", downloadsNote: "Downloads open official MetaTrader destinations. Confirm the correct broker server and account credentials in the client area before signing in.", workspace: "The trading workspace", workflow: "See the workflow before you open the order ticket.", workflowLead: "Move between live markets, chart context, risk controls and the site assistant without losing the thread.", workspaceLabels: ["Markets in one workspace", "Decision views", "Forex headline leverage", "Market access"], conditions: "Account conditions", leverageTitle: "Leverage is visible before you trade.", leverageLead: "Published headline ratios by asset class. Final availability depends on product, customer category, jurisdiction and account configuration.", leverageWarning: "Leverage amplifies gains and losses. Show the estimated margin and the applicable ratio before order confirmation, and use the position calculator to size risk conservatively.", cards: downloads
  };
  const cards = locale === "en" ? downloads : downloads.map((item, index) => ({ ...item, ...copy.cards[index] }));
  const leverageItems = leverage.map(([slug, ratio]) => [translate(locale, `asset.${slug.toLowerCase()}` as Parameters<typeof translate>[1]), ratio] as const);
  return (
    <>
      <section className="trading-horizon relative isolate flex min-h-[620px] items-center overflow-hidden py-24 sm:min-h-[700px] sm:py-28">
        <FeaturePageImage src="/images/platform.jpg" alt={locale === "ar" ? "شاشة منصة التداول MetaTrader 5 مع رسوم بيانية متعددة" : locale === "fr" ? "Écran de trading MetaTrader 5 affichant plusieurs graphiques" : "A MetaTrader 5 trading screen with multiple charts"} objectPosition="center" motionVariant="platforms" />
        <Aurora intensity="strong" /><GridBackdrop />
        <Container className="relative">
          <div className="max-w-3xl">
            <Reveal direction="none"><span className="eyebrow"><span className="chev" /> {locale === "ar" ? "منصات التداول" : locale === "fr" ? "Plateformes de trading" : "Trading platforms"}</span></Reveal>
            <Reveal delay={0.06}><h1 className="text-h1 mt-6 text-white">{copy.heading}</h1></Reveal>
            <Reveal delay={0.12}><p className="text-lead mt-6 max-w-2xl text-white/80">{copy.lead}</p></Reveal>
            <Reveal delay={0.18} className="mt-8 flex flex-wrap gap-3"><ButtonLink href={signupUrl} size="lg">{copy.open} <ArrowUpRight /></ButtonLink><ButtonLink href="#downloads" variant="soft" size="lg">{copy.choose}</ButtonLink></Reveal>
          </div>
        </Container>
      </section>

      <Section id="downloads" className="pt-8 sm:pt-12"><Container>
        <SectionHeading eyebrow={copy.access} title={copy.devices} lead={copy.deviceLead} />
        <StaggerGroup className="mt-12 grid gap-5 lg:grid-cols-3">{cards.map((item) => <StaggerItem key={item.id} className="border-line-soft bg-panel flex flex-col rounded-2xl border p-6 sm:p-7">
          <span className="border-brand/30 bg-brand/10 text-brand-light grid size-12 place-items-center rounded-2xl border"><item.icon className="size-5" aria-hidden="true" /></span>
          <Badge tone="neutral" className="mt-6 w-fit">{item.detail}</Badge><h2 className="text-ink font-display mt-4 text-xl font-semibold">{item.title}</h2>
          <p className="text-muted mt-3 flex-1 text-sm leading-relaxed">{item.body}</p><ButtonLink href={item.href} variant="soft" className="mt-7 w-full justify-center">{item.cta} <Download /></ButtonLink>
        </StaggerItem>)}</StaggerGroup>
        <p className="text-faint mt-5 text-xs">{copy.downloadsNote}</p>
      </Container></Section>

      <Section id="workspace" className="border-line-soft border-y bg-[var(--cf-hero-bg)]">
        <Container>
          <SectionHeading
            eyebrow={copy.workspace}
            title={copy.workflow}
            lead={copy.workflowLead}
          />
          <div className="mt-10"><TradingAppExperience /></div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["15+", copy.workspaceLabels[0]],
              ["4", copy.workspaceLabels[1]],
              ["1:100", copy.workspaceLabels[2]],
              ["24/5", copy.workspaceLabels[3]],
            ].map(([value, label]) => <div key={label} className="border-line-soft bg-panel/70 rounded-2xl border p-5"><p className="font-mono text-2xl font-semibold text-brand-light">{value}</p><p className="mt-2 text-xs text-muted">{label}</p></div>)}
          </div>
        </Container>
      </Section>

      <Section id="leverage" className="border-line-soft bg-raised/40 border-y"><Container>
        <SectionHeading eyebrow={copy.conditions} title={copy.leverageTitle} lead={copy.leverageLead} />
        <div className="border-line-soft mt-10 grid overflow-hidden rounded-2xl border sm:grid-cols-2 lg:grid-cols-3">{leverageItems.map(([asset, ratio]) => <div key={asset} className="bg-panel border-line-soft flex items-center justify-between border-b p-5"><span className="text-ink font-medium">{asset}</span><span className="text-brand-light font-mono text-lg font-semibold">{ratio}</span></div>)}</div>
        <div className="border-brand/25 bg-brand/5 mt-8 flex gap-4 rounded-2xl border p-5"><ShieldCheck className="text-brand-light mt-0.5 size-5 shrink-0" /><p className="text-muted text-sm leading-relaxed">{copy.leverageWarning}</p></div>
      </Container></Section>
    </>
  );
}
