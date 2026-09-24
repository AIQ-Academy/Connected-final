"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useRef, useState, type ReactNode } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { A11y, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import {
  HeroCalculator,
  headlineFundingTiers,
  type HeroTierOption,
} from "@/components/sections/hero/calculator";
import {
  heroCta,
  heroSlides,
  type HeroSlide,
  type HeroStat,
} from "@/components/sections/hero/copy";
import { HeroFilm } from "@/components/sections/hero/film-backdrop";
import {
  CINEMA_EASE,
  DEPART_EASE,
  StageItem,
  StageLine,
  itemMotion,
  landingMotion,
  screenMotion,
} from "@/components/sections/hero/parts";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { fundedHeroClip } from "@/lib/media";
import { cn, formatCompactCurrency, formatCurrency } from "@/lib/utils";

import "swiper/css";

const COUNT = heroSlides.length;
const EASE = [0.16, 1, 0.3, 1] as const;
const SPEED_MS = 1050;

const outlineOnDark =
  "border-white/70 bg-transparent text-white hover:border-white hover:bg-white/10 hover:text-white";
const primaryOnDark =
  "w-full border-0 bg-brand text-white shadow-none hover:bg-brand-light sm:w-auto";

// The hero previously hijacked vertical scroll while pinned; v1 keeps the hero
// cinematic without blocking the user's normal page scroll.

/**
 * Home hero as a Swiper stage: commission → funding types → calculator.
 * Swiper owns locking, edge release, and touch; chrome syncs to activeIndex.
 * Horizontal navigation only runs while the hero fills the viewport — otherwise
 * we snap to its top (or ignore the gesture) so page scroll stays normal.
 *
 * `data-hero-stage` is the hook the site header watches to decide how long it
 * stays transparent.
 */
