"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useCallback, useRef, useState, type ReactNode } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { A11y, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import type { HeroSlide } from "@/components/sections/hero/copy";
import {
  CINEMA_EASE,
  StageItem,
  StageLine,
  itemMotion,
  screenMotion,
} from "@/components/sections/hero/parts";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  brokerAccountTiers,
  brokerHeroCta,
  brokerHeroSlides,
  brokerTierMetaLine,
} from "@/lib/landing/broker";
import { marketingImages } from "@/lib/images";
import { cn, formatCompactCurrency, formatCurrency } from "@/lib/utils";

import "swiper/css";

const slides = brokerHeroSlides;
const COUNT = slides.length;
const SPEED_MS = 1050;

const outlineOnDark =
  "border-white/70 bg-transparent text-white hover:border-white hover:bg-white/10 hover:text-white";
const primaryOnDark =
  "w-full border-0 bg-brand text-white shadow-none hover:bg-brand-light sm:w-auto";

/**
 * Type sits over a photograph, so the shadow keeps edges off any bright detail.
 * Written into the class strings rather than merged in: `cn` resolves these
 * against the `text-hero` sizing utilities and would drop them.
 */

/**
 * Full-bleed editorial photograph behind the stage.
 *
 * The frame is a dense candlestick chart, so darkening alone left bright wicks
 * and price labels running through the headline. The copy side is blurred out of
 * competing range as well as dimmed, and the scrim only thins past the text
 * column so the desk still reads on the right.
 *
 * The parallax wrapper slides this layer left as the deck advances, so it
 * over-scans 3% either side to stay full-bleed on the last screen.
 */
function HeroBackdrop() {
  const { src } = marketingImages.heroTrading;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -inset-x-[3%] inset-y-0 isolate overflow-hidden"
    >
      <Image
        src={src}
        alt=""
        fill
        priority
        sizes="100vw"
        quality={85}
        className="object-cover object-[center_42%] brightness-[0.85] contrast-[1.02] saturate-[1.02]"
      />

      {/* Same source and transform as the layer above, so this is a second paint
          rather than a second download. */}
      <Image
        src={src}
        alt=""
        fill
        sizes="100vw"
        quality={85}
        className="scale-110 object-cover object-[center_42%] blur-[20px] brightness-[0.8] [mask-image:linear-gradient(to_bottom,black_0%,black_56%,transparent_88%)] sm:[mask-image:linear-gradient(to_right,black_0%,black_42%,transparent_76%)]"
      />

      <div className="absolute inset-0 hidden bg-[linear-gradient(to_right,rgb(4_6_13/0.8)_0%,rgb(4_6_13/0.7)_32%,rgb(4_6_13/0.48)_56%,rgb(4_6_13/0.3)_78%,rgb(4_6_13/0.42)_100%)] sm:block" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(4_6_13/0.82)_0%,rgb(4_6_13/0.58)_32%,rgb(4_6_13/0.56)_60%,rgb(4_6_13/0.9)_100%)] sm:hidden" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#04060d]/90 via-[#04060d]/45 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#06070e] via-[#06070e]/75 to-transparent" />
      <div className="absolute inset-0 shadow-[inset_0_0_160px_rgb(4_6_13/0.7)]" />
    </div>
  );
}

