import type { Metadata } from "next";
import { routeAlternates } from "@/lib/i18n/metadata";

import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/json-ld";
import { BrokerAccountTypesSection } from "@/components/sections/broker-account-types";
import { AcceptedPaymentsSection } from "@/components/sections/accepted-payments";
import { FaqPreviewSection } from "@/components/sections/faq-preview";
import { BrokerHeroScrollStage } from "@/components/sections/broker-hero-scroll-stage";
import { HowItWorksSection } from "@/components/sections/how-it-works";
import { MarketsPreviewSection } from "@/components/sections/markets-preview";
import { RegistrationCtaSection } from "@/components/sections/registration-cta";
import { WhySection } from "@/components/sections/why-connect-funded";
import { getFaqs, getInstruments } from "@/db/queries";
import { getContent } from "@/lib/cms/get-content";
import { createMediaResolver } from "@/lib/cms/media";
import { guardProduct } from "@/lib/product-guard";
import { getServerLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getContent("trading");
  return {
    title: meta.title,
    description: meta.description,
    alternates: await routeAlternates("/trading"),
  };
}

/** Quotes in the tape go stale quickly; everything else is effectively static. */
export const revalidate = 60;

export default async function TradingLandingPage() {
  await guardProduct("broker");

  const [instruments, faqs, content, image, locale] = await Promise.all([
    getInstruments(),
    getFaqs(),
    getContent("trading"),
    createMediaResolver(),
    getServerLocale(),
  ]);

  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />

      <BrokerHeroScrollStage />
      <BrokerAccountTypesSection heading={content.accountTypes} />
      <HowItWorksSection
        heading={content.howItWorks}
        frames={[1, 2, 3, 4].map((n) => image(`trading.how-it-works.stage-${n}`))}
      />
      <MarketsPreviewSection instruments={instruments} locale={locale} />
      <WhySection heading={content.why} image={image("section.why-us")} locale={locale} />
      <FaqPreviewSection faqs={faqs} />
      <AcceptedPaymentsSection />
      <RegistrationCtaSection
        copy={content.cta}
        backgroundSrc={image("section.account-tiers").src}
      />
    </>
  );
}
