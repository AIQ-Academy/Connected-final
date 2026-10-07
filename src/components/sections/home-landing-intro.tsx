"use client";

import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { setIntroStage } from "@/lib/home-intro";
import { homeIntroAlwaysPlay, homeIntroClip } from "@/lib/media";
import { useHydrated } from "@/lib/use-hydrated";
import { useLocale } from "@/components/i18n/locale-provider";

const SESSION_KEY = "cf-home-intro-seen";
const CINEMA_EASE = [0.22, 1, 0.36, 1] as const;
/**
 * How long playback may go without reporting progress before the overlay gives
 * up. Measured between frames rather than from the start, so the clip is never
 * cut short for being long — only for being stuck.
 */
const STALL_MS = 6_000;

type Phase = "hidden" | "enter" | "play";

function shouldPlayIntro() {
  if (homeIntroAlwaysPlay) return true;
  try {
    return sessionStorage.getItem(SESSION_KEY) !== "1";
  } catch {
    return true;
  }
}

function markIntroSeen() {
  if (homeIntroAlwaysPlay) return;
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* private browsing — skip persistence */
  }
}

/**
 * Cinematic home-page opener: a descent from orbit, played in full and then
 * handed to the page in one step.
 *
 * The clip owns the viewport until its own last frame — no blended hand-over,
 * because overlapping the two shots meant starting the swap early and losing
 * the end of the footage.
 *
 * Shown once per browser session (unless `homeIntroAlwaysPlay` is on); skipped
 * entirely when reduced motion is on.
 * The launch clip is served locally as the self-contained MP4 rendition.
 */
export function HomeLandingIntro() {
  const { t } = useLocale();
  const reduced = useReducedMotion();
  const hydrated = useHydrated();
  const videoRef = useRef<HTMLVideoElement>(null);
  const dismissedRef = useRef(false);

  const [phase, setPhase] = useState<Phase>("hidden");
  const [plan, setPlan] = useState<"undecided" | "play" | "skip">("undecided");
  const overlayOpen = phase !== "hidden";

  // Resolved while rendering rather than in an effect: an effect would paint a
  // frame of bare page before the overlay goes up.
  if (hydrated && plan === "undecided") {
    const next = reduced || !shouldPlayIntro() ? "skip" : "play";
    setPlan(next);
    setPhase(next === "play" ? "enter" : "hidden");
  }

  // Publishing the decision is an external write, so it waits for the commit.
  useEffect(() => {
    if (plan === "undecided") return;
    if (plan === "skip") {
      markIntroSeen();
      setIntroStage("settled");
      return;
    }
    markIntroSeen();
    setIntroStage("waiting");
  }, [plan]);

  /**
   * The page must be at the top before it is revealed — a refresh restores the
   * previous scroll position, and the visitor would land mid-page behind the
   * clip. Scroll restoration is disabled for as long as the overlay is up, and
   * the padding keeps the layout still when the scrollbar goes away.
   */
  useEffect(() => {
    if (!overlayOpen) return;

    const body = document.body;
    const gutter = window.innerWidth - document.documentElement.clientWidth;
    const previous = {
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
      restoration: history.scrollRestoration,
    };

    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    body.style.overflow = "hidden";
    if (gutter > 0) body.style.paddingRight = `${gutter}px`;

    return () => {
      body.style.overflow = previous.overflow;
      body.style.paddingRight = previous.paddingRight;
      history.scrollRestoration = previous.restoration ?? "auto";
    };
  }, [overlayOpen]);

  const dismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    // Belt and braces: the lock above should already hold this at zero.
    window.scrollTo(0, 0);
    markIntroSeen();
    setIntroStage("settled");
    setPhase("hidden");
  }, []);

  useEffect(() => {
    if (phase !== "enter") return;
    const timer = window.setTimeout(() => setPhase("play"), 380);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "play") return;
    const video = videoRef.current;
    if (!video) return;
    void video.play().catch(() => dismiss());
  }, [phase, dismiss]);

  // A clip that stalls mid-buffer must still hand over.
  useEffect(() => {
    if (phase !== "play") return;
    const video = videoRef.current;
    if (!video) return;

    let bail = window.setTimeout(dismiss, STALL_MS);
    const onProgress = () => {
      window.clearTimeout(bail);
      bail = window.setTimeout(dismiss, STALL_MS);
    };

    video.addEventListener("timeupdate", onProgress);
    return () => {
      window.clearTimeout(bail);
      video.removeEventListener("timeupdate", onProgress);
    };
  }, [phase, dismiss]);

  // Escape takes the same route out as the clip ending on its own.
  useEffect(() => {
    if (!overlayOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [overlayOpen, dismiss]);

  if (!overlayOpen) return null;

  return (
    <div
      role="presentation"
      aria-hidden="true"
      className="fixed inset-0 z-[100] overflow-hidden bg-[var(--cf-hero-bg)]"
    >
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "enter" ? 0 : 1 }}
        transition={{ duration: 0.6, ease: CINEMA_EASE }}
      >
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            poster={homeIntroClip.poster}
            onEnded={dismiss}
            onError={dismiss}
            className="absolute inset-0 size-full object-cover object-center"
          >
            <source src={homeIntroClip.mp4} type="video/mp4" />
          </video>
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/55" />
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_140px_rgb(0_0_0/0.5)]" />
      </motion.div>

      <button
        type="button"
        onClick={dismiss}
        className="absolute end-5 bottom-6 z-10 inline-flex items-center gap-2 rounded-full border border-white/25 bg-[var(--cf-hero-scrim-55)] px-4 py-2 text-xs font-semibold tracking-wide text-white/90 uppercase backdrop-blur-sm transition-colors hover:border-white/45 hover:bg-[var(--cf-hero-scrim-62)] hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--cf-hero-bg)] focus-visible:outline-none"
      >
        {t("home.skipIntro")}
        {/* The shortcut is only shown where there is a keyboard to press it on;
            tapping the button is the equivalent everywhere else. */}
        <kbd className="hidden rounded border border-white/25 bg-white/10 px-1.5 py-0.5 font-mono text-[0.625rem] font-normal text-white/70 sm:inline-block">
          Esc
        </kbd>
      </button>
    </div>
  );
}
