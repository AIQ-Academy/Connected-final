import type { Metadata } from "next";

import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/json-ld";
import { HomeAboutSection } from "@/components/sections/home-about";
import { HomeContactSection } from "@/components/sections/home-contact";
import { HomeHero } from "@/components/sections/home-hero";
import { HomeLandingIntro } from "@/components/sections/home-landing-intro";
import { HomeTradingSection } from "@/components/sections/home-trading";
import { TickerTapeSection } from "@/components/sections/ticker-tape";
import { getContent } from "@/lib/cms/get-content";
import { createMediaResolver } from "@/lib/cms/media";

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getContent("home");
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: "/" },
  };
}

export const revalidate = 60;

export default async function HomePage() {
  const [content, image] = await Promise.all([
    getContent("home"),
    createMediaResolver(),
  ]);

  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <HomeLandingIntro />
      <HomeHero content={content.hero} />
      <TickerTapeSection />
      <HomeTradingSection
        content={content.trading}
        image={image("home.trading")}
      />
      <HomeAboutSection content={content.about} image={image("home.about")} />
      <HomeContactSection content={content.contact} />
    </>
  );
}
