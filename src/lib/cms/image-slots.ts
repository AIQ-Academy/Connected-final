import {
  marketingImages,
  newsCategoryImages,
  testimonialPortraits,
} from "@/lib/images";

/**
 * Every replaceable image on the marketing site, keyed by slot.
 *
 * The registry is the contract between three places: the admin crop UI locks
 * to `ratio`, the upload route resizes to `width`×`height`, and the public
 * resolver falls back to `fallback` when no asset has been uploaded. Ratios
 * were read off the real call sites — change one here only after changing the
 * layout that renders it.
 */

export type ImageSlotGroup =
  | "Homepage"
  | "Funded"
  | "Live trading"
  | "Shared sections"
  | "Testimonials"
  | "News";

export type ImageSlot = {
  key: string;
  label: string;
  /** Where the image appears, shown in the admin grid. */
  usage: string;
  group: ImageSlotGroup;
  /** Crop aspect, expressed as width / height. */
  ratio: number;
  /** Human label for the ratio badge, e.g. "16:9". */
  ratioLabel: string;
  /** Output size the upload route resizes to. */
  width: number;
  height: number;
  fallback: { src: string; alt: string };
};

function slot(
  key: string,
  label: string,
  usage: string,
  group: ImageSlotGroup,
  ratioLabel: string,
  width: number,
  height: number,
  fallback: { src: string; alt: string },
): ImageSlot {
  return {
    key,
    label,
    usage,
    group,
    ratio: width / height,
    ratioLabel,
    width,
    height,
    fallback,
  };
}

const howItWorksLabels = [
  "Stage 1 — Choose",
  "Stage 2 — Prove",
  "Stage 3 — Verify",
  "Stage 4 — Get paid",
];

const brokerHowItWorksLabels = [
  "Stage 1 — Register",
  "Stage 2 — Verify",
  "Stage 3 — Fund",
  "Stage 4 — Trade",
];

export const imageSlots: ImageSlot[] = [
  slot(
    "funded.hero",
    "Funded landing hero",
    "Full-bleed backdrop on /funded",
    "Funded",
    "16:9",
    1920,
    1080,
    marketingImages.heroFunded,
  ),
  slot(
    "trading.hero",
    "Live trading hero",
    "Full-bleed backdrop on /trading",
    "Live trading",
    "16:9",
    1920,
    1080,
    marketingImages.heroTrading,
  ),

  // Homepage bands. `home-trading` sits in a 7/12 column at ~28rem tall and
  // `home-about` in a 40vw column, both effectively widescreen.
  slot(
    "home.trading",
    "Live trading panel",
    "Homepage → Live trading band",
    "Homepage",
    "16:9",
    1600,
    900,
    marketingImages.homeTrading,
  ),
  slot(
    "home.funded",
    "Funded panel",
    "Homepage → Funded evaluations band",
    "Homepage",
    "16:9",
    1600,
    900,
    marketingImages.homeFunded,
  ),
  slot(
    "home.about",
    "About panel",
    "Homepage → About us band",
    "Homepage",
    "16:9",
    1600,
    900,
    marketingImages.about,
  ),

  // Shared marketing sections used by /funded, /trading and deep pages.
  slot(
    "section.account-tiers",
    "Account tiers banner",
    "Account tiers section and the registration CTA background",
    "Shared sections",
    "16:9",
    1600,
    900,
    marketingImages.accountTiers,
  ),
  slot(
    "section.why-us",
    "Why us panel",
    "Why Connect Funded panel and the about-page differentiator grid",
    "Shared sections",
    "4:5",
    1000,
    1250,
    marketingImages.whyUs,
  ),
  slot(
    "section.platforms",
    "Platforms panel",
    "Platform detail panels",
    "Shared sections",
    "16:9",
    1600,
    900,
    marketingImages.platforms,
  ),
  slot(
    "section.about",
    "About hero",
    "About page closing image",
    "Shared sections",
    "16:9",
    1600,
    900,
    marketingImages.about,
  ),
  slot(
    "section.education",
    "Education card",
    "Course explorer card headers",
    "Shared sections",
    "16:9",
    1200,
    675,
    marketingImages.education,
  ),
  slot(
    "section.payments",
    "Payments panel",
    "Accepted payments section",
    "Shared sections",
    "16:9",
    1400,
    788,
    marketingImages.payments,
  ),
  slot(
    "section.empty-state",
    "Empty state",
    "Portal and admin empty states",
    "Shared sections",
    "16:9",
    800,
    450,
    marketingImages.emptyState,
  ),

  // How-it-works stage cards render inside `aspect-[3/4]`.
  ...marketingImages.howItWorks.map((fallback, index) =>
    slot(
      `how-it-works.stage-${index + 1}`,
      howItWorksLabels[index] ?? `Stage ${index + 1}`,
      "How it works stage cards on /funded and /how-it-works",
      "Funded",
      "3:4",
      900,
      1200,
      fallback,
    ),
  ),

  // Live trading how-it-works stage cards render inside `aspect-[3/4]`.
  ...marketingImages.brokerHowItWorks.map((fallback, index) =>
    slot(
      `trading.how-it-works.stage-${index + 1}`,
      brokerHowItWorksLabels[index] ?? `Stage ${index + 1}`,
      "How it works stage cards on /trading and /trading/how-it-works",
      "Live trading",
      "3:4",
      900,
      1200,
      fallback,
    ),
  ),

  // Portraits are masked into a circle, so anything but 1:1 crops badly.
  ...Object.entries(testimonialPortraits).map(([slug, fallback]) =>
    slot(
      `testimonial.${slug}`,
      fallback.alt.split(",")[0] ?? slug,
      "Testimonial portrait",
      "Testimonials",
      "1:1",
      400,
      400,
      fallback,
    ),
  ),

  // News cards use `aspect-[16/10]` on the featured card and 16:9 elsewhere;
  // 16:9 with object-cover reads correctly in both.
  ...Object.entries(newsCategoryImages).map(([category, fallback]) =>
    slot(
      `news.${category.toLowerCase().replace(/\s+/g, "-")}`,
      `${category} cards`,
      "Market news cards and article headers",
      "News",
      "16:9",
      1200,
      675,
      fallback,
    ),
  ),
];