export function HeroScrollStage({ tiers }: { tiers: HeroTierOption[] }) {
  const reduced = useReducedMotion();
  const pinned = !reduced;

  const sectionRef = useRef<HTMLElement>(null);
  const swiperRef = useRef<SwiperInstance | null>(null);
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [navigated, setNavigated] = useState(false);
  const fundingTiers = headlineFundingTiers(tiers);

  const goTo = useCallback((index: number) => {
    swiperRef.current?.slideTo(index);
  }, []);

  const step = useCallback((delta: 1 | -1) => {
    const swiper = swiperRef.current;
    if (!swiper) return;
    if (delta > 0) swiper.slideNext();
    else swiper.slidePrev();
  }, []);

  if (!pinned) {
    return (
      <section
        data-hero-stage=""
        aria-label="Trade our capital, keep up to 90%"
        className="relative isolate overflow-hidden bg-[#06070e]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <HeroFilm clip={fundedHeroClip} />
        </div>
        <Scrim />
        <div className="relative flex flex-col">
          {heroSlides.map((slide, index) => (
            <HeroScreen
              key={slide.id}
              slide={slide}
              index={index}
              active={index}
              dir={1}
              pinned={false}
              tiers={tiers}
              fundingTiers={fundingTiers}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      data-hero-stage=""
      aria-label="Trade our capital, keep up to 90%"
      className="relative isolate h-svh overflow-hidden bg-[#06070e]"
    >
      {/* Shallow parallax against the Swiper travel. */}
      <motion.div
        aria-hidden="true"
        animate={{ x: `${-active * 1.25}%` }}
        transition={{ duration: SPEED_MS / 1000, ease: CINEMA_EASE }}
        className="pointer-events-none absolute inset-0"
      >
        <HeroFilm clip={fundedHeroClip} active={active} />
      </motion.div>
      <Scrim />

      <Swiper
        className="hero-swiper h-full w-full"
        modules={[Keyboard, A11y]}
        slidesPerView={1}
        speed={SPEED_MS}
        resistanceRatio={0.55}
        threshold={8}
        noSwipingClass="swiper-no-swiping"
        allowTouchMove
        keyboard={{ enabled: true, onlyInViewport: true }}
        a11y={{ enabled: true }}
        onSwiper={(swiper: SwiperInstance) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper: SwiperInstance) => {
          setDir(swiper.activeIndex >= swiper.previousIndex ? 1 : -1);
          setActive(swiper.activeIndex);
          setNavigated(true);
        }}
      >
        {heroSlides.map((slide, index) => (
          <SwiperSlide key={slide.id} className="!h-full">
            <HeroScreen
              key={slide.id}
              slide={slide}
              index={index}
              active={active}
              dir={dir}
              pinned
              landing={index === 0 && !navigated}
              tiers={tiers}
              fundingTiers={fundingTiers}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
        <Container className="pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-8">
          <div className="flex items-center justify-between gap-4 sm:gap-6">
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

            <div className="pointer-events-auto ml-auto flex items-center gap-4 sm:gap-5">
              <div className="flex items-center gap-2">
                <StageArrow
                  label="Previous screen"
                  disabled={active === 0}
                  onClick={() => step(-1)}
                >
                  <ChevronLeft className="size-4" />
                </StageArrow>
                <StageArrow
                  label="Next screen"
                  disabled={active === COUNT - 1}
                  onClick={() => step(1)}
                >
                  <ChevronRight className="size-4" />
                </StageArrow>
              </div>

              <span aria-hidden="true" className="h-3.5 w-px bg-white/20" />

              <div className="flex items-center gap-4 sm:gap-5">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => goTo(index)}
                    aria-label={`Go to screen ${index + 1}`}
                    aria-current={active === index}
                    className="group relative rounded-sm py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  >
                    <span
                      className={cn(
                        "tabular font-mono text-[0.6875rem] tracking-[0.12em] transition-colors duration-300",
                        active === index
                          ? "text-white"
                          : "text-white/40 group-hover:text-white/75",
                      )}
                    >
                      {slide.index}
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-x-0 bottom-0 h-px origin-left bg-white transition-transform duration-500 ease-out",
                        active === index ? "scale-x-100" : "scale-x-0",
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Container>

        <div className="relative h-px w-full bg-white/15">
          <motion.div
            animate={{ scaleX: COUNT > 1 ? active / (COUNT - 1) : 1 }}
            transition={{ duration: SPEED_MS / 1000, ease: EASE }}
            className="absolute inset-0 origin-left bg-white"
          />
        </div>
      </div>
    </section>
  );
}

/**
 * Edge arrows for pointer users. They route through `ensureEngaged` like the
 * numeric indicators, so clicking one on a half-scrolled hero snaps it
 * fullscreen first rather than sliding behind the fold.
 */
function StageArrow({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid size-11 place-items-center rounded-full border border-white/25 text-white/80 transition-colors duration-200 outline-none hover:border-white/50 hover:bg-white/10 hover:text-white focus-visible:border-white focus-visible:ring-2 focus-visible:ring-white/60 disabled:pointer-events-none disabled:border-white/8 disabled:text-white/20 sm:size-9"
    >
      {children}
    </button>
  );
}

/** Phone gets a bottom-weighted vignette so copy reads; desktop balances ambient radiance and readability. */
function Scrim() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      {/* 1. Deep Sapphire / Indigo ambient brand radiance */}
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

      {/* 3. Desktop Directional Scrim */}
      <div className="hidden sm:block absolute inset-0 bg-[linear-gradient(to_right,rgb(4_6_13/0.88)_0%,rgb(4_6_13/0.72)_30%,rgb(4_6_13/0.38)_55%,rgb(4_6_13/0.12)_75%,rgb(4_6_13/0.22)_100%)]" />

      {/* 4. Mobile Scrim */}
      <div className="sm:hidden absolute inset-0 bg-[linear-gradient(to_bottom,rgb(4_6_13/0.82)_0%,rgb(4_6_13/0.45)_24%,rgb(4_6_13/0.3)_50%,rgb(4_6_13/0.92)_100%)]" />

      {/* 5. Top and Bottom Feathers */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#04060d]/90 via-[#04060d]/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#06070e] via-[#06070e]/85 to-transparent" />

      {/* 6. Full-Frame Depth Vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_140px_rgb(4_6_13/0.65)]" />
    </div>
  );
}

function HeroScreen({
  slide,
  index,
  active,
  dir,
  pinned,
  landing = false,
  tiers,
  fundingTiers,
}: {
  slide: HeroSlide;
  index: number;
  active: number;
  dir: 1 | -1;
  pinned: boolean;
  /** First reveal of the stage — rises into place instead of sliding in. */
  landing?: boolean;
  tiers: HeroTierOption[];
  fundingTiers: HeroTierOption[];
}) {
  const isActive = !pinned || active === index;
  const driftX = dir > 0 ? -90 : 90;

  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden pt-[4.5rem] pb-[4.75rem] sm:items-center sm:justify-center sm:py-28 lg:py-32",
        pinned ? "w-full" : "min-h-svh w-full",
      )}
      aria-hidden={pinned ? !isActive : undefined}
    >
      <motion.span
        aria-hidden="true"
        initial={false}
        animate={{
          opacity: isActive ? 1 : 0,
          x: isActive ? 0 : driftX,
          scale: isActive ? 1 : 1.05,
        }}
        transition={{
          duration: isActive ? SPEED_MS / 1000 : 0.5,
          ease: isActive ? CINEMA_EASE : DEPART_EASE,
          delay: isActive ? 0.06 : 0,
        }}
        className="pointer-events-none absolute -right-[3vw] -bottom-[4vh] hidden font-display text-[54vh] leading-none font-bold text-white/[0.05] select-none sm:block"
      >
        {slide.index}
      </motion.span>

      <Container className="relative flex min-h-0 w-full flex-1 flex-col sm:block sm:flex-none lg:px-12 xl:px-16">
        {pinned ? (
          <AnimatePresence mode="popLayout" custom={dir}>
            {isActive && (
              <motion.div
                key={slide.id}
                custom={dir}
                variants={landing ? landingMotion : screenMotion}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex h-full min-h-0 flex-col sm:block sm:h-auto"
              >
                <ScreenContent
                  slide={slide}
                  index={index}
                  tiers={tiers}
                  fundingTiers={fundingTiers}
                />
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          // Reduced motion: the same variant tree, resolved straight to rest.
          <motion.div variants={screenMotion} initial={false} animate="center">
            <ScreenContent
              slide={slide}
              index={index}
              tiers={tiers}
              fundingTiers={fundingTiers}
            />
          </motion.div>
        )}
      </Container>
    </div>
  );
}

function ScreenContent({
  slide,
  index,
  tiers,
  fundingTiers,
}: {
  slide: HeroSlide;
  index: number;
  tiers: HeroTierOption[];
  fundingTiers: HeroTierOption[];
}) {
  if (index === 0) return <CommissionScreen slide={slide} />;
  if (index === 1)
    return <FundingTypesScreen slide={slide} tiers={fundingTiers} />;
  return <CalculatorScreen slide={slide} tiers={tiers} />;
}

/* ── Screen 01 — 0% commission ─────────────────────────────────────────── */

function CommissionScreen({ slide }: { slide: HeroSlide }) {
  return (
    <div className="relative flex h-full min-h-0 flex-col text-white sm:block sm:h-auto sm:max-w-xl">
      <div>
        <StageItem className="sm:hidden">
          <span className="inline-flex items-center gap-2.5 font-mono text-[0.625rem] tracking-[0.18em] text-white/75 uppercase">
            <span className="relative grid size-2 place-items-center">
              <span className="bg-mint absolute inset-0 animate-ping rounded-full opacity-60" />
              <span className="bg-mint relative size-1.5 rounded-full" />
            </span>
            {slide.eyebrow}
          </span>
        </StageItem>

        <h1 className="text-hero mt-3 text-white sm:mt-7">
          <StageLine>{slide.title[0]}</StageLine>
          <StageLine className="mt-2.5">{slide.title[1]}</StageLine>
        </h1>

        <StageItem className="mt-6 hidden max-w-md sm:block">
          <p className="text-hero-lead text-white">{slide.lead}</p>
        </StageItem>
      </div>

      <div className="mt-auto pt-8 sm:mt-10 sm:pt-0">
        {slide.stats && (
          <StageItem className="max-w-md">
            <StatRow stats={slide.stats} />
          </StageItem>
        )}

        <StageItem className="mt-5 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4">
          <ButtonLink
            href={heroCta.primary.href}
            size="lg"
            className={cn(primaryOnDark, "btn-glow")}
          >
            {heroCta.primary.label}
            <ArrowRight />
          </ButtonLink>
          <ButtonLink
            href={heroCta.secondary.href}
            variant="outline"
            size="lg"
            className={cn(outlineOnDark, "hidden shadow-none sm:inline-flex")}
          >
            {heroCta.secondary.label}
          </ButtonLink>
        </StageItem>
      </div>
    </div>
  );
}

/* ── Screen 02 — three funding types ───────────────────────────────────── */

function FundingTypesScreen({
  slide,
  tiers,
}: {
  slide: HeroSlide;
  tiers: HeroTierOption[];
}) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-5 text-white sm:grid sm:h-auto sm:items-center sm:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-16 xl:gap-24">
      <div className="max-w-lg shrink-0">
        <h2 className="font-display text-[1.85rem] leading-[1.12] font-semibold tracking-[-0.03em] text-white sm:text-hero sm:mt-7">
          <StageLine>{slide.title[0]}</StageLine>
          <StageLine className="mt-1.5 sm:mt-2.5">{slide.title[1]}</StageLine>
        </h2>

        <StageItem className="mt-6 hidden max-w-md sm:block">
          <p className="text-hero-lead text-white">{slide.lead}</p>
        </StageItem>

        <StageItem className="mt-10 hidden sm:flex sm:flex-row sm:gap-4">
          <ButtonLink
            href={heroCta.primary.href}
            size="lg"
            className={primaryOnDark}
          >
            {heroCta.primary.label}
            <ArrowRight />
          </ButtonLink>
          <ButtonLink
            href="/accounts"
            variant="outline"
            size="lg"
            className={cn(outlineOnDark, "shadow-none")}
          >
            View all tiers
          </ButtonLink>
        </StageItem>
      </div>

      <ul className="flex min-h-0 flex-1 flex-col justify-center gap-2.5 sm:grid sm:flex-none sm:grid-cols-3 sm:gap-3 lg:grid-cols-1">
        {tiers.map((tier) => (
          <TierCard key={tier.code} tier={tier} />
        ))}
      </ul>

      <StageItem className="shrink-0 sm:hidden">
        <ButtonLink
          href={heroCta.primary.href}
          size="lg"
          className={cn(primaryOnDark, "btn-glow")}
        >
          {heroCta.primary.label}
          <ArrowRight />
        </ButtonLink>
      </StageItem>
    </div>
  );
}

function TierCard({ tier }: { tier: HeroTierOption }) {
  return (
    <motion.li
      variants={itemMotion}
      className={cn(
        "relative overflow-hidden rounded-2xl border transition-colors duration-300",
        "flex items-center gap-4 px-4 py-3.5 sm:block sm:rounded-xl sm:p-5",
        tier.isFeatured
          ? "border-white/50 bg-white/[0.14] shadow-[0_12px_40px_-20px_rgb(var(--cf-brand-glow)/0.9)]"
          : "border-white/28 bg-white/[0.08] hover:border-white/40 hover:bg-white/[0.09]",
      )}
    >
      {tier.isFeatured && (
        <span
          aria-hidden="true"
          className="absolute inset-y-3 left-0 w-px bg-white/90 sm:inset-y-4"
        />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[0.625rem] tracking-[0.16em] text-white/80 uppercase sm:tracking-[0.2em]">
            {tier.name}
          </span>
          {tier.isFeatured && (
            <span className="rounded-full border border-white/40 px-2 py-[3px] font-mono text-[0.5625rem] leading-none tracking-[0.16em] text-white/90 uppercase">
              Most chosen
            </span>
          )}
        </div>
        <p className="mt-1 font-mono text-[0.625rem] text-white/65 sm:hidden">
          {tier.profitSplitPct}% split · 0% commission
        </p>
      </div>

      <div className="shrink-0 text-right sm:mt-3.5 sm:flex sm:items-baseline sm:justify-between sm:text-left">
        <span className="tabular font-display block text-[1.65rem] leading-none font-semibold text-white sm:text-2xl">
          {formatCompactCurrency(tier.accountSize)}
        </span>
        <span className="tabular mt-1 block font-mono text-[0.6875rem] text-white/75">
          {formatCurrency(tier.price, { decimals: 0 })}
        </span>
      </div>

      <div className="mt-3.5 hidden items-center gap-2.5 border-t border-white/22 pt-3 font-mono text-[0.5625rem] tracking-[0.16em] text-white/70 uppercase sm:flex">
        <span className="tabular">{tier.profitSplitPct}% split</span>
        <span aria-hidden="true" className="h-px w-3 bg-white/40" />
        <span className="tabular">0% commission</span>
      </div>
    </motion.li>
  );
}

/* ── Screen 03 — calculator ────────────────────────────────────────────── */

function CalculatorScreen({
  slide,
  tiers,
}: {
  slide: HeroSlide;
  tiers: HeroTierOption[];
}) {
  return (
    <div className="flex h-full min-h-0 flex-col justify-center gap-5 text-white sm:grid sm:h-auto sm:items-center sm:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-16 xl:gap-24">
      <div className="max-w-lg max-lg:hidden">
        <h2 className="text-hero mt-7 text-white">
          <StageLine>{slide.title[0]}</StageLine>
          <StageLine className="mt-2.5">{slide.title[1]}</StageLine>
        </h2>

        <StageItem className="mt-6 max-w-md">
          <p className="text-hero-lead text-white">{slide.lead}</p>
        </StageItem>

        <StageItem className="mt-10 max-w-md border-t border-white/12 pt-6">
          <ButtonLink
            href={heroCta.secondary.href}
            size="lg"
            className={cn(outlineOnDark, "shadow-none border-white-40")}
          >
            {heroCta.secondary.label}
            <ArrowRight />
          </ButtonLink>
        </StageItem>
      </div>

      <StageItem className="w-full lg:justify-self-end">
        <p className="mb-3 font-mono text-[0.625rem] tracking-[0.2em] text-white/75 uppercase lg:hidden">
          {slide.eyebrow}
        </p>
        <HeroCalculator tiers={tiers} />
      </StageItem>
    </div>
  );
}

/* ── Shared bits ───────────────────────────────────────────────────────── */

/** Figures over a hairline, label under value, so the numbers lead. */
function StatRow({ stats }: { stats: readonly HeroStat[] }) {
  return (
    <dl className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-x-7 sm:gap-y-6 sm:border-t sm:border-white/15 sm:pt-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col-reverse rounded-2xl border border-white/20 bg-white/[0.1] px-3 py-3.5 sm:min-w-[7rem] sm:rounded-none sm:border-0 sm:border-l sm:border-white/12 sm:bg-transparent sm:px-0 sm:py-0 sm:pl-7 sm:first:border-l-0 sm:first:pl-0"
        >
          <dt className="mt-1.5 font-mono text-[0.5625rem] tracking-[0.12em] text-white/60 uppercase sm:mt-2.5 sm:tracking-[0.18em] sm:text-white/50">
            {stat.label}
          </dt>
          <dd className="tabular font-display text-xl leading-none font-semibold text-white sm:text-2xl">
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
