import { marketingImages } from "@/lib/images";

/**
 * The hero footage, kept in one file so the clip can be swapped without
 * touching a component.
 *
 * The renditions are built locally from the camera master by
 * `npm run hero:video` and served from `/public` — nothing here reaches out to
 * a third-party CDN, so the hero cannot be broken by someone else's host.
 *
 * TO SWAP THE FOOTAGE: drop the new master at
 * `public/video/hero-skyscraper-source.mp4` and run `npm run hero:video`.
 * The script rewrites every rendition and the poster in place, so this file
 * only needs editing if the base name below changes.
 *
 * Each band ships a VP9/WebM and an H.264/MP4 of the same frames; the WebM is
 * listed first and lands roughly a third smaller in browsers that take it,
 * with the MP4 as the universal fallback. One band is chosen per viewport
 * width rather than shipping the widest file everywhere, so a phone never
 * downloads the 1080p encode.
 */

/** Base name shared by every output of `npm run hero:video`. */
const CLIP = "hero-skyscraper";

type Rendition = {
  /** Upper bound of the viewport band this rendition serves, in CSS pixels. */
  maxWidth: number;
  webm: string;
  mp4: string;
};

export type HeroClip = {
  renditions: Rendition[];
  poster: string;
  posterAlt: string;
  description: string;
  /** CSS object-position for poster/video; aerial footage defaults to upper third. */
  objectPosition?: string;
};

const rendition = (maxWidth: number, height: 1080 | 720 | 640): Rendition => ({
  maxWidth,
  webm: `/video/${CLIP}-${height}.webm`,
  mp4: `/video/${CLIP}-${height}.mp4`,
});

/**
 * The client's own footage: an aerial hold on a tower spire breaking through
 * sunrise fog. Encoded as a ping-pong loop (forward, then reverse) because the
 * camera move ends nowhere near where it starts — see `scripts/hero-video.sh`.
 */
export const heroClip: HeroClip = {
  renditions: [
    rendition(640, 640),
    rendition(1024, 720),
    rendition(Infinity, 1080),
  ],
  // WebP is what ships; the script also writes a JPG of the same frame as the
  // universal fallback for anything that cannot take WebP.
  poster: `/hero/${CLIP}-poster.webp`,
  posterAlt:
    "Modern skyscrapers rising through sunrise clouds above Earth, with a golden market trend line",
  description:
    "Cinematic skyline above the cloud layer with a luminous trading chart overlay",
  objectPosition: "center 45%",
};

/**
 * Funded landing hero — still photography only (no looped clip). Real desk
 * work reads as relatable prop-trading context without the homepage aerial.
 */
export const fundedHeroClip: HeroClip = {
  renditions: [],
  poster: marketingImages.heroFunded.src,
  posterAlt: marketingImages.heroFunded.alt,
  description: "Professional trader at a bright desk reviewing markets on a laptop",
  objectPosition: "center 42%",
};

/** The rendition band for a viewport, widest as the fallback. */
export function pickRendition(clip: HeroClip, viewportWidth: number) {
  return (
    clip.renditions.find((r) => viewportWidth <= r.maxWidth) ??
    clip.renditions[clip.renditions.length - 1]
  );
}

/**
 * One-shot landing clip that plays before the hero on the home page. Encoded
 * from `public/video/home-intro-source.mp4` — swap that file and re-run
 * ffmpeg (see `HomeLandingIntro` comment) to replace the intro.
 *
 * Served as one full-resolution 8-bit HEVC MP4 (hvc1, no audio, faststart).
 * iPhone Safari stutters on 10-bit HEVC inside a page, so the delivery file
 * stays 3840×2160 but is 8-bit. A WebM sibling on disk is an older shorter
 * cut — do not list it as a <source>.
 */
export const homeIntroClip = {
  mp4: "/video/home-intro-720.mp4",
  poster: "/hero/home-intro-poster.webp",
} as const;

/** Flip to `false` before launch — once per session when off. */
export const homeIntroAlwaysPlay = true;
