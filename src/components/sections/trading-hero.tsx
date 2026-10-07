import { ArrowRight } from "lucide-react";
import Image from "next/image";

import { Reveal } from "@/components/motion/reveal";
import { MarketStatus } from "@/components/sections/hero/market-status";
import { Aurora, GridBackdrop } from "@/components/ui/aurora";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  brokerHeroCta,
  brokerHeroSlides,
} from "@/lib/landing/broker";
import { marketingImages } from "@/lib/images";

const hero = brokerHeroSlides[0];

/**
 * Live-trading landing hero. Same light branded surface as the market
 * terminal — `bg-noise`, medium Aurora, GridBackdrop — with the photograph
 * in a contained panel rather than a navy full-bleed plate.
 */
export function TradingHero() {
  const panel = marketingImages.heroTrading;

  return (
    <section className="bg-noise relative overflow-hidden pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24">
      <Aurora intensity="medium" />
      <GridBackdrop />
      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
          <div>
            <Reveal
              direction="none"
              className="flex flex-wrap items-center gap-3"
            >
              <span className="eyebrow">
                <span className="chev" />
                {hero.eyebrow}
              </span>
              <MarketStatus />
            </Reveal>

            <Reveal delay={0.06}>
              <h1 className="text-h1 mt-5 max-w-2xl">
                <span className="block">{hero.title[0]}</span>
                <span className="block">{hero.title[1]}</span>
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="text-lead text-muted mt-5 max-w-xl">{hero.lead}</p>
            </Reveal>

            <Reveal
              delay={0.18}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
            >
              <ButtonLink href={brokerHeroCta.primary.href} size="lg">
                {brokerHeroCta.primary.label}
                <ArrowRight />
              </ButtonLink>
              <ButtonLink
                href={brokerHeroCta.secondary.href}
                variant="soft"
                size="lg"
              >
                {brokerHeroCta.secondary.label}
              </ButtonLink>
            </Reveal>

            {hero.stats ? (
              <Reveal delay={0.24}>
                <dl className="border-line-soft mt-10 grid grid-cols-3 gap-x-6 border-t pt-7 sm:gap-x-10">
                  {hero.stats.map((stat) => (
                    <div key={stat.label} className="flex flex-col-reverse">
                      <dt className="text-faint mt-1.5 font-mono text-[0.625rem] leading-tight tracking-[0.14em] uppercase sm:text-[0.6875rem]">
                        {stat.label}
                      </dt>
                      <dd className="text-ink font-display tabular text-2xl leading-none font-semibold sm:text-3xl">
                        {stat.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            ) : null}
          </div>

          <Reveal delay={0.1} direction="left">
            <div className="border-line-soft relative min-h-[20rem] overflow-hidden rounded-3xl border sm:min-h-[26rem] lg:min-h-[30rem]">
              <Image
                src={panel.src}
                alt={panel.alt}
                fill
                priority
                sizes="(min-width: 1024px) 46vw, 100vw"
                className="object-cover object-[center_42%]"
              />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
