/**
 * Curriculum, desk-session cadence and glossary for the Trading Academy.
 *
 * Copy lives here as plain strings rather than JSX so the long-form prose
 * never has to fight `react/no-unescaped-entities`, and so the chatbot can
 * read the same source the page renders.
 */

export type CourseLevel = "beginner" | "intermediate" | "advanced";

export const courseLevels = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
] as const;

export const levelLabels: Record<CourseLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export type CourseTrack =
  | "Foundations"
  | "Risk & Position Sizing"
  | "Technical Execution"
  | "Capital & Discipline"
  | "Multi-Asset Specialisation";

export const courseTracks: CourseTrack[] = [
  "Foundations",
  "Risk & Position Sizing",
  "Technical Execution",
  "Capital & Discipline",
  "Multi-Asset Specialisation",
];

export type Course = {
  slug: string;
  track: CourseTrack;
  level: CourseLevel;
  title: string;
  summary: string;
  /** Always equal to `modules.length`; kept explicit for readability. */
  moduleCount: number;
  hours: number;
  modules: string[];
};

export const courses: Course[] = [
  /* ---------------------------------------------------------------- Foundations */
  {
    slug: "market-mechanics",
    track: "Foundations",
    level: "beginner",
    title: "Market Mechanics and Order Types",
    summary:
      "What a contract for difference actually is, how it is priced, and which order sends the instruction you meant to send.",
    moduleCount: 8,
    hours: 3.5,
    modules: [
      "How a CFD is priced and what you are exposed to",
      "Bid, ask, mid and the real cost of crossing the spread",
      "Market, limit, stop and stop-limit orders compared",
      "Reading depth of market on cTrader",
      "Slippage and why a fill can differ from the chart",
      "Contract sizes across forex, metals, indices and crypto",
      "Holding positions overnight and the daily rollover",
      "Placing and amending your first order on the Web Terminal",
    ],
  },
  {
    slug: "pips-lots-leverage",
    track: "Foundations",
    level: "beginner",
    title: "Pips, Lots and Leverage Arithmetic",
    summary:
      "The arithmetic every serious trader does in their head before an order goes in, worked through on real contract specifications.",
    moduleCount: 7,
    hours: 3,
    modules: [
      "Pips, points and ticks: what moves and by how much",
      "Standard, mini and micro lots in practice",
      "Pip value on USD-quoted pairs and on crosses",
      "Notional exposure versus margin actually required",
      "What 1:100 leverage changes, and what it does not",
      "Margin level, margin call and the stop-out threshold",
      "Ten worked sizing examples across four asset classes",
    ],
  },
  {
    slug: "session-structure",
    track: "Foundations",
    level: "beginner",
    title: "Sessions, Liquidity and the Trading Clock",
    summary:
      "Liquidity is not constant. This course maps the trading day in UTC and matches instrument choice to the hours that actually pay.",
    moduleCount: 6,
    hours: 2.5,
    modules: [
      "The Sydney, Tokyo, London and New York clock in UTC",
      "Why the London to New York overlap carries the deepest book",
      "Spread behaviour at the Asian open and at daily rollover",
      "Matching instrument choice to session volatility",
      "Holiday calendars, half-days and thin-book traps",
      "Building a session plan you can repeat every week",
    ],
  },

  /* ------------------------------------------------- Risk & Position Sizing */
  {
    slug: "risk-first-sizing",
    track: "Risk & Position Sizing",
    level: "intermediate",
    title: "Risk-First Position Sizing",
    summary:
      "Decide what you are willing to lose, then let the stop distance determine the size. The single habit that separates traders who last from those who do not.",
    moduleCount: 8,
    hours: 4,
    modules: [
      "Fixed-fractional risk and why it survives losing streaks",
      "Turning a stop distance into a lot size in three steps",
      "Sizing gold, crude and index CFDs without a pip calculator",
      "The drawdown recovery table, and why 30% costs 42.9%",
      "Correlation: when three positions are really one position",
      "Sizing down into a high-impact release and back up after",
      "Building a one-page pre-trade sizing sheet",
      "Auditing last month for sizing drift",
    ],
  },
  {
    slug: "expectancy-and-review",
    track: "Risk & Position Sizing",
    level: "intermediate",
    title: "Expectancy, Journaling and Review",
    summary:
      "How to tell a losing month from a broken edge, using your own trade list rather than a feeling about it.",
    moduleCount: 6,
    hours: 3,
    modules: [
      "Win rate, R-multiple and why expectancy beats accuracy",
      "A journal that records the decision, not just the result",
      "Tagging setups so you can retire the ones that lose",
      "Running a Monte Carlo simulation on your own trades",
      "Separating ordinary variance from a broken edge",
      "The monthly review the desk runs on its own book",
    ],
  },

  /* ---------------------------------------------------- Technical Execution */
  {
    slug: "structure-and-levels",
    track: "Technical Execution",
    level: "intermediate",
    title: "Market Structure and Level Selection",
    summary:
      "Mark the chart once, mark it well, and stop moving the lines. A repeatable process for choosing the handful of prices that matter.",
    moduleCount: 8,
    hours: 4,
    modules: [
      "Swing structure: higher highs, lower lows and the failure case",
      "Marking levels once and refusing to move them intraday",
      "Supply and demand zones versus single-price lines",
      "Multi-timeframe alignment without analysis paralysis",
      "Volume and tick volume: what MetaTrader actually shows you",
      "ATR-based stop placement instead of round numbers",
      "Anatomy of a false break, and how to fade one safely",
      "A pre-market level routine that takes twenty minutes",
    ],
  },
  {
    slug: "execution-quality",
    track: "Technical Execution",
    level: "intermediate",
    title: "Execution Quality and Trade Management",
    summary:
      "Two traders with the same idea can post very different results. This course is about the difference, measured rather than assumed.",
    moduleCount: 7,
    hours: 3,
    modules: [
      "Entry triggers: resting limit at the level versus confirmation",
      "Partial fills, laddered entries and average price",
      "Where a trailing stop helps and where it quietly costs you",
      "Scaling out versus holding for a single target",
      "Managing an open position through a high-impact release",
      "Measuring your own slippage across sessions and instruments",
      "Building a post-trade execution scorecard",
    ],
  },

  /* -------------------------------------------------- Capital & Discipline */
  {
    slug: "account-playbook",
    track: "Capital & Discipline",
    level: "advanced",
    title: "The Account Growth Playbook",
    summary:
      "A stage-by-stage plan for growing a trading account, written against our published specifications rather than generic internet advice.",
    moduleCount: 8,
    hours: 3.5,
    modules: [
      "Choosing an account type that matches your average risk per trade",
      "Sizing a first deposit you can afford to put at risk",
      "Why a monthly return target is a floor and never a quota",
      "Compounding versus withdrawing, and when each is correct",
      "Every prohibited practice and the reason behind it",
      "Passing KYC first time: documents, names and dates",
      "What changes when the account doubles in size",
      "Knowing when to reduce size and when to stop trading",
    ],
  },
  {
    slug: "withdrawal-strategy",
    track: "Capital & Discipline",
    level: "advanced",
    title: "Withdrawal and Compounding Strategy",
    summary:
      "Treating a trading account as a business line: when to withdraw, when to compound, and how to grow the balance without enlarging your risk per trade.",
    moduleCount: 6,
    hours: 2.5,
    modules: [
      "How free margin limits what you can actually withdraw",
      "Withdrawing versus compounding, and the tax of doing both badly",
      "Paying yourself a salary from a trading account",
      "Trading a larger account without enlarging your risk per trade",
      "Running several accounts under one verified profile",
      "Building a personal profit and loss statement for the year",
    ],
  },
  {
    slug: "psychology-under-leverage",
    track: "Capital & Discipline",
    level: "advanced",
    title: "Psychology Under Leverage",
    summary:
      "Leverage changes behaviour in measurable ways, and so does a balance large enough to matter. This course names those changes and gives you a countermeasure for each.",
    moduleCount: 6,
    hours: 2.5,
    modules: [
      "Why leverage changes risk behaviour in both directions",
      "Pre-commitment devices that survive a bad morning",
      "Tilt: four signatures and the intervention for each",
      "Boredom risk in a quiet week, and how it shows up in the journal",
      "Performance routines borrowed from institutional desks",
      "Writing a rule you will still be following in month six",
    ],
  },

  /* ------------------------------------------ Multi-Asset Specialisation */
  {
    slug: "gold-and-metals",
    track: "Multi-Asset Specialisation",
    level: "advanced",
    title: "Gold and the Precious Metals Complex",
    summary:
      "XAU/USD is the most traded instrument on the desk and the most common cause of an unexpected drawdown. Here is how it behaves.",
    moduleCount: 7,
    hours: 3,
    modules: [
      "What drives XAU/USD: real yields, the dollar and physical flow",
      "Contract specification and dollar-per-point on metals",
      "Volatility regimes in gold and how to size for each",
      "Trading gold through CPI and FOMC prints",
      "Silver’s beta to gold and why it punishes late entries",
      "Platinum and palladium: thin books and wide spreads",
      "A metals session template for the London to New York overlap",
    ],
  },
  {
    slug: "indices-and-energy",
    track: "Multi-Asset Specialisation",
    level: "advanced",
    title: "Indices and Energy",
    summary:
      "Three US index CFDs with three different personalities, plus the crude and natural gas contracts that punish position sizing errors fastest.",
    moduleCount: 7,
    hours: 3,
    modules: [
      "Cash index CFDs, fair value and the overnight gap",
      "US30, NAS100 and SPX500 as three distinct instruments",
      "Index breadth as a continuation filter",
      "WTI versus Brent, and what the spread between them says",
      "Reading the weekly crude inventory report as it prints",
      "Natural gas: seasonality and the cost of holding it",
      "Sizing index and energy risk against a 5% daily limit",
    ],
  },
  {
    slug: "crypto-and-correlation",
    track: "Multi-Asset Specialisation",
    level: "advanced",
    title: "Crypto and Cross-Asset Correlation",
    summary:
      "A 24/7 market traded inside a 24/5 risk framework, and what a rolling correlation to equities means for a portfolio of open positions.",
    moduleCount: 6,
    hours: 2.5,
    modules: [
      "Trading a 24/7 market inside a 24/5 risk framework",
      "Why crypto leverage is capped at 1:5 on every tier",
      "Weekend behaviour and the Monday open",
      "Bitcoin’s rolling correlation with the Nasdaq",
      "Sizing a high-volatility instrument to a fixed dollar risk",
      "Carrying crypto exposure through the 00:00 UTC daily reset",
    ],
  },
];

