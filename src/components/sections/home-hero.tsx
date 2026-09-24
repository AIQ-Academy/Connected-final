"use client";

import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import { HeroFilm } from "@/components/sections/hero/film-backdrop";
import {
  StageItem,
  StageLine,
  landingMotion,
  screenMotion,
} from "@/components/sections/hero/parts";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useIntroStage } from "@/lib/home-intro";
import type { HomeHeroContent } from "@/lib/cms/schemas";
import { homeHero as heroDefaults } from "@/lib/landing/home";
import { cn } from "@/lib/utils";

const outlineOnDark =
  "border-white/70 bg-transparent text-white hover:border-white hover:bg-white/10 hover:text-white";
const primaryOnDark =
  "w-full border-0 bg-brand text-white shadow-none hover:bg-brand-light sm:w-auto";

/**
 * Flagship homepage hero. The copy holds until the intro clip has been taken
 * down, then arrives on its own; the film sits at its resting frame throughout.
 * `data-hero-stage` keeps the header transparent while this section covers the
 * bar.
 */
export function HomeHero({
  content,
  marketStrip,
}: {
  content?: HomeHeroContent;
  marketStrip?: ReactNode;
} = {}) {
  const homeHero = { ...heroDefaults, ...content };
  const reduced = useReducedMotion();
  const contentIn = useIntroStage(true) === "settled";

  if (reduced) {
    return (
      <section
        data-hero-stage=""
        aria-label={homeHero.title.join(" ")}
        className="relative isolate overflow-hidden bg-[#06070e]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <HeroFilm />
        </div>
        <Scrim />
        <div className="relative flex min-h-svh flex-col justify-center pt-[4.5rem] pb-16 sm:py-28">
          <HomeHeroCopy ready content={content} />
        </div>
        {marketStrip}
      </section>
    );
  }

  return (
    <section
      data-hero-stage=""
      aria-label={homeHero.title.join(" ")}
      className="relative isolate h-svh overflow-hidden bg-[#06070e]"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <HeroFilm />
      </div>

      <div className="relative flex h-full flex-col justify-center pt-[4.5rem] pb-[4.75rem] sm:items-center sm:py-28 lg:py-32">
        <HomeHeroCopy ready={contentIn} landing content={content} />
      </div>

      {marketStrip && (
        <div className="absolute inset-x-0 bottom-0 z-20">{marketStrip}</div>
      )}

      {/* <motion.div
        initial={false}
        animate={{ opacity: contentIn ? 1 : 0, y: contentIn ? 0 : 20 }}
        transition={{
          duration: 0.8,
          delay: contentIn ? 0.3 : 0,
          ease: CINEMA_EASE,
        }}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
      >
        <Container className="pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-8">
          <span className="hidden items-center gap-2.5 font-mono text-[0.625rem] tracking-[0.16em] text-white/70 uppercase sm:flex">
            <motion.span
              aria-hidden="true"
              animate={{ x: [0, 5, 0] }}
              transition={{
                duration: 1.7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <ArrowRight className="size-3.5" />
            </motion.span>
            Scroll to explore
          </span>
        </Container>
        <div className="h-px w-full bg-white/15" />
      </motion.div> */}
    </section>
  );
}

