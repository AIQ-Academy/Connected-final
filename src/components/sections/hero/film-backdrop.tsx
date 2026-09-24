"use client";

import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { heroClip, pickRendition, type HeroClip } from "@/lib/media";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

/** Skips the video on a metered connection, where a background loop is rude. */
function prefersLightPayload() {
  if (typeof navigator === "undefined") return false;
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  return connection?.saveData === true;
}

/**
 * The hero clip is encoded as a ping-pong (forward, then reverse). Browsers
 * reject a negative `playbackRate`, so the same-frame opposite motion is the
 * other half of the file: `duration - currentTime`.
 */
function mirrorPlayhead(video: HTMLVideoElement) {
  const duration = video.duration;
  if (!Number.isFinite(duration) || duration <= 0) return false;
  video.currentTime = Math.min(
    duration,
    Math.max(0, duration - video.currentTime),
  );
  return true;
}

function playSoon(video: HTMLVideoElement) {
  if (video.seeking) {
    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      void video.play().catch(() => {});
    };
    video.addEventListener("seeked", onSeeked);
    return onSeeked;
  }
  void video.play().catch(() => {});
  return null;
}

/**
 * Full-bleed hero video with a poster fallback.
 *
 * The poster paints first and stays visible while the clip buffers, when
 * `prefers-reduced-motion` is on, when save-data is enabled, or when the
 * source fails — the video only fades in once it can play.
 *
 * A backward slide pauses the loop and plays the reverse half until the
 * next forward slide, which mirrors the playhead back and resumes.
 */
export function HeroFilm({
  clip = heroClip,
  className,
  active = 0,
}: {
  clip?: HeroClip;
  className?: string;
  /** Current hero slide. Decreasing this rewinds the film until you go forward. */
  active?: number;
}) {
  const reduced = useReducedMotion();
  const hydrated = useHydrated();
  const [playable, setPlayable] = useState(false);
  const [failed, setFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prevActiveRef = useRef(active);
  const reversedRef = useRef(false);
  const seekHandlerRef = useRef<(() => void) | null>(null);

  const rendition = useMemo(() => {
    if (!clip.renditions.length) return null;
    if (!hydrated || reduced || prefersLightPayload() || failed) return null;
    if (typeof window === "undefined") return null;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    return pickRendition(clip, window.innerWidth * dpr);
  }, [clip, hydrated, reduced, failed]);

  const objectPosition = clip.objectPosition ?? "center 38%";

  useLayoutEffect(() => {
    const previous = prevActiveRef.current;
    prevActiveRef.current = active;
    const video = videoRef.current;
    if (!video || !playable) return;

    const goingBack = active < previous;
    const goingForward = active > previous;
    if (!goingBack && !goingForward) return;

    const dropSeekHandler = () => {
      const handler = seekHandlerRef.current;
      if (handler) {
        video.removeEventListener("seeked", handler);
        seekHandlerRef.current = null;
      }
    };

    const flip = (reverse: boolean) => {
      dropSeekHandler();
      video.pause();
      video.loop = !reverse;
      if (!mirrorPlayhead(video)) {
        void video.play().catch(() => {});
        return;
      }
      seekHandlerRef.current = playSoon(video);
    };

    if (goingBack) {
      if (!reversedRef.current) {
        reversedRef.current = true;
        flip(true);
      }
      return;
    }

    if (!reversedRef.current) {
      void video.play().catch(() => {});
      return;
    }
    reversedRef.current = false;
    flip(false);
  }, [active, playable]);

  useEffect(() => {
    const video = videoRef.current;
    return () => {
      const handler = seekHandlerRef.current;
      if (video && handler) video.removeEventListener("seeked", handler);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 isolate overflow-hidden select-none",
        className,
      )}
    >
      {/* Pre-encoded 4K poster — served as-is so Next.js does not recompress it. */}
      <Image
        src={clip.poster}
        alt={clip.posterAlt || ""}
        fill
        priority
        unoptimized
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition }}
      />

      {/* {rendition && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => setPlayable(true)}
          onPlaying={() => setPlayable(true)}
          onError={() => setFailed(true)}
          className={cn(
            "absolute inset-0 size-full object-cover scale-[1.01] brightness-[0.98] contrast-[1.06] saturate-[1.12] transition-opacity duration-1000 ease-out",
            playable ? "opacity-100" : "opacity-0",
          )}
          style={{ objectPosition }}
        >
          <source src={rendition.webm} type="video/webm" />
          <source src={rendition.mp4} type="video/mp4" />
        </video>
      )} */}

      {/* 3. Subtle chromatic & color depth grading layer */}
      {/* <div className="absolute inset-0 bg-gradient-to-tr from-[#060814]/30 via-transparent to-[#f2b84b]/10 mix-blend-color-dodge" /> */}

      {/* 4. Fine film grain texture to prevent banding and add tactile polish */}
      {/* <div
        className="grain-overlay absolute inset-0 pointer-events-none opacity-[0.025] mix-blend-overlay"
        aria-hidden="true"
      /> */}
    </div>
  );
}
