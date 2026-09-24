/**
 * Photography used across the marketing site. Every entry is an Unsplash
 * photo served from their CDN, which means no asset pipeline and no
 * generated art. Verify any replacement with:
 *   curl -sI "https://images.unsplash.com/<id>?w=1200"   →   HTTP 200
 */
const unsplash = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

export const marketingImages = {
  whyUs: {
    src: unsplash("photo-1486406146926-c627a92ad1ab", 1000),
    alt: "Glass and steel towers of a financial district seen from street level",
  },
  accountTiers: {
    src: unsplash("photo-1480714378408-67cf0d13bc1b", 1400),
    alt: "City avenue at golden hour seen from above",
  },
  testimonial: {
    src: unsplash("photo-1522071820081-009f0129c71c", 1200),
    alt: "Team working together around a desk of laptops",
  },
  about: {
    src: unsplash("photo-1444723121867-7a241cacace9", 1600),
    alt: "Dense city skyline at dusk",
  },
  platforms: {
    src: unsplash("photo-1642790106117-e829e14a795f", 1000),
    alt: "Trading charts open on a laptop on a dark desk",
  },
  /** Homepage live-trading band panel — multi-monitor desk, dark editorial. */
  homeTrading: {
    src: "/images/home-trading-panel.webp",
    alt: "Multi-monitor trading desk with live forex charts in a dark modern office",
  },
  /** Homepage funded evaluations band panel — trader at desk, indigo ambient. */
  homeFunded: {
    src: "/images/home-funded-panel.webp",
    alt: "Trader reviewing a funded evaluation dashboard at a modern desk",
  },
  education: {
    src: unsplash("photo-1456513080510-7bf3a84b82f8", 800),
    alt: "An open book and notes on a desk",
  },
  payments: {
    src: unsplash("photo-1563013544-824ae1b704d3", 1400),
    alt: "Paying by card on a laptop",
  },
  emptyState: {
    src: unsplash("photo-1497366754035-f200968a6e72", 600),
    alt: "A quiet, empty modern office",
  },
  /** Full-bleed funded landing hero — editorial desk work, not synthetic art. */
  heroFunded: {
    src: unsplash("photo-1486312338219-ce68d2c6f44d", 1920),
    alt: "Focused trader working through an evaluation at a laptop in natural daylight",
  },
  /** Full-bleed live-trading landing hero — real multi-monitor desk setup. */
  heroTrading: {
    src: unsplash("photo-1590283603385-17ffb3a7f29f", 1920),
    alt: "Trader at a multi-monitor desk with live market charts in a modern office",
  },
  /**
   * Four how-it-works stage frames on the home page, in order: choose, prove,
   * verify, get paid. Bright editorial photography — the section gradient keeps
   * type legible without flattening the image.
   */
  howItWorks: [
    {
      src: unsplash("photo-1556761175-5973dc0f32e7", 900),
      alt: "Team planning around a bright office table with laptops",
    },
    {
      src: unsplash("photo-1460925895917-afdab827c52f", 900),
      alt: "Analytics dashboard on a laptop in a sunlit workspace",
    },
    {
      src: unsplash("photo-1573496359142-b8d87734a5a2", 900),
      alt: "Professional reviewing onboarding documents in a bright office",
    },
    {
      src: unsplash("photo-1507679799987-c73779587ccf", 900),
      alt: "Business partners shaking hands after a successful deal",
    },
  ],
  /**
   * Four how-it-works stage frames for live trading (broker):
   * Stage 1: Register / Create profile
   * Stage 2: Verify / Complete KYC
   * Stage 3: Fund / Deposit trading balance
   * Stage 4: Trade / Live market execution
   */
  brokerHowItWorks: [
    {
      src: "/images/trading-how-it-works-1.webp",
      alt: "Professional registering a live trading account on a laptop in a bright modern office",
    },
    {
      src: "/images/trading-how-it-works-2.webp",
      alt: "Completing digital passport and KYC verification on a mobile device",
    },
    {
      src: "/images/trading-how-it-works-3.webp",
      alt: "Trader depositing trading funds with a payment card at their desk",
    },
    {
      src: "/images/trading-how-it-works-4.webp",
      alt: "Professional trader executing orders on multi-monitor live charts",
    },
  ],
} as const;

/**
 * Home-page testimonial portraits. Drop generated files at
 * `public/testimonials/{slug}.webp` and point `src` at the local path.
 */
export const testimonialPortraits = {
  "marwan-haddad": {
    src: unsplash("photo-1507003211169-0a1dd7228f2d", 400),
    alt: "Marwan Haddad, funded trader in the United Arab Emirates",
  },
  "renee-fontaine": {
    src: unsplash("photo-1494790108377-be9c29b29330", 400),
    alt: "Renée Fontaine, funded trader in France",
  },
  "amara-osei": {
    src: unsplash("photo-1534528741775-53994a69daeb", 400),
    alt: "Amara Osei, funded trader in Ghana",
  },
  "lukas-novak": {
    src: unsplash("photo-1500648767791-00dcc994a43e", 400),
    alt: "Lukas Novak, funded trader in Czechia",
  },
  "priya-raghunathan": {
    src: unsplash("photo-1438761681033-6461ffad8d80", 400),
    alt: "Priya Raghunathan, funded trader in Singapore",
  },
  "diego-ferreira": {
    src: unsplash("photo-1506794778202-cad84cf45f1d", 400),
    alt: "Diego Ferreira, funded trader in Brazil",
  },
} as const;

export function testimonialPortraitSlug(authorName: string) {
  return authorName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getTestimonialPortrait(authorName: string) {
  const slug = testimonialPortraitSlug(authorName);
  return (
    testimonialPortraits[slug as keyof typeof testimonialPortraits] ?? {
      src: unsplash("photo-1472099645785-5658abf4ff4e", 400),
      alt: `${authorName}, funded trader`,
    }
  );
}

/** Category imagery for market news cards. */
export const newsCategoryImages = {
  "Market Analysis": {
    src: unsplash("photo-1611974789855-9c2a0a7236a3", 900),
    alt: "Candlestick chart on a dark trading screen",
  },
  Forex: {
    src: unsplash("photo-1580519542036-c47de6196ba5", 900),
    alt: "Banknotes from several currencies laid side by side",
  },
  Commodities: {
    src: unsplash("photo-1610375461246-83df859d849d", 900),
    alt: "Stacked gold bullion bars",
  },
  Education: {
    src: unsplash("photo-1456513080510-7bf3a84b82f8", 900),
    alt: "An open book and notes on a desk",
  },
  Indices: {
    src: unsplash("photo-1640340434855-6084b1f4901c", 900),
    alt: "Index price charts on a wall of trading monitors",
  },
} as const;

export function getNewsCategoryImage(category: string) {
  return (
    newsCategoryImages[category as keyof typeof newsCategoryImages] ??
    newsCategoryImages["Market Analysis"]
  );
}
