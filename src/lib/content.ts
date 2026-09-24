/**
 * Marketing content shared by more than one surface. Anything that appears
 * both on the home page and a deep page lives here so the two can never
 * disagree about a number.
 */

export const NOT_PROVIDED = "Not provided";

export type PaymentDirection = "deposits" | "withdrawals" | "both";

export type PaymentMethod = {
  name: string;
  category: "card" | "bank" | "wallet" | "crypto";
  /** Deposit processing time. */
  deposit: string;
  /** Withdrawal processing time. */
  payout: string;
  detail: string;
  minimum: string;
  maximum: string;
  processing: string;
  dailyCap: string;
  /**
   * Daily cap (and adjacent terms) are copied from Whish Money for layout.
   * Confirm before publication.
   */
  sharedTerms?: boolean;
  directions: PaymentDirection;
  currency: string;
  fees: string;
  nameMatch: string;
  verification: string;
  geo: string;
};

const nameMatchRequired =
  "Required — the paying or receiving account must be in your verified name";

export const paymentMethods: PaymentMethod[] = [
  {
    name: "Visa",
    category: "card",
    deposit: "Instant",
    payout: "Instant",
    processing: "Instant",
    minimum: "$25",
    maximum: "$5,000",
    dailyCap: NOT_PROVIDED,
    directions: "both",
    currency: "USD",
    fees: NOT_PROVIDED,
    nameMatch: nameMatchRequired,
    verification: NOT_PROVIDED,
    geo: NOT_PROVIDED,
    detail:
      "Card deposits and payouts. Per-transaction cap $5,000; daily cap not provided.",
  },
  {
    name: "Local bank transfer",
    category: "bank",
    deposit: "1–3 business days",
    payout: "1–3 business days",
    processing: "1–3 business days",
    minimum: "$25",
    maximum: "$25,000",
    dailyCap: NOT_PROVIDED,
    directions: "both",
    currency: "USD",
    fees: NOT_PROVIDED,
    nameMatch: nameMatchRequired,
    verification: NOT_PROVIDED,
    geo: NOT_PROVIDED,
    detail:
      "Local bank transfer. Settles in 1–3 business days; per-transaction cap $25,000.",
  },
  {
    name: "USDT (Tether)",
    category: "crypto",
    deposit: "Instant",
    payout: "Instant",
    processing: "Instant",
    minimum: "$20",
    maximum: "$50,000",
    dailyCap: NOT_PROVIDED,
    directions: "both",
    currency: "USD",
    fees: NOT_PROVIDED,
    nameMatch: nameMatchRequired,
    verification: NOT_PROVIDED,
    geo: NOT_PROVIDED,
    detail: "Tether (USDT). Instant; per-transaction cap $50,000.",
  },
  {
    name: "Whish Money",
    category: "wallet",
    deposit: "Instant",
    payout: "Instant",
    processing: "Instant",
    minimum: "$25",
    maximum: "$5,000",
    dailyCap: "$10,000",
    directions: "both",
    currency: "USD",
    fees: NOT_PROVIDED,
    nameMatch: nameMatchRequired,
    verification: NOT_PROVIDED,
    geo: NOT_PROVIDED,
    detail:
      "Whish Money wallet. Instant; $5,000 per transaction, $10,000 daily cap.",
  },
  {
    name: "OMT",
    category: "wallet",
    deposit: "Instant",
    payout: "Instant",
    processing: "Instant",
    minimum: "$25",
    maximum: "$5,000",
    dailyCap: "$10,000",
    sharedTerms: true,
    directions: "both",
    currency: "USD",
    fees: NOT_PROVIDED,
    nameMatch: nameMatchRequired,
    verification: NOT_PROVIDED,
    geo: NOT_PROVIDED,
    detail:
      "OMT. Shown with the same terms as Whish Money pending confirmation.",
  },
  {
    name: "BOB Finance",
    category: "wallet",
    deposit: "Instant",
    payout: "Instant",
    processing: "Instant",
    minimum: "$25",
    maximum: "$5,000",
    dailyCap: "$10,000",
    sharedTerms: true,
    directions: "both",
    currency: "USD",
    fees: NOT_PROVIDED,
    nameMatch: nameMatchRequired,
    verification: NOT_PROVIDED,
    geo: NOT_PROVIDED,
    detail:
      "BOB Finance. Shown with the same terms as Whish Money pending confirmation.",
  },
];

export const paymentDirectionLabels: Record<PaymentDirection, string> = {
  deposits: "Deposits only",
  withdrawals: "Withdrawals only",
  both: "Deposits and withdrawals",
};