export const totalModules = courses.reduce((sum, c) => sum + c.moduleCount, 0);
export const totalHours = courses.reduce((sum, c) => sum + c.hours, 0);

export function coursesByLevel(level: CourseLevel) {
  return courses.filter((course) => course.level === level);
}

/* ------------------------------------------------------------------ Path */

export type LearningPathStage = {
  step: string;
  title: string;
  /** Course slugs, in the order they should be taken. */
  courses: string[];
  outcome: string;
  why: string;
};

export const learningPath: LearningPathStage[] = [
  {
    step: "01",
    title: "Get the arithmetic right",
    courses: ["market-mechanics", "pips-lots-leverage", "session-structure"],
    outcome:
      "You can state your exposure, your pip value and your worst case before you click buy.",
    why: "Almost every blown account we review contains at least one position that was sized by feel. The arithmetic has to be automatic before anything else is worth learning.",
  },
  {
    step: "02",
    title: "Build the risk framework",
    courses: ["risk-first-sizing"],
    outcome:
      "A written risk budget that keeps you inside a 5% daily and 10% overall drawdown on your worst day, not your average one.",
    why: "The rulebook is a constraint you design around, not a surprise you discover. Traders who set a personal daily stop below the hard limit almost never breach it.",
  },
  {
    step: "03",
    title: "Sharpen the entry",
    courses: ["structure-and-levels", "execution-quality"],
    outcome:
      "A repeatable pre-market routine and a measurable record of how well you execute the plan you wrote.",
    why: "Technique comes third on purpose. A precise entry inside a broken risk framework simply loses money more accurately.",
  },
  {
    step: "04",
    title: "Learn to review",
    courses: ["expectancy-and-review"],
    outcome:
      "Enough evidence to tell a variance drawdown apart from an edge that has stopped working.",
    why: "You cannot improve a process you are not measuring, and you cannot keep trading a strategy you cannot defend with numbers.",
  },
  {
    step: "05",
    title: "Grow the account",
    courses: ["account-playbook", "psychology-under-leverage"],
    outcome:
      "A growth plan, a KYC checklist and an honest read on how leverage changes your behaviour.",
    why: "A live account with real money is a different game from a demo. Pacing and prohibited practices are worth studying before the first trade, not after the first bad week.",
  },
  {
    step: "06",
    title: "Specialise and scale",
    courses: [
      "withdrawal-strategy",
      "gold-and-metals",
      "indices-and-energy",
      "crypto-and-correlation",
    ],
    outcome:
      "Depth in the two or three instruments you actually trade, and a plan for the account after this one.",
    why: "Growing an account rewards specialisation, not breadth. Pick the markets that suit your hours and learn their contract specifications properly.",
  },
];

