import "server-only";

import { getMediaSlots } from "@/db/queries";
import { getImageSlot } from "@/lib/cms/image-slots";

/**
 * A resolved image, ready to spread into `next/image`.
 *
 * `blurDataURL` is only present on uploaded assets — the Unsplash defaults are
 * remote and have no placeholder, so consumers must treat it as optional and
 * only set `placeholder="blur"` when it is there.
 */
export type ResolvedImage = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  blurDataURL?: string;
};

export type MediaResolver = (
  key: string,
  altOverride?: string,
) => ResolvedImage;

/**
 * Build a resolver for a page render.
 *
 * One query per request covers every slot on the page, which beats a lookup
 * per image and keeps the fallback path a pure in-memory read. Call it once in
 * a server component and pass the resolved images down as props.
 */
export async function createMediaResolver(): Promise<MediaResolver> {
  const uploaded = await getMediaSlots();

  return function resolve(key, altOverride) {
    const registered = getImageSlot(key);
    const asset = uploaded.get(key);

    if (asset) {
      return {
        src: asset.blobUrl,
        alt: altOverride ?? asset.alt,
        width: asset.width,
        height: asset.height,
        blurDataURL: asset.blurDataUrl ?? undefined,
      };
    }

    if (registered) {
      return {
        src: registered.fallback.src,
        alt: altOverride ?? registered.fallback.alt,
      };
    }

    // An unregistered key is a programming error, not a content problem. Fail
    // loudly in the log but still render something rather than a broken page.
    console.warn(`[cms/media] unknown image slot "${key}"`);
    return { src: "", alt: altOverride ?? "" };
  };
}

/** Single-slot convenience for pages that only need one image. */
export async function resolveImage(
  key: string,
  altOverride?: string,
): Promise<ResolvedImage> {
  const resolver = await createMediaResolver();
  return resolver(key, altOverride);
}