export const paymentCategoryLabels: Record<PaymentMethod["category"], string> =
  {
    card: "Cards & mobile wallets",
    bank: "Bank transfer",
    wallet: "E-wallets",
    crypto: "Cryptocurrency",
  };

export type Stage = {
  index: string;
  kicker: string;
  title: string;
  body: string;
  points: string[];
};

export const howItWorksStages: Stage[] = [
  {
    index: "01",
    kicker: "Choose",
    title: "Pick a challenge",
    body: "Select the account size and platform that match how you actually trade. Every tier runs the same rulebook, so scale is the only variable.",
    points: [
      "$10,000 to $200,000 in five tiers",
      "MetaTrader 5, cTrader or the Web Terminal",
      "Instant activation on card and crypto",
    ],
  },
  {
    index: "02",
    kicker: "Prove",
    title: "Pass Phase 1",
    body: "Reach the profit target for your tier while staying inside a 5% daily and 10% overall drawdown. There is no calendar deadline — only a four-day minimum.",
    points: [
      "8–10% profit target by tier",
      "5% max daily drawdown, 10% overall",
      "Minimum 4 trading days, no time limit",
    ],
  },
  {
    index: "03",
    kicker: "Verify",
    title: "Clear Phase 2 and KYC",
    body: "The target halves to 4–5% under identical risk limits. Upload a photo ID and a proof of address once, inside the portal, and we review it the same business day.",
    points: [
      "4–5% profit target, same drawdown limits",
      "Government ID plus proof of address",
      "Typically reviewed within a few hours",
    ],
  },
  {
    index: "04",
    kicker: "Get paid",
    title: "Trade funded and withdraw",
    body: "Your funded account goes live and payouts run bi-weekly, or weekly on Professional. Approved requests are released within 24 to 48 hours.",
    points: [
      "Keep 80% to 90% of every dollar earned",
      "Evaluation fee refunded with the first payout",
      "Scale to $2,000,000 on consistent performance",
    ],
  },
];

export type Differentiator = {
  title: string;
  body: string;
  /** lucide-react icon name resolved by the consuming component. */
  icon:
    | "ShieldCheck"
    | "Zap"
    | "Clock"
    | "LayoutDashboard"
    | "Monitor"
    | "GraduationCap"
    | "Scale"
    | "Globe"
    | "Rocket";
};

export const differentiators: Differentiator[] = [
  {
    title: "Institutional-grade infrastructure",
    body: "Tier-1 liquidity, segregated client funds and bank-level encryption on every tier — the $10K account routes through the same bridge as the $200K one.",
    icon: "ShieldCheck",
  },
  {
    title: "Rules enforced server-side",
    body: "Drawdown limits are evaluated at the platform, not reviewed after the fact. You always know exactly where you stand, and no breach is ever adjudicated by hand.",
    icon: "Scale",
  },
  {
    title: "Payouts in 24 to 48 hours",
    body: "Bi-weekly cycles as standard, weekly on Professional. We absorb the processing fee on every rail, so the amount you request is the amount you receive.",
    icon: "Clock",
  },
  {
    title: "No time limit on either phase",
    body: "Only a four-day minimum. Nothing forces you into a marginal setup to beat a clock, which is the single most common reason evaluations fail elsewhere.",
    icon: "Zap",
  },
  {
    title: "One account, every asset class",
    body: "Forex, metals, energy, indices, share CFDs and crypto from a single login. No separate permissions, no per-class add-ons, no surprise restrictions.",
    icon: "Globe",
  },
  {
    title: "Trade on your platform",
    body: "MetaTrader 5, cTrader and a browser-based Web Terminal all connect to the same funded account. Run them side by side if that is how you work.",
    icon: "Monitor",
  },
  {
    title: "A portal that tells the truth",
    body: "Live drawdown headroom, trading-day count, KYC status and full payout history in one dashboard, updated as your positions move.",
    icon: "LayoutDashboard",
  },
  {
    title: "Scaling published up front",
    body: "Hit 10% across two consecutive payout cycles and your capital doubles, to a $2,000,000 ceiling. Your split rises with it and never decreases.",
    icon: "Rocket",
  },
  {
    title: "Education that continues after funding",
    body: "Structured courses, weekly desk notes and a glossary written against our own rulebook. Funding is the start of the relationship, not the end.",
    icon: "GraduationCap",
  },
];

export type Platform = {
  name: string;
  slug: string;
  tagline: string;
  body: string;
  best: string;
  features: string[];
  spec: { label: string; value: string }[];
};

