export type ProductKey = "funded" | "broker";

export type ProductFlags = {
  fundedEnabled: boolean;
  brokerEnabled: boolean;
};

/** Marketing path for the live-trading (broker) product. */
export const tradingProductHref = "/trading" as const;

export function productComingSoonHref(product: ProductKey) {
  return product === "broker" ? "/trading/coming-soon" : "/funded/coming-soon";
}

export function productIsEnabled(
  product: ProductKey,
  flags: ProductFlags,
): boolean {
  if (product === "broker") return flags.brokerEnabled;
  return flags.fundedEnabled;
}

export function productHref(
  product: ProductKey,
  href: string,
  flags: ProductFlags,
) {
  return productIsEnabled(product, flags) ? href : productComingSoonHref(product);
}

/** Hero landings that use transparent header chrome over a cinema stage. */
export function isProductLandingPath(pathname: string) {
  return pathname === "/";
}

/** Only the homepage plays the cinematic video intro. */
export function isHomeIntroPath(pathname: string) {
  return pathname === "/";
}

/** Live-trading marketing surface (canonical `/trading`, legacy `/broker`). */
export function isTradingPath(pathname: string) {
  return pathname.startsWith("/trading") || pathname.startsWith("/broker");
}