/* -------------------------------------------------------------- Desk sessions */

export type DeskSession = {
  title: string;
  cadence: string;
  duration: string;
  format: string;
  body: string;
};

export const deskSessions: DeskSession[] = [
  {
    title: "Market Open Briefing",
    cadence: "Every Monday, 07:00 UTC",
    duration: "30 minutes",
    format: "Live webinar, recorded",
    body: "The week ahead in one sitting: the scheduled high-impact releases, where the desk sees liquidity building, and the instruments most likely to produce clean structure. Recording is posted to the portal within two hours.",
  },
  {
    title: "Risk Clinic",
    cadence: "Every Wednesday, 14:00 UTC",
    duration: "45 minutes",
    format: "Live webinar with open Q&A",
    body: "A working session on position sizing and drawdown management. Bring an anonymised trade list and the risk desk will walk through the sizing decisions on screen. This is the session most closely tied to the published rulebook.",
  },
  {
    title: "Client Trader Q&A",
    cadence: "Every Thursday, 16:00 UTC",
    duration: "60 minutes",
    format: "Live, clients with a funded account",
    body: "Open floor for clients trading a live balance. Withdrawal mechanics, margin behaviour, platform quirks and specification questions, answered by the people who administer them rather than by a support script.",
  },
  {
    title: "Friday Desk Note",
    cadence: "Every Friday, 15:00 UTC",
    duration: "A five-minute read",
    format: "Written, emailed and posted to the portal",
    body: "A short written note closing the week: what actually moved, which correlations held and which broke, and one sizing or execution lesson drawn from the week’s trade flow across the book.",
  },
];

