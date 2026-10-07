import type { Metadata } from "next";

import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/json-ld";
import { AcceptedPaymentsSection } from "@/components/sections/accepted-payments";
import { AssetClassGrid } from "@/components/sections/asset-class-grid";
import { BrokerAccountTypesSection } from "@/components/sections/broker-account-types";
import { FaqPreviewSection } from "@/components/sections/faq-preview";
import { HomeAboutSection } from "@/components/sections/home-about";
import { HomeContactSection } from "@/components/sections/home-contact";
import { HomeHero } from "@/components/sections/home-hero";
import { HomeLandingIntro } from "@/components/sections/home-landing-intro";
import { HomeTradingSection } from "@/components/sections/home-trading";
import { MarketsPreviewSection } from "@/components/sections/markets-preview";
import { OpenAccountSteps } from "@/components/sections/open-account-steps";
import { PlatformShowcase } from "@/components/sections/platform-showcase";
import { ToolsPreview } from "@/components/sections/tools-preview";
import { TradingConditionsSection } from "@/components/sections/trading-conditions";
import { TradingCommandCenter } from "@/components/sections/trading-command-center";
import { TickerTapeSection } from "@/components/sections/ticker-tape";
import { getFaqs, getInstruments } from "@/db/queries";
import { getContent } from "@/lib/cms/get-content";
import { createMediaResolver } from "@/lib/cms/media";
import { getServerLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizedPath } from "@/lib/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, { meta }] = await Promise.all([getServerLocale(), getContent("home")]);
  const dictionary = getDictionary(locale);
  return {
    title: locale === "en" ? meta.title : dictionary["seo.homeTitle"],
    description: locale === "en" ? meta.description : dictionary["seo.homeDescription"],
    alternates: {
      canonical: localizedPath("/", locale),
      languages: {
        en: localizedPath("/", "en"),
        fr: localizedPath("/", "fr"),
        ar: localizedPath("/", "ar"),
      },
    },
    openGraph: { title: locale === "en" ? meta.title : dictionary["seo.homeTitle"], description: locale === "en" ? meta.description : dictionary["seo.homeDescription"], locale: locale === "ar" ? "ar" : locale === "fr" ? "fr_FR" : "en_US" },
  };
}

export const revalidate = 60;

/**
 * Homepage narrative, top to bottom: what you can trade -> on what terms ->
 * on which platform -> with which tools -> how to start -> who we are.
 *
 * Each band answers the question the previous one raises, which is why the
 * order matters more than the individual sections do.
 */
export default async function HomePage() {
  const [instruments, faqs, content, image, locale] = await Promise.all([
    getInstruments(),
    getFaqs(),
    getContent("home"),
    createMediaResolver(),
    getServerLocale(),
  ]);

  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />

      <HomeLandingIntro />
      <HomeHero content={content.hero} />
      <TickerTapeSection />

      <TradingCommandCenter />
      <AssetClassGrid />
      <TradingConditionsSection />
      <BrokerAccountTypesSection />
      <MarketsPreviewSection instruments={instruments} locale={locale} />
      <PlatformShowcase />
      <ToolsPreview />
      <HomeTradingSection
        content={content.trading}
        image={image("home.trading")}
      />
      <OpenAccountSteps />
      <FaqPreviewSection faqs={faqs} />
      <AcceptedPaymentsSection />
      <HomeAboutSection content={content.about} image={image("home.about")} />
      <HomeContactSection content={content.contact} />
    </>
  );
}
