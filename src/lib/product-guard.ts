import "server-only";

import { redirect } from "next/navigation";

import { getSiteSettings } from "@/db/queries";
import {
  productComingSoonHref,
  productIsEnabled,
  type ProductKey,
} from "@/lib/products";

/**
 * Central gate for every product-specific public page.
 *
 * When a product is disabled from the admin (`site_settings.funded_enabled` /
 * `site_settings.broker_enabled`), every page that belongs to that product
 * redirects to its coming-soon landing. The coming-soon pages themselves must
 * NOT call this guard, or they would redirect to themselves in a loop.
 *
 * Keeping the logic here means each page opts in with a single line and the
 * flag-to-route mapping lives in exactly one place.
 */
export async function guardProduct(product: ProductKey): Promise<void> {
  const flags = await getSiteSettings();
  if (!productIsEnabled(product, flags)) {
    redirect(productComingSoonHref(product));
  }
}
