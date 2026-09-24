"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { setIntroStage } from "@/lib/home-intro";
import { homeIntroAlwaysPlay, homeIntroClip } from "@/lib/media";
import { useHydrated } from "@/lib/use-hydrated";

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

function errorName(error: unknown) {
  return error instanceof Error ? error.name : "";
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
 * To swap the footage, replace `public/video/home-intro-source.mp4` and run:
 *
 *   ffmpeg -i public/video/home-intro-source.mp4 -an \\
 *     -c:v libx265 -profile:v main -pix_fmt yuv420p -preset medium -crf 16 \\
 *     -tag:v hvc1 -color_primaries bt709 -color_trc bt709 -colorspace bt709 \\
 *     -movflags +faststart public/video/home-intro-720.mp4
 *
 * Keep the full frame size. iPhone Safari stutters on 10-bit HEVC in a page,
 * so the delivery file is 8-bit, audio-free, and faststart — same resolution.
 */
export function HomeLandingIntro() {
  const reduced = useReducedMotion();
  const hydrated = useHydrated();
  const videoRef = useRef<HTMLVideoElement>(null);
  const dismissedRef = useRef(false);
  const startedRef = useRef(false);

  const [phase, setPhase] = useState<Phase>("hidden");
  const [plan, setPlan] = useState<"undecided" | "play" | "skip">("undecided");
  const [needsGesture, setNeedsGesture] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [veil, setVeil] = useState(true);
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

  // iPhone Safari autoplays muted inline video. Calling play() again while
  // it is already running restarts the decoder and shows up as stutter.
  // Low Power Mode and a rejected play() must NOT take the overlay down —
  // that was skipping the intro on first paint. AbortError is also ignored
  // (React Strict Mode remounts, or autoPlay racing play()).
  useEffect(() => {
    if (!overlayOpen) return;
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("webkit-playsinline", "true");

    let alive = true;

    const tryPlay = () => {
      if (!alive || dismissedRef.current || !video.paused) return;
      void video.play().then(
        () => {
          if (!alive) return;
          setNeedsGesture(false);
        },
        (error: unknown) => {
          if (!alive || dismissedRef.current) return;
          const name = errorName(error);
          if (name === "AbortError") return;
          if (name === "NotAllowedError") {
            setNeedsGesture(true);
            return;
          }
        },
      );
    };

    const onPlaying = () => {
      if (!alive) return;
      startedRef.current = true;
      setPlaying(true);
      setNeedsGesture(false);
      setPhase((current) => (current === "hidden" ? current : "play"));
    };

    tryPlay();
    video.addEventListener("canplay", tryPlay);
    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("playing", onPlaying);

    return () => {
      alive = false;
      video.removeEventListener("canplay", tryPlay);
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("playing", onPlaying);
    };
  }, [overlayOpen]);

  // A clip that stalls mid-buffer must still hand over — but only after the
  // first frame, otherwise a blocked autoplay on iPhone would skip instantly.
  useEffect(() => {
    if (phase !== "play") return;
    const video = videoRef.current;
    if (!video) return;

    let bail = window.setTimeout(() => {
      if (startedRef.current) dismiss();
    }, STALL_MS);

    const onProgress = () => {
      startedRef.current = true;
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

  const playFromGesture = useCallback(() => {
    const video = videoRef.current;
    if (!video || dismissedRef.current) return;
    video.muted = true;
    void video.play().then(
      () => setNeedsGesture(false),
      () => setNeedsGesture(true),
    );
  }, []);

  if (!overlayOpen) return null;

  return (
    <div
      role="presentation"
      aria-hidden="true"
      className="fixed inset-0 z-[100] overflow-hidden bg-[#040508]"
      onClick={needsGesture ? playFromGesture : undefined}
    >
      <div className="absolute inset-0">
        {playing ? null : (
          <Image
            src={homeIntroClip.poster}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        )}
        <video
          ref={videoRef}
          src={homeIntroClip.mp4}
          muted
          playsInline
          autoPlay
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          controls={false}
          webkit-playsinline="true"
          onEnded={() => {
            const elapsed = videoRef.current?.currentTime ?? 0;
            if (elapsed < 0.25) return;
            dismiss();
          }}
          className="absolute inset-0 size-full object-cover object-center"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/55" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,rgb(0_0_0/0.45)_100%)]" />

      {/* Fades off the film rather than hiding the <video> — iOS treats an
          opacity-0 video as off-screen and cancels autoplay. Removed once the
          fade finishes so it does not sit on top of every decoded frame. */}
      {veil ? (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[#040508]"
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === "enter" ? 1 : 0 }}
          transition={{ duration: 0.6, ease: CINEMA_EASE }}
          onAnimationComplete={() => {
            if (phase === "play") setVeil(false);
          }}
        />
      ) : null}

      {needsGesture && (
        <p className="pointer-events-none absolute inset-x-0 bottom-24 z-10 text-center text-xs font-semibold tracking-wide text-white/80 uppercase">
          Tap to play
        </p>
      )}

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          dismiss();
        }}
        className="absolute right-5 bottom-6 z-10 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/35 px-4 py-2 text-xs font-semibold tracking-wide text-white/90 uppercase backdrop-blur-sm transition-colors hover:border-white/45 hover:bg-black/50 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#040508] focus-visible:outline-none"
      >
        Skip intro
        {/* The shortcut is only shown where there is a keyboard to press it on;
            tapping the button is the equivalent everywhere else. */}
        <kbd className="hidden rounded border border-white/25 bg-white/10 px-1.5 py-0.5 font-mono text-[0.625rem] font-normal text-white/70 sm:inline-block">
          Esc
        </kbd>
      </button>
    </div>
  );
}