/* ------------------------------------------------------------------ Glossary */

export type GlossaryCategory =
  | "Accounts"
  | "Execution"
  | "Risk"
  | "Instruments"
  | "Compliance";

export const glossaryCategories: GlossaryCategory[] = [
  "Accounts",
  "Execution",
  "Risk",
  "Instruments",
  "Compliance",
];

export type GlossaryTerm = {
  term: string;
  category: GlossaryCategory;
  definition: string;
};

/**
 * Definitions are written against our own published specifications, not against a
 * generic textbook, so the numbers quoted here match the ones on /accounts.
 */
export const glossary: GlossaryTerm[] = [
  {
    term: "Allocation cap",
    category: "Accounts",
    definition:
      "The maximum firm capital you may hold across all of your accounts at once, set at $400,000 in combined starting allocation. Scaling milestones are the only route above it, and they are granted per account by the risk desk.",
  },
  {
    term: "AML",
    category: "Compliance",
    definition:
      "Anti-money laundering: the controls that stop the withdrawal rail being used to move criminal proceeds. In practice it means identity verification before funding, sanctions screening on every account, and source-of-funds questions on unusually large deposits.",
  },
  {
    term: "Ask",
    category: "Execution",
    definition:
      "The price at which you can buy an instrument right now. It sits above the bid, and the difference between the two is the spread you pay to open a long position.",
  },
  {
    term: "ATR",
    category: "Risk",
    definition:
      "Average True Range, a measure of how far an instrument typically moves over a chosen period. Sizing a stop as a multiple of ATR adapts your risk to current volatility instead of to a round number on the chart.",
  },
  {
    term: "Balance",
    category: "Accounts",
    definition:
      "The cash figure on your account excluding any open positions. Balance changes when a trade is closed or a deposit or withdrawal settles, while equity moves with the open positions.",
  },
  {
    term: "Bid",
    category: "Execution",
    definition:
      "The price at which you can sell an instrument right now. Quoted platforms draw their charts from the bid, which is why a long position appears to open slightly below the candle you clicked.",
  },
  {
    term: "Breach",
    category: "Accounts",
    definition:
      "A violation of a hard risk limit, most often the 5% maximum daily drawdown or the 10% maximum overall drawdown. Breaches are detected server-side and close the account at the moment they occur; they are never adjudicated by hand afterwards.",
  },
  {
    term: "Chargeback",
    category: "Compliance",
    definition:
      "A payment reversal initiated through your card issuer rather than through us. Raising one against a credited deposit freezes every associated account pending investigation, so a withdrawal request through support is always the faster route.",
  },
  {
    term: "Contract size",
    category: "Instruments",
    definition:
      "The quantity of the underlying that one lot represents. One standard forex lot is 100,000 units of the base currency; one gold lot is 100 troy ounces. Contract size is what turns a price move into a profit or loss figure.",
  },
  {
    term: "Copy trading",
    category: "Accounts",
    definition:
      "Mirroring orders from one account to another. Copying between your own accounts is permitted provided the combined exposure stays inside your margin. Copying a third-party signal service into a live account is permitted but entirely at your own risk.",
  },
  {
    term: "Correlation",
    category: "Risk",
    definition:
      "The degree to which two instruments move together. Three long positions in EUR/USD, GBP/USD and AUD/USD are close to a single short-dollar position, and should be risk-budgeted as one idea rather than three.",
  },
  {
    term: "Depth of market",
    category: "Execution",
    definition:
      "A view of resting buy and sell orders at each price level away from the current quote, also called Level II. cTrader exposes it natively; it tells you where size is waiting rather than where price has already been.",
  },
  {
    term: "Equity",
    category: "Accounts",
    definition:
      "Your balance plus the floating profit and loss on every open position. Equity is the figure the margin check runs against, which is why an unrealised loss can trigger a margin call before you have closed anything.",
  },
  {
    term: "Expectancy",
    category: "Risk",
    definition:
      "The average result of a trade in your system, expressed in R. A 40% win rate at 3R with 1R losses has an expectancy of +0.6R, which is a better business than a 70% win rate at 0.5R.",
  },
  {
    term: "Expert advisor",
    category: "Execution",
    definition:
      "An automated strategy running inside MetaTrader, written in MQL5. Expert advisors, custom indicators and algorithmic execution are permitted on every account type, provided they trade the market rather than the pricing feed.",
  },
  {
    term: "Free margin",
    category: "Accounts",
    definition:
      "Equity minus the margin currently posted against open positions. It is the figure that determines both how much more you can open and how much you can withdraw right now.",
  },
  {
    term: "Gap",
    category: "Risk",
    definition:
      "A jump between the close of one session and the open of the next with no tradable price in between. Stops do not protect you inside a gap, which is the main reason weekend exposure has to be sized more conservatively than intraday exposure.",
  },
  {
    term: "Hedging",
    category: "Accounts",
    definition:
      "Holding opposing positions in the same or a closely related instrument. Hedging inside a single account is permitted on every account type. Hedging the same exposure between two accounts, or between traders, is a prohibited practice.",
  },
  {
    term: "KYC",
    category: "Compliance",
    definition:
      "Know Your Customer: the identity check completed before a first withdrawal is released. It requires a government photo identity document and a proof of address dated within the last three months, uploaded once inside the client portal.",
  },
  {
    term: "Latency arbitrage",
    category: "Accounts",
    definition:
      "Exploiting the delay between a price appearing on a faster venue and appearing in our feed. It extracts money from the pricing mechanism rather than from the market, and it is prohibited on every account regardless of profitability.",
  },
  {
    term: "Leverage",
    category: "Instruments",
    definition:
      "The ratio between your notional exposure and the margin it consumes. We offer up to 1:100 on forex, 1:50 on metals and indices, 1:200 on energies, 1:100 on share CFDs and 1:5 on crypto. Leverage changes margin, never risk.",
  },
  {
    term: "Limit order",
    category: "Execution",
    definition:
      "An instruction to trade only at a specified price or better. A limit order will never fill worse than the price you named, but it may not fill at all if the market trades through the level without leaving size behind.",
  },
  {
    term: "Liquidity",
    category: "Execution",
    definition:
      "How much size can trade without moving the price. Deep liquidity means tight spreads and predictable fills; thin liquidity is where slippage, spread widening and false breaks come from.",
  },
  {
    term: "Lot",
    category: "Instruments",
    definition:
      "The standard unit of trade size. One standard lot is 100,000 units of the base currency in forex; a mini lot is 0.1 and a micro lot 0.01 of that. Every instrument has its own contract size behind the same lot label.",
  },
  {
    term: "Margin",
    category: "Instruments",
    definition:
      "The portion of account equity held aside to support an open position, determined by notional exposure divided by leverage. Margin is a collateral requirement, not a cost, and it is released when the position closes.",
  },
  {
    term: "Margin call",
    category: "Risk",
    definition:
      "The warning state entered when equity falls to 100% of used margin. It is a request to add funds or reduce exposure; positions are closed when the account reaches its 5% loss limit.",
  },
  {
    term: "Market order",
    category: "Execution",
    definition:
      "An instruction to trade immediately at the best available price. It guarantees a fill but not a price, so in fast conditions the difference between the quote you saw and the fill you receive shows up as slippage.",
  },
  {
    term: "Mid",
    category: "Execution",
    definition:
      "The midpoint between bid and ask. Analytics, correlation studies and most published charts use mid because it strips out the spread, which is why a backtest run on mid overstates a live result.",
  },
  {
    term: "Minimum trading days",
    category: "Accounts",
    definition:
      "The four separate days on which at least one position must be opened before a phase can be completed. It is a floor, not a target: there is no calendar deadline on either phase, so there is never a reason to force a trade to satisfy it.",
  },
  {
    term: "Notional exposure",
    category: "Instruments",
    definition:
      "The full market value controlled by a position: lots multiplied by contract size multiplied by price. Two lots of EUR/USD at 1.0850 is $217,000 of notional exposure regardless of the margin it consumes.",
  },
  {
    term: "Negative balance protection",
    category: "Accounts",
    definition:
      "The undertaking that a retail account cannot fall below zero. If a gap takes an account negative before positions can be closed, the balance is reset to zero at our expense rather than invoiced to the client.",
  },
  {
    term: "Pip",
    category: "Instruments",
    definition:
      "The conventional smallest quoted increment on a currency pair: 0.0001 on most majors and 0.01 on yen crosses. On a standard lot of a USD-quoted pair one pip is worth $10.",
  },
  {
    term: "Point",
    category: "Instruments",
    definition:
      "The smallest increment the platform can quote, one decimal place finer than a pip on a five-digit feed. Ten points make one pip on EUR/USD. Indices and metals are usually described in points rather than pips.",
  },
  {
    term: "Margin level",
    category: "Accounts",
    definition:
      "Equity divided by used margin, expressed as a percentage. It shows how close the account is to a margin call; the account's stop-out is triggered at its 5% loss limit.",
  },
  {
    term: "Proof of address",
    category: "Compliance",
    definition:
      "A utility bill, bank statement or government letter dated within the last three months showing your name and residential address. It is one of the two documents required at KYC, alongside a photo identity document.",
  },
  {
    term: "R-multiple",
    category: "Risk",
    definition:
      "A trade result expressed in units of the risk taken. Risking $500 and making $1,500 is +3R. Reporting in R rather than in dollars makes results comparable across account sizes and across scaling steps.",
  },
  {
    term: "Rollover",
    category: "Instruments",
    definition:
      "The daily point at which open positions are carried into the next value date. It falls at 21:00 UTC on most instruments and can be a thin, wide-spread period, but Connect Funded does not apply swap fees.",
  },
  {
    term: "Sanctions screening",
    category: "Compliance",
    definition:
      "Checking an applicant and their payment instruments against international sanctions and politically exposed person lists. It runs at registration and again periodically; a positive match blocks funding until it is resolved.",
  },
  {
    term: "Session overlap",
    category: "Execution",
    definition:
      "The window in which two major centres trade simultaneously. The London and New York overlap, roughly 12:00 to 16:00 UTC, carries the deepest book and the tightest spreads of the day on forex, metals and US indices.",
  },
  {
    term: "Slippage",
    category: "Execution",
    definition:
      "The difference between the price you expected and the price you received. It is a normal consequence of trading a moving market with a market order, and it is worth measuring per instrument and per session rather than treating as noise.",
  },
  {
    term: "Source of funds",
    category: "Compliance",
    definition:
      "Evidence of where deposited funds came from. It is requested only where a deposit pattern or a sanctions flag makes it necessary, and it is held under the retention periods set out in the AML policy.",
  },
  {
    term: "Spread",
    category: "Execution",
    definition:
      "The gap between bid and ask, and the immediate cost of opening a position. We quote raw spreads from 0.0 pips on EUR/USD; spreads widen at rollover, into high-impact releases and in thin holiday sessions.",
  },
  {
    term: "Stop order",
    category: "Execution",
    definition:
      "An instruction that becomes a market order once a trigger price trades. It guarantees that you act, not that you get a price, so a protective stop in a gapping market can fill materially worse than the level you set.",
  },
  {
    term: "Stop-out",
    category: "Risk",
    definition:
      "The automatic closure of positions when the account reaches its 5% loss limit. Monitor your available risk and reduce exposure before reaching that threshold.",
  },
  {
    term: "Swap",
    category: "Instruments",
    definition:
      "A financing adjustment some brokers apply to positions held overnight. Connect Funded does not charge swap fees on its accounts.",
  },
  {
    term: "Tick",
    category: "Execution",
    definition:
      "One update of the price feed. Tick volume counts updates rather than contracts, so a MetaTrader volume histogram measures how busy the feed was, not how much size actually traded.",
  },
  {
    term: "Tick scalping",
    category: "Accounts",
    definition:
      "Taking repeated positions of a few ticks against quotes that are momentarily stale. Like latency arbitrage it targets the feed rather than the market, and it is prohibited on every account type.",
  },
  {
    term: "Trailing stop",
    category: "Execution",
    definition:
      "A stop that follows price by a fixed distance as a position moves in your favour. It locks in progress, and it also converts many winning trades into small ones, so it belongs on trend positions rather than on mean-reversion ones.",
  },
  {
    term: "Volatility",
    category: "Risk",
    definition:
      "The size of typical price movement over a period. It is the variable that should change your position size, because a fixed lot size on a quiet day and a violent one represents two completely different risks.",
  },
];

/** Every distinct first letter present in the glossary, ready for an index. */
export const glossaryLetters = Array.from(
  new Set(glossary.map((entry) => entry.term[0].toUpperCase())),
).sort();