export const platforms: Platform[] = [
  {
    name: "MetaTrader 5",
    slug: "mt5",
    tagline: "The institutional standard",
    body: "The platform most traders already know, connected to our bridge with full expert-advisor support and no execution restrictions.",
    best: "Algorithmic traders and anyone migrating an existing MT5 workflow",
    features: [
      "Expert advisors and custom indicators",
      "21 timeframes and 38 built-in indicators",
      "Depth of market and one-click execution",
      "Strategy tester with real tick data",
      "Desktop, mobile and web builds",
    ],
    spec: [
      { label: "Order types", value: "6" },
      { label: "Charting timeframes", value: "21" },
      { label: "Automation", value: "MQL5 / EAs" },
      { label: "Hedging", value: "Permitted" },
    ],
  },
  {
    name: "cTrader",
    slug: "ctrader",
    tagline: "Depth-of-market native",
    body: "Level II pricing, precise partial fills and a cleaner order ticket. The choice when execution quality matters more than plugin breadth.",
    best: "Discretionary scalpers and order-flow traders",
    features: [
      "Full Level II depth of market",
      "cBots written in C#",
      "Detachable multi-monitor charting",
      "Advanced take-profit and stop laddering",
      "Native macOS build",
    ],
    spec: [
      { label: "Order types", value: "8" },
      { label: "Charting timeframes", value: "26" },
      { label: "Automation", value: "cAlgo / C#" },
      { label: "Hedging", value: "Permitted" },
    ],
  },
  {
    name: "Web Terminal",
    slug: "web",
    tagline: "Nothing to install",
    body: "A browser terminal that connects to the same live account. Open a position from any machine without carrying a platform install with you.",
    best: "Traders on locked-down or shared machines",
    features: [
      "Runs in any modern browser",
      "Shared watchlists with the desktop platforms",
      "Integrated economic calendar",
      "Live drawdown headroom in the header",
      "Touch-optimised on tablets",
    ],
    spec: [
      { label: "Order types", value: "4" },
      { label: "Charting timeframes", value: "12" },
      { label: "Automation", value: "Not supported" },
      { label: "Hedging", value: "Permitted" },
    ],
  },
];

export type ScalingStep = {
  milestone: string;
  capital: string;
  split: string;
  note: string;
};

export const scalingPlan: ScalingStep[] = [
  {
    milestone: "Funded",
    capital: "Starting allocation",
    split: "80–90%",
    note: "Your tier's split applies from the first payout cycle.",
  },
  {
    milestone: "+10% over two cycles",
    capital: "2× allocation",
    split: "+0–5%",
    note: "Capital doubles and any tier below 90% moves up one step.",
  },
  {
    milestone: "+10% again",
    capital: "4× allocation",
    split: "90%",
    note: "Every scaled account reaches the 90% split at this stage.",
  },
  {
    milestone: "Sustained performance",
    capital: "Up to $2,000,000",
    split: "90%",
    note: "The ceiling is ten doublings. Your split never decreases.",
  },
];

export type AddOn = {
  code: string;
  name: string;
  description: string;
  /** Fraction of the base evaluation fee. */
  priceMultiplier: number;
  effect: string;
};

export const challengeAddOns: AddOn[] = [
  {
    code: "split-90",
    name: "90% profit split",
    description:
      "Lift the split to 90% from your very first payout, regardless of tier.",
    priceMultiplier: 0.3,
    effect: "Profit split → 90%",
  },
  {
    code: "payout-weekly",
    name: "Weekly payouts",
    description:
      "Move from the bi-weekly cycle to a weekly one, as standard on Professional.",
    priceMultiplier: 0.18,
    effect: "Payout cycle → weekly",
  },
  {
    code: "drawdown-8",
    name: "8% overall drawdown",
    description:
      "Trade a tighter risk envelope in exchange for a reduced Phase 1 target.",
    priceMultiplier: 0.12,
    effect: "Phase 1 target −2%, overall drawdown → 8%",
  },
  {
    code: "no-min-days",
    name: "No minimum trading days",
    description:
      "Remove the four-day floor and take the funded account the moment you hit target.",
    priceMultiplier: 0.15,
    effect: "Minimum trading days → 0",
  },
];

export const companyStats = [
  { value: "50,000+", label: "Evaluations issued" },
  { value: "142", label: "Countries served" },
  { value: "$38M+", label: "Paid to traders" },
  { value: "4.7 / 5", label: "Average trader rating" },
] as const;
