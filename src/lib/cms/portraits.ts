import type { Testimonial } from "@/db/schema";
import { testimonialPortraitSlug } from "@/lib/images";
import { imageSlotMap, testimonialSlotKey } from "@/lib/cms/image-slots";
import type { MediaResolver, ResolvedImage } from "@/lib/cms/media";

/**
 * Resolve portraits for the testimonials on a page, keyed by author name.
 *
 * Only authors that have a registered slot are included — anyone else keeps
 * the generic fallback the component already applies, so a new testimonial
 * never renders a broken image just because nobody has uploaded a portrait.
 */
export function testimonialPortraitMap(
  testimonials: Testimonial[],
  resolve: MediaResolver,
): Record<string, ResolvedImage> {
  const entries: [string, ResolvedImage][] = [];

  for (const testimonial of testimonials) {
    const key = testimonialSlotKey(
      testimonialPortraitSlug(testimonial.authorName),
    );
    if (!(key in imageSlotMap)) continue;
    entries.push([testimonial.authorName, resolve(key)]);
  }

  return Object.fromEntries(entries);
}