function Scrim() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      {/* 1. Deep Sapphire / Indigo ambient brand radiance behind typography */}
      <div
        className="absolute -top-[12%] -left-[10%] h-[80%] w-[70%] rounded-full opacity-40 blur-[130px] sm:opacity-50"
        style={{
          background:
            "radial-gradient(ellipse at center, rgb(74 99 196 / 0.5) 0%, rgb(51 75 161 / 0.2) 50%, transparent 80%)",
        }}
      />

      {/* 2. Sunrise Warm Golden Bloom accentuating the skyscraper horizon */}
      <div
        className="absolute top-[12%] right-[2%] h-[65%] w-[55%] rounded-full opacity-30 blur-[110px] sm:opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at center, rgb(242 184 75 / 0.38) 0%, rgb(242 184 75 / 0.12) 48%, transparent 75%)",
        }}
      />

      {/* 3. Subtle Mint Ambient Glow near the bottom stat area */}
      <div
        className="absolute -bottom-[10%] left-[20%] h-[45%] w-[45%] rounded-full opacity-20 blur-[100px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgb(43 217 168 / 0.25) 0%, transparent 70%)",
        }}
      />

      {/* 4. Desktop Directional Scrim (left-to-right protection for typography, clear view for right-side skyscraper) */}
      <div className="hidden sm:block absolute inset-0 bg-[linear-gradient(to_right,rgb(4_6_13/0.88)_0%,rgb(4_6_13/0.72)_30%,rgb(4_6_13/0.38)_55%,rgb(4_6_13/0.12)_75%,rgb(4_6_13/0.22)_100%)]" />

      {/* 5. Mobile Scrim (top-to-bottom for full-screen legibility) */}
      <div className="sm:hidden absolute inset-0 bg-[linear-gradient(to_bottom,rgb(4_6_13/0.82)_0%,rgb(4_6_13/0.45)_24%,rgb(4_6_13/0.3)_50%,rgb(4_6_13/0.92)_100%)]" />

      {/* 6. Top Header Integration Fade */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#04060d]/90 via-[#04060d]/40 to-transparent" />

      {/* 7. Bottom Section Seamless Fade */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#06070e] via-[#06070e]/85 to-transparent" />

      {/* 8. Full-Frame Depth Vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_140px_rgb(4_6_13/0.65)]" />
    </div>
  );
}

function HomeHeroCopy({
  ready,
  landing = false,
  content,
}: {
  ready: boolean;
  landing?: boolean;
  content?: HomeHeroContent;
}) {
  const homeHero = { ...heroDefaults, ...content };

  return (
    <Container className="relative flex min-h-0 w-full flex-1 flex-col justify-center sm:block sm:flex-none lg:px-12 xl:px-16">
      {/* Hug content on a phone so the film isn't an empty glass column; desktop keeps the airy kinetic stack. */}
      <motion.div
        data-hero-card=""
        variants={landing ? landingMotion : screenMotion}
        initial={false}
        animate={ready ? "center" : "enter"}
        className="flex h-auto w-full flex-none flex-col rounded-[2rem] border border-white/16 bg-[#07101f]/55 p-5 text-white shadow-[0_20px_60px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl sm:block sm:max-w-2xl sm:border-white/12 sm:bg-[#07101f]/20 sm:p-8 sm:shadow-[0_20px_60px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.06)] sm:backdrop-blur-xl"
      >
        <h1 className="text-hero text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.7)] sm:mt-5">
          <StageLine>{homeHero.title[0]}</StageLine>
          <StageLine className="mt-2.5">{homeHero.title[1]}</StageLine>
        </h1>

        <StageItem className="mt-6 hidden max-w-xl sm:block">
          <p className="text-hero-lead font-normal text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
            {homeHero.lead}
          </p>
        </StageItem>

        <div className="mt-4 sm:mt-10">
          <StageItem className="max-w-lg">
            <dl className="grid grid-cols-3 border-t border-white/22 pt-4 sm:flex sm:flex-wrap sm:gap-x-7 sm:gap-y-6 sm:border-white/15 sm:pt-6">
              {homeHero.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col-reverse px-2.5 text-center not-first:border-l not-first:border-white/20 sm:min-w-[7.5rem] sm:px-0 sm:text-left sm:not-first:border-white/15 sm:pl-7 sm:first:border-l-0 sm:first:pl-0"
                >
                  <dt className="mt-1.5 font-mono text-[0.625rem] leading-tight tracking-[0.08em] text-white/80 uppercase sm:mt-2.5 sm:tracking-[0.18em] sm:text-white/55">
                    {stat.label}
                  </dt>
                  <dd className="tabular font-display text-[1.375rem] leading-none font-semibold text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.55)] sm:text-2xl sm:drop-shadow-sm">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </StageItem>

          <StageItem className="mt-5 flex flex-col gap-2.5 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
            <ButtonLink
              href={homeHero.primary.href}
              size="lg"
              className={cn(
                primaryOnDark,
                "btn-glow shadow-[0_0_24px_rgba(74,99,196,0.45)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_32px_rgba(74,99,196,0.65)]",
              )}
            >
              {homeHero.primary.label}
              <ArrowRight />
            </ButtonLink>
            <ButtonLink
              href={homeHero.secondary.href}
              variant="outline"
              size="lg"
              className={cn(
                outlineOnDark,
                "hidden bg-white/[0.04] shadow-none backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-white hover:bg-white/[0.14] sm:inline-flex",
              )}
            >
              {homeHero.secondary.label}
            </ButtonLink>
            <ButtonLink
              href={homeHero.tertiary.href}
              variant="outline"
              size="lg"
              className={cn(
                outlineOnDark,
                "hidden bg-white/[0.04] shadow-none backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-white hover:bg-white/[0.14] sm:inline-flex",
              )}
            >
              {homeHero.tertiary.label}
            </ButtonLink>
            <div className="grid grid-cols-2 gap-2 sm:hidden">
              <ButtonLink
                href={homeHero.secondary.href}
                variant="outline"
                size="sm"
                aria-label={homeHero.secondary.label}
                className={cn(
                  outlineOnDark,
                  "min-w-0 bg-white/[0.06] px-3 shadow-none backdrop-blur-md",
                )}
              >
                Live trading
              </ButtonLink>
              <ButtonLink
                href={homeHero.tertiary.href}
                variant="outline"
                size="sm"
                className={cn(
                  outlineOnDark,
                  "min-w-0 bg-white/[0.06] px-3 shadow-none backdrop-blur-md",
                )}
              >
                {homeHero.tertiary.label}
              </ButtonLink>
            </div>
          </StageItem>
        </div>
      </motion.div>
    </Container>
  );
}
