import type { Metadata } from "next";

import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/json-ld";
import { BrokerAccountTypesSection } from "@/components/sections/broker-account-types";
import { AcceptedPaymentsSection } from "@/components/sections/accepted-payments";
import { FaqPreviewSection } from "@/components/sections/faq-preview";
import { TradingHero } from "@/components/sections/trading-hero";
import { HowItWorksSection } from "@/components/sections/how-it-works";
import { MarketsPreviewSection } from "@/components/sections/markets-preview";
import { RegistrationCtaSection } from "@/components/sections/registration-cta";
import { TestimonialsSection } from "@/components/sections/testimonials";
import { TickerTapeSection } from "@/components/sections/ticker-tape";
import { WhySection } from "@/components/sections/why-connect-funded";
import { getInstruments, getTestimonials } from "@/db/queries";
import { getContent } from "@/lib/cms/get-content";
import { createMediaResolver } from "@/lib/cms/media";
import { testimonialPortraitMap } from "@/lib/cms/portraits";
import { fundingFaqs } from "@/lib/funding-faq";
import { guardProduct } from "@/lib/product-guard";

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getContent("trading");
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: "/trading" },
  };
}

/** Quotes in the tape go stale quickly; everything else is effectively static. */
export const revalidate = 60;

export default async function TradingLandingPage() {
  await guardProduct("broker");

  const [instruments, testimonials, content, image] = await Promise.all([
    getInstruments(),
    getTestimonials(),
    getContent("trading"),
    createMediaResolver(),
  ]);

  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />

      <TradingHero />
      <TickerTapeSection />
      <BrokerAccountTypesSection heading={content.accountTypes} />
      <HowItWorksSection
        variant="broker"
        heading={content.howItWorks}
        frames={[1, 2, 3, 4].map((n) => image(`trading.how-it-works.stage-${n}`))}
      />
      <MarketsPreviewSection instruments={instruments} />
      <WhySection
        variant="broker"
        heading={content.why}
        image={image("section.why-us")}
      />
      <TestimonialsSection
        testimonials={testimonials}
        heading={content.testimonials}
        portraits={testimonialPortraitMap(testimonials, image)}
      />
      <FaqPreviewSection faqs={fundingFaqs} />
      <AcceptedPaymentsSection />
      <RegistrationCtaSection variant="broker" copy={content.cta} />
    </>
  );
}