function StatRow({ stats }: { stats: NonNullable<HeroSlide["stats"]> }) {
  return (
    <dl className="grid grid-cols-3 gap-3 border-t border-white/25 pt-5">
      {stats.map((stat) => (
        <div key={stat.label}>
          <dt className="font-mono text-[0.5625rem] tracking-[0.14em] text-white/75 uppercase drop-shadow-[0_1px_10px_rgb(4_6_13/0.65)]">
            {stat.label}
          </dt>
          <dd className="font-display mt-1 text-xl font-semibold text-white drop-shadow-[0_2px_18px_rgb(4_6_13/0.7)] sm:text-2xl">
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function BrokerHeroScrollStage() {
  const reduced = useReducedMotion();
  const pinned = !reduced;
  const swiperRef = useRef<SwiperInstance | null>(null);
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);

  const step = useCallback((delta: -1 | 1) => {
    const swiper = swiperRef.current;
    if (!swiper) return;
    if (delta < 0) swiper.slidePrev();
    else swiper.slideNext();
  }, []);

  if (!pinned) {
    return (
      <section
        data-hero-stage=""
        aria-label="Live trading accounts"
        className="relative isolate overflow-hidden bg-[#06070e]"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <HeroBackdrop />
        </div>
        <div className="relative flex flex-col">
          {slides.map((slide, index) => (
            <BrokerScreen
              key={slide.id}
              slide={slide}
              index={index}
              pinned={false}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      data-hero-stage=""
      aria-label="Live trading accounts"
      className="relative isolate h-svh overflow-hidden bg-[#06070e]"
    >
      <motion.div
        aria-hidden
        animate={{ x: `${-active * 1.25}%` }}
        transition={{ duration: SPEED_MS / 1000, ease: CINEMA_EASE }}
        className="pointer-events-none absolute inset-0"
      >
        <HeroBackdrop />
      </motion.div>

      <Swiper
        className="hero-swiper h-full w-full"
        modules={[Keyboard, A11y]}
        slidesPerView={1}
        speed={SPEED_MS}
        keyboard={{ enabled: true, onlyInViewport: true }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => {
          setDir(swiper.activeIndex >= swiper.previousIndex ? 1 : -1);
          setActive(swiper.activeIndex);
        }}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id} className="!h-full">
            <BrokerScreen
              slide={slide}
              index={index}
              active={active}
              dir={dir}
              pinned
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
        <Container className="pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-8">
          <div className="flex items-center justify-end gap-4">
            <div className="pointer-events-auto flex items-center gap-2">
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
            <div className="pointer-events-auto flex items-center gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Go to screen ${index + 1}`}
                  aria-current={index === active ? "step" : undefined}
                  onClick={() => swiperRef.current?.slideTo(index)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    index === active ? "w-8 bg-white" : "w-2 bg-white/35",
                  )}
                />
              ))}
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}

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
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-11 place-items-center rounded-full border border-white/25 text-white/80 transition-colors hover:border-white/50 hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:border-white/8 disabled:text-white/20 sm:size-9"
    >
      {children}
    </button>
  );
}

function BrokerScreen({
  slide,
  index,
  active = 0,
  dir = 1,
  pinned,
}: {
  slide: HeroSlide;
  index: number;
  active?: number;
  dir?: 1 | -1;
  pinned: boolean;
}) {
  const isActive = !pinned || active === index;

  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden pt-[4.5rem] pb-[4.75rem] sm:items-center sm:justify-center sm:py-28 lg:py-32",
        pinned ? "w-full" : "min-h-svh w-full",
      )}
      aria-hidden={pinned ? !isActive : undefined}
    >
      <Container className="relative flex min-h-0 w-full flex-1 flex-col sm:block sm:flex-none lg:px-12 xl:px-16">
        {pinned ? (
          <AnimatePresence mode="popLayout" custom={dir}>
            {isActive && (
              <motion.div
                key={slide.id}
                custom={dir}
                variants={screenMotion}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex h-full min-h-0 flex-col sm:block sm:h-auto"
              >
                <BrokerScreenContent slide={slide} index={index} />
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <BrokerScreenContent slide={slide} index={index} />
        )}
      </Container>
    </div>
  );
}

function BrokerScreenContent({
  slide,
  index,
}: {
  slide: HeroSlide;
  index: number;
}) {
  if (index === 0) return <IntroScreen slide={slide} />;
  if (index === 1) return <AccountTypesScreen slide={slide} />;
  return <FundingScreen slide={slide} />;
}

function IntroScreen({ slide }: { slide: HeroSlide }) {
  return (
    <div className="relative flex h-full min-h-0 flex-col text-white sm:block sm:h-auto sm:max-w-xl">
      <StageItem className="sm:hidden">
        <span className="font-mono text-[0.625rem] tracking-[0.18em] text-white/80 uppercase drop-shadow-[0_1px_10px_rgb(4_6_13/0.65)]">
          {slide.eyebrow}
        </span>
      </StageItem>
      <h1 className="text-hero mt-3 text-white drop-shadow-[0_2px_18px_rgb(4_6_13/0.7)] sm:mt-7">
        <StageLine>{slide.title[0]}</StageLine>
        <StageLine className="mt-2.5">{slide.title[1]}</StageLine>
      </h1>
      <StageItem className="mt-6 hidden max-w-md sm:block">
        <p className="text-hero-lead text-white drop-shadow-[0_1px_10px_rgb(4_6_13/0.65)]">
          {slide.lead}
        </p>
      </StageItem>
      {slide.stats && (
        <StageItem className="mt-auto max-w-md pt-8 sm:mt-10 sm:pt-0">
          <StatRow stats={slide.stats} />
        </StageItem>
      )}
      <StageItem className="mt-5 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4">
        <ButtonLink
          href={brokerHeroCta.primary.href}
          size="lg"
          className={primaryOnDark}
        >
          {brokerHeroCta.primary.label}
          <ArrowRight />
        </ButtonLink>
        <ButtonLink
          href={brokerHeroCta.secondary.href}
          variant="outline"
          size="lg"
          className={cn(outlineOnDark, "hidden shadow-none sm:inline-flex")}
        >
          {brokerHeroCta.secondary.label}
        </ButtonLink>
      </StageItem>
    </div>
  );
}

function AccountTypesScreen({ slide }: { slide: HeroSlide }) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-5 text-white sm:grid sm:h-auto sm:items-center sm:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-16">
      <div className="max-w-lg shrink-0">
        <h2 className="font-display text-[1.85rem] leading-[1.12] font-semibold tracking-[-0.03em] text-white drop-shadow-[0_2px_18px_rgb(4_6_13/0.7)] sm:text-hero sm:mt-7">
          <StageLine>{slide.title[0]}</StageLine>
          <StageLine className="mt-1.5 sm:mt-2.5">{slide.title[1]}</StageLine>
        </h2>
        <StageItem className="mt-6 hidden max-w-md sm:block">
          <p className="text-hero-lead text-white drop-shadow-[0_1px_10px_rgb(4_6_13/0.65)]">
            {slide.lead}
          </p>
        </StageItem>
      </div>
      <ul className="flex min-h-0 flex-1 flex-col justify-center gap-2.5 sm:grid sm:flex-none sm:grid-cols-3 sm:gap-3 lg:grid-cols-1">
        {brokerAccountTiers.map((tier) => {
          const meta = brokerTierMetaLine(tier);
          return (
          <motion.li
            key={tier.code}
            variants={itemMotion}
            className={cn(
              "rounded-2xl border px-4 py-3.5 backdrop-blur-md sm:rounded-xl sm:p-5",
              tier.isFeatured
                ? "border-white/50 bg-[#04060d]/62"
                : "border-white/25 bg-[#04060d]/52",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[0.625rem] tracking-[0.16em] text-white/80 uppercase">
                {tier.name}
              </span>
              {tier.isFeatured && (
                <span className="rounded-full border border-white/40 px-2 py-[3px] font-mono text-[0.5625rem] text-white/90 uppercase">
                  Popular
                </span>
              )}
            </div>
            <p className="font-display mt-2 text-2xl font-semibold text-white">
              {formatCompactCurrency(tier.minDeposit)}
              <span className="ml-2 font-sans text-sm font-normal text-white/75">
                min deposit
              </span>
            </p>
            {meta ? (
              <p className="mt-1 font-mono text-[0.625rem] text-white/75">
                {meta}
              </p>
            ) : null}
          </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

function FundingScreen({ slide }: { slide: HeroSlide }) {
  const rails = [
    { label: "Cards & mobile pay", detail: "Instant" },
    { label: "Bank transfer", detail: "1–2 days" },
    { label: "Crypto & e-wallets", detail: "Same day" },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 text-white sm:grid sm:h-auto sm:items-center sm:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
      <div className="max-w-lg">
        <h2 className="font-display text-[1.85rem] leading-[1.12] font-semibold tracking-[-0.03em] text-white drop-shadow-[0_2px_18px_rgb(4_6_13/0.7)] sm:text-hero">
          <StageLine>{slide.title[0]}</StageLine>
          <StageLine className="mt-1.5 sm:mt-2.5">{slide.title[1]}</StageLine>
        </h2>
        <StageItem className="mt-6 hidden max-w-md sm:block">
          <p className="text-hero-lead text-white drop-shadow-[0_1px_10px_rgb(4_6_13/0.65)]">
            {slide.lead}
          </p>
        </StageItem>
      </div>
      <div className="swiper-no-swiping w-full max-w-md rounded-2xl border border-white/30 bg-[#04060d]/55 p-5 backdrop-blur-md sm:p-7">
        <p className="font-mono text-[0.625rem] tracking-[0.2em] text-white/80 uppercase">
          Funding rails
        </p>
        <ul className="mt-5 divide-y divide-white/15">
          {rails.map((rail) => (
            <li
              key={rail.label}
              className="flex items-center justify-between gap-4 py-3.5 text-sm"
            >
              <span className="text-white/90">{rail.label}</span>
              <span className="font-mono text-white/75">{rail.detail}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 border-t border-white/15 pt-5 font-mono text-xs text-white/75">
          No deposit fee · Withdrawals from{" "}
          {formatCurrency(100, { decimals: 0 })}
        </p>
        <ButtonLink
          href={brokerHeroCta.primary.href}
          size="lg"
          className={cn(primaryOnDark, "mt-6")}
        >
          Open live account
          <ArrowRight />
        </ButtonLink>
      </div>
    </div>
  );
}
