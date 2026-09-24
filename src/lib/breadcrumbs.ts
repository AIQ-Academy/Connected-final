/**
 * Breadcrumb trails for marketing pages. Labels follow primaryNav where the
 * route appears there, so the tree never disagrees with the header menu.
 */

export type Crumb = {
  label: string;
  /** Omit on the current page (last crumb). */
  href?: string;
};

/** Exact-path trails. Longer / more specific paths win when matching. */
const trails: Record<string, Crumb[]> = {
  "/trading": [{ label: "Trading" }],
  "/trading/accounts": [
    { label: "Trading", href: "/trading" },
    { label: "Account Types" },
  ],
  "/trading/how-it-works": [
    { label: "Trading", href: "/trading" },
    { label: "How It Works" },
  ],
  "/trading/coming-soon": [
    { label: "Trading", href: "/trading" },
    { label: "Coming soon" },
  ],
  "/products": [
    { label: "Trading", href: "/trading" },
    { label: "Products" },
  ],
  "/platforms": [
    { label: "Trading", href: "/trading" },
    { label: "Platforms" },
  ],
  "/payments": [{ label: "Payments" }],
  "/markets": [{ label: "Markets" }],
  "/glossary": [
    { label: "Learn" },
    { label: "Trading glossary" },
  ],
  "/faq": [
    { label: "Learn" },
    { label: "Funding and payout FAQ" },
  ],
  "/contact": [
    { label: "Learn" },
    { label: "Contact" },
  ],
  "/about": [{ label: "About" }],
  "/accounts": [{ label: "Account tiers" }],
  "/how-it-works": [{ label: "How it works" }],
  "/education": [
    { label: "Learn" },
    { label: "Trading glossary" },
  ],
  "/legal/terms": [
    { label: "Legal" },
    { label: "Terms & Conditions" },
  ],
  "/legal/privacy": [
    { label: "Legal" },
    { label: "Privacy Policy" },
  ],
  "/legal/risk-disclosure": [
    { label: "Legal" },
    { label: "Risk Disclosure" },
  ],
  "/legal/aml-kyc": [
    { label: "Legal" },
    { label: "AML & KYC" },
  ],
  "/legal/refunds": [
    { label: "Legal" },
    { label: "Refund Policy" },
  ],
};

/** Parents that are groupings without a landing page — no link on that crumb. */
const unlinkParents = new Set(["Learn", "Legal", "Markets"]);

function normalizePath(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  const bare = pathname.split("#")[0].split("?")[0] ?? pathname;
  return bare.length > 1 && bare.endsWith("/") ? bare.slice(0, -1) : bare;
}

/**
 * Resolve the breadcrumb trail for a pathname. Hash-only Market deep links
 * (`/markets#charts`) still resolve to the Markets page trail.
 */
export function breadcrumbsFor(pathname: string): Crumb[] | null {
  const path = normalizePath(pathname);
  if (path === "/") return null;

  if (trails[path]) {
    return trails[path].map((crumb, index, list) => {
      const isLast = index === list.length - 1;
      if (isLast) return { label: crumb.label };
      if (unlinkParents.has(crumb.label)) return { label: crumb.label };
      return crumb;
    });
  }

  if (path.startsWith("/news/")) {
    return [
      { label: "Markets", href: "/markets" },
      { label: "News" },
    ];
  }

  if (path.startsWith("/legal/")) {
    return [{ label: "Legal" }];
  }

  // Fallback: title-case the last segment under a best-effort parent.
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) return null;

  const labelize = (segment: string) =>
    segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  if (parts.length === 1) {
    return [{ label: labelize(parts[0]!) }];
  }

  const parent = parts[0]!;
  const parentHref = `/${parent}`;
  return [
    {
      label: labelize(parent),
      href: trails[parentHref] ? parentHref : undefined,
    },
    { label: labelize(parts[parts.length - 1]!) },
  ];
}
