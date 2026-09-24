/**
 * Curriculum, desk-session cadence and A–Z trading glossary.
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
  | "Funded-Account Discipline"
  | "Multi-Asset Specialisation";

export const courseTracks: CourseTrack[] = [
  "Foundations",
  "Risk & Position Sizing",
  "Technical Execution",
  "Funded-Account Discipline",
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
      "Swap, rollover and the daily financing stamp",
      "Placing and amending your first order on the Web Terminal",
    ],
  },
  {
    slug: "pips-lots-leverage",
    track: "Foundations",
    level: "beginner",
    title: "Pips, Lots and Leverage Arithmetic",
    summary:
      "The arithmetic every funded trader is expected to do in their head before an order goes in, worked through on real contract specifications.",
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
      "Decide what you are willing to lose, then let the stop distance determine the size. The single habit that separates funded traders from resets.",
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
    slug: "drawdown-engineering",
    track: "Risk & Position Sizing",
    level: "intermediate",
    title: "Engineering Around a 5% Daily Limit",
    summary:
      "The Connect Funded rulebook expressed as a risk budget: how the daily floor is computed, and how to trade underneath it deliberately.",
    moduleCount: 7,
    hours: 3.5,
    modules: [
      "How the 00:00 UTC reset computes your daily floor",
      "Floating profit and loss, equity, and the gap that ends evaluations",
      "Setting a personal daily stop below the hard 5% limit",
      "The 10% overall drawdown as a static, non-trailing line",
      "Budgeting risk by day, by week and by phase",
      "Recovering from a 3% day without revenge sizing",
      "Reading live drawdown headroom in the client portal",
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

  /* --------------------------------------------- Funded-Account Discipline */
  {
    slug: "evaluation-playbook",
    track: "Funded-Account Discipline",
    level: "advanced",
    title: "The Evaluation Playbook",
    summary:
      "A phase-by-phase plan for the Connect Funded evaluation, written against the published rulebook rather than generic prop-firm advice.",
    moduleCount: 8,
    hours: 3.5,
    modules: [
      "Choosing a tier that matches your average risk per trade",
      "Pacing a 10% Phase 1 target across four or more trading days",
      "Why the four-day minimum is a floor and never a target",
      "Phase 2 at half the target: a discipline problem, not a maths problem",
      "Every prohibited practice and the reason behind it",
      "Passing KYC first time: documents, names and dates",
      "What changes on the day an account is funded",
      "Reset decisions: when to restart and when to stop trading",
    ],
  },
  {
    slug: "payout-and-scaling",
    track: "Funded-Account Discipline",
    level: "advanced",
    title: "Payout Cadence and Scaling Strategy",
    summary:
      "Treating a funded account as a business line: when to withdraw, when to compound, and how to reach the next allocation without changing your risk.",
    moduleCount: 6,
    hours: 2.5,
    modules: [
      "How the bi-weekly cycle interacts with open positions",
      "Withdrawing versus compounding inside the allocation cap",
      "Reaching 10% across two consecutive cycles to trigger a doubling",
      "Trading a larger account without enlarging your risk per trade",
      "Running multiple accounts inside the $400,000 combined cap",
      "Building a personal profit and loss statement for the year",
    ],
  },
  {
    slug: "psychology-under-firm-capital",
    track: "Funded-Account Discipline",
    level: "advanced",
    title: "Psychology Under Firm Capital",
    summary:
      "Trading someone else’s money changes behaviour in measurable ways. This course names those changes and gives you a countermeasure for each.",
    moduleCount: 6,
    hours: 2.5,
    modules: [
      "Why firm capital changes risk behaviour in both directions",
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
    why: "Almost every failed evaluation we review contains at least one position that was sized by feel. The arithmetic has to be automatic before anything else is worth learning.",
  },
  {
    step: "02",
    title: "Build the risk framework",
    courses: ["risk-first-sizing", "drawdown-engineering"],
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
    title: "Trade the evaluation",
    courses: ["evaluation-playbook", "psychology-under-firm-capital"],
    outcome:
      "A phase plan, a KYC checklist and an honest read on how firm capital changes your behaviour.",
    why: "The evaluation is a different game from the one you practised. Pacing and prohibited practices are worth studying before the first trade, not after a breach.",
  },
  {
    step: "06",
    title: "Specialise and scale",
    courses: [
      "payout-and-scaling",
      "gold-and-metals",
      "indices-and-energy",
      "crypto-and-correlation",
    ],
    outcome:
      "Depth in the two or three instruments you actually trade, and a plan for the allocation after this one.",
    why: "Scaling to a larger account rewards specialisation, not breadth. Pick the markets that suit your hours and learn their contract specifications properly.",
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
    title: "Funded Trader Q&A",
    cadence: "Every Thursday, 16:00 UTC",
    duration: "60 minutes",
    format: "Live, funded clients only",
    body: "Open floor for traders holding a funded account. Payout mechanics, scaling milestones, platform behaviour and rule interpretation, answered by the people who administer them rather than by a support script.",
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
  | "Rulebook"
  | "Execution"
  | "Risk"
  | "Instruments"
  | "Compliance";

export const glossaryCategories: GlossaryCategory[] = [
  "Rulebook",
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
 * Definitions are written against the Connect Funded rulebook, not against a
 * generic textbook, so the numbers quoted here match the ones on /accounts.
 */
export const glossary: GlossaryTerm[] = [
  {
    term: "Allocation cap",
    category: "Rulebook",
    definition:
      "The maximum firm capital you may hold across all of your accounts at once, set at $400,000 in combined starting allocation. Scaling milestones are the only route above it, and they are granted per account by the risk desk.",
  },
  {
    term: "AML",
    category: "Compliance",
    definition:
      "Anti-money laundering: the controls that stop the payout rail being used to move criminal proceeds. In practice it means identity verification before funding, sanctions screening on every account, and source-of-funds questions on unusually large deposits.",
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
    category: "Rulebook",
    definition:
      "The cash figure on your account excluding any open positions. Balance only changes when a trade is closed, a payout is released or a swap is charged, which is why the overall drawdown limit is measured against starting balance rather than against equity.",
  },
  {
    term: "Bid",
    category: "Execution",
    definition:
      "The price at which you can sell an instrument right now. Quoted platforms draw their charts from the bid, which is why a long position appears to open slightly below the candle you clicked.",
  },
  {
    term: "Breach",
    category: "Rulebook",
    definition:
      "A violation of a hard risk limit, most often the 5% maximum daily drawdown or the 10% maximum overall drawdown. Breaches are detected server-side and close the account at the moment they occur; they are never adjudicated by hand afterwards.",
  },
  {
    term: "CFD",
    category: "Instruments",
    definition:
      "A contract for difference: you trade the price movement of an instrument without owning the underlying. Profit and loss are settled in cash against the contract size, which is why one standard lot of gold is 100 ounces of exposure rather than 100 ounces in a vault.",
  },
  {
    term: "Chargeback",
    category: "Compliance",
    definition:
      "A payment reversal initiated through your card issuer rather than through us. Raising one on a delivered evaluation closes every associated account pending investigation, so a refund request through support is always the faster route.",
  },
  {
    term: "Contract size",
    category: "Instruments",
    definition:
      "The quantity of the underlying that one lot represents. One standard forex lot is 100,000 units of the base currency; one gold lot is 100 troy ounces. Contract size is what turns a price move into a profit or loss figure.",
  },
  {
    term: "Copy trading",
    category: "Rulebook",
    definition:
      "Mirroring orders from one account to another. Copying between your own Connect Funded accounts is permitted provided the combined exposure stays inside the $400,000 allocation cap. Copying another trader’s signal into a funded account is not.",
  },
  {
    term: "Correlation",
    category: "Risk",
    definition:
      "The degree to which two instruments move together. Three long positions in EUR/USD, GBP/USD and AUD/USD are close to a single short-dollar position, and should be risk-budgeted as one idea rather than three.",
  },
  {
    term: "Daily drawdown",
    category: "Rulebook",
    definition:
      "The maximum your equity may fall within a single trading day, capped at 5% on every tier. It is measured against the higher of your starting balance or your equity at the 00:00 UTC reset, and it includes floating profit and loss on open positions.",
  },
  {
    term: "Daily reset",
    category: "Rulebook",
    definition:
      "The 00:00 UTC moment at which the daily drawdown floor is recalculated for the day ahead. Positions held across the reset carry their floating profit and loss into the new day’s calculation.",
  },
  {
    term: "Depth of market",
    category: "Execution",
    definition:
      "A view of resting buy and sell orders at each price level away from the current quote, also called Level II. cTrader exposes it natively; it tells you where size is waiting rather than where price has already been.",
  },
  {
    term: "Equity",
    category: "Rulebook",
    definition:
      "Your balance plus the floating profit and loss on every open position. Equity is the figure the daily drawdown check runs against, which is why an unrealised loss can end an evaluation before you have closed anything.",
  },
  {
    term: "Evaluation phase",
    category: "Rulebook",
    definition:
      "One of the two stages that precede funding. Phase 1 asks for an 8% to 10% profit target depending on tier; Phase 2 halves it to 4% or 5%. Both run under the same 5% daily and 10% overall drawdown limits, with a four trading day minimum and no calendar deadline.",
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
      "An automated strategy running inside MetaTrader, written in MQL5. Expert advisors, custom indicators and algorithmic execution are permitted on every Connect Funded tier, provided they trade the market rather than the pricing feed.",
  },
  {
    term: "Floating P&L",
    category: "Rulebook",
    definition:
      "The unrealised profit or loss on positions you still hold. It moves your equity tick by tick and therefore counts fully toward both drawdown limits, whether or not you intend to close the position today.",
  },
  {
    term: "Funded account",
    category: "Rulebook",
    definition:
      "The live account issued once both evaluation phases and KYC are complete. It carries the firm’s capital, your tier’s profit split, and the same drawdown limits you traded during the evaluation.",
  },
  {
    term: "Gap",
    category: "Risk",
    definition:
      "A jump between the close of one session and the open of the next with no tradable price in between. Stops do not protect you inside a gap, which is the main reason weekend exposure has to be sized more conservatively than intraday exposure.",
  },
  {
    term: "Hedging",
    category: "Rulebook",
    definition:
      "Holding opposing positions in the same or a closely related instrument. Hedging inside a single Connect Funded account is permitted. Hedging the same exposure between two accounts, or between traders, is a prohibited practice.",
  },
  {
    term: "KYC",
    category: "Compliance",
    definition:
      "Know Your Customer: the identity check completed before a funded account is issued. It requires a government photo identity document and a proof of address dated within the last three months, uploaded once inside the client portal.",
  },
  {
    term: "Latency arbitrage",
    category: "Rulebook",
    definition:
      "Exploiting the delay between a price appearing on a faster venue and appearing in our feed. It extracts money from the pricing mechanism rather than from the market, and it is prohibited on every account regardless of profitability.",
  },
  {
    term: "Leverage",
    category: "Instruments",
    definition:
      "The ratio between your notional exposure and the margin it consumes. Connect Funded offers up to 1:100 on forex, 1:50 on metals and indices, 1:20 on commodities, 1:10 on share CFDs and 1:5 on crypto. Leverage changes margin, never risk.",
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
      "The warning state entered when equity falls to a set percentage of used margin. On a funded account it is almost always academic: the 5% daily drawdown limit will close the account well before margin becomes the binding constraint.",
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
    category: "Rulebook",
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
    term: "Order book",
    category: "Execution",
    definition:
      "The aggregated list of resting bids and offers at each price. It is the raw material behind depth of market, and the reason liquidity can disappear a second before a high-impact release prints.",
  },
  {
    term: "Overall drawdown",
    category: "Rulebook",
    definition:
      "The maximum your equity may fall from the initial account balance across the life of the account, capped at 10% on every tier. It is static rather than trailing, so profits you make raise your buffer and never raise the floor.",
  },
  {
    term: "Pending order",
    category: "Execution",
    definition:
      "Any instruction that waits for price to reach a named level before it becomes live: a limit, a stop, or a stop-limit. It is the opposite of a market order, which trades immediately at the best available price.",
  },
  {
    term: "Payout cycle",
    category: "Rulebook",
    definition:
      "The rhythm on which withdrawal requests are opened. Standard accounts run bi-weekly; the $200,000 Professional tier runs weekly. Approved requests are released within 24 to 48 hours, and Connect Funded absorbs the processing fee.",
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
    term: "Profit split",
    category: "Rulebook",
    definition:
      "The share of net profit paid to you. It is 80% on the $10,000 and $25,000 tiers, 85% on $50,000 and $100,000, and 90% on the $200,000 Professional account. A split raised by scaling never decreases afterwards.",
  },
  {
    term: "Profit target",
    category: "Rulebook",
    definition:
      "The gain required to complete an evaluation phase, expressed as a percentage of starting balance. Phase 1 runs from 10% on the smaller tiers down to 8% on Professional; Phase 2 is half of it. Funded accounts have no profit target at all.",
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
    term: "Reset",
    category: "Rulebook",
    definition:
      "Restarting an evaluation on a fresh account after a breach or a withdrawal. Traders who breach within the first 14 days of purchase are offered a discounted reset; there is no limit on how many times you may start again.",
  },
  {
    term: "Rollover",
    category: "Instruments",
    definition:
      "The daily point at which open positions are carried into the next value date and financing is applied. It falls at 21:00 UTC on most instruments and is usually the thinnest, widest-spread minute of the trading day.",
  },
  {
    term: "Sanctions screening",
    category: "Compliance",
    definition:
      "Checking an applicant and their payment instruments against international sanctions and politically exposed person lists. It runs at registration and again periodically; a positive match blocks funding until it is resolved.",
  },
  {
    term: "Scaling",
    category: "Rulebook",
    definition:
      "The published plan for growing a funded account. Return 10% cumulatively across two consecutive payout cycles and the allocation doubles, up to a $2,000,000 ceiling, with the profit split stepping up alongside it.",
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
      "Evidence of where the money used to purchase an evaluation came from. It is requested only where a deposit pattern or a sanctions flag makes it necessary, and it is held under the retention periods set out in the AML policy.",
  },
  {
    term: "Spread",
    category: "Execution",
    definition:
      "The gap between bid and ask, and the immediate cost of opening a position. Connect Funded quotes raw spreads from 0.0 pips on EUR/USD; spreads widen at rollover, into high-impact releases and in thin holiday sessions.",
  },
  {
    term: "Stop loss",
    category: "Execution",
    definition:
      "A protective stop order that closes a position if price reaches a named level against you. It becomes a market order when triggered, so a gap can fill it worse than the level you set.",
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
      "The automatic liquidation of open positions when equity falls below the platform’s minimum margin threshold. On a Connect Funded account the drawdown rules bind first, so a stop-out is a symptom of sizing that was already far too large.",
  },
  {
    term: "Swap",
    category: "Instruments",
    definition:
      "The financing credited or debited for holding a position overnight, derived from the interest rate differential between the two sides of the instrument. It is applied at rollover and charged at triple rate on Wednesdays to cover the weekend.",
  },
  {
    term: "Take profit",
    category: "Execution",
    definition:
      "A limit order that closes a position when price reaches a named level in your favour. It fills at that price or better, and it may not fill at all if the market trades through the level without leaving size behind.",
  },
  {
    term: "Tick",
    category: "Execution",
    definition:
      "One update of the price feed. Tick volume counts updates rather than contracts, so a MetaTrader volume histogram measures how busy the feed was, not how much size actually traded.",
  },
  {
    term: "Tick scalping",
    category: "Rulebook",
    definition:
      "Taking repeated positions of a few ticks against quotes that are momentarily stale. Like latency arbitrage it targets the feed rather than the market, and it is prohibited on evaluation and funded accounts alike.",
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