export const imageSlotMap: Record<string, ImageSlot> = Object.fromEntries(
  imageSlots.map((entry) => [entry.key, entry]),
);

export type ImageSlotKey = string;

export function getImageSlot(key: string): ImageSlot | null {
  return imageSlotMap[key] ?? null;
}

export function isImageSlotKey(key: string): boolean {
  return key in imageSlotMap;
}

/** Slots grouped for the admin grid, in registry order. */
export function groupedImageSlots(): { group: ImageSlotGroup; slots: ImageSlot[] }[] {
  const groups = new Map<ImageSlotGroup, ImageSlot[]>();
  for (const entry of imageSlots) {
    const list = groups.get(entry.group) ?? [];
    list.push(entry);
    groups.set(entry.group, list);
  }
  return [...groups.entries()].map(([group, slots]) => ({ group, slots }));
}

/**
 * Public routes that render a slot, so an upload can revalidate exactly the
 * pages that changed. Over-revalidating is cheap here; missing a page means an
 * editor uploads an image and does not see it, so err towards more paths.
 */
export function affectedPaths(key: string): string[] {
  if (key === "funded.hero") return ["/funded"];
  if (key === "trading.hero") return ["/trading"];
  if (key.startsWith("home.")) return ["/"];
  if (key.startsWith("testimonial.")) return ["/", "/funded", "/trading"];
  if (key.startsWith("how-it-works.")) {
    return ["/funded", "/how-it-works"];
  }
  if (key.startsWith("trading.how-it-works.")) {
    return ["/trading", "/trading/how-it-works"];
  }
  if (key.startsWith("news.")) return ["/markets", "/news"];

  switch (key) {
    case "section.account-tiers":
      return ["/", "/funded", "/trading", "/accounts"];
    case "section.why-us":
      return ["/funded", "/trading", "/about"];
    case "section.platforms":
      return ["/", "/platforms", "/trading"];
    case "section.about":
      return ["/", "/about"];
    case "section.education":
      return ["/glossary"];
    case "section.payments":
      return ["/payments", "/funded", "/trading"];
    default:
      return [];
  }
}

/** Slot key for a testimonial portrait, matching `testimonialPortraitSlug`. */
export function testimonialSlotKey(slug: string): string {
  return `testimonial.${slug}`;
}

/** Slot key for a news category image. */
export function newsSlotKey(category: string): string {
  return `news.${category.toLowerCase().replace(/\s+/g, "-")}`;
}
