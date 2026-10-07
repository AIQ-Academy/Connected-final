# Connect Funded Trading Site

A Next.js 16 multi-asset trading website with a public marketing site, live-feeling market surfaces, trading tools, client portal, admin CMS, education, support, and registration flows.

## Run locally

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Languages

The application supports English (default, LTR), French (LTR) and Arabic
(RTL) through locale-prefixed routes (`/en`, `/fr`, `/ar`). Locale routing,
the persistent language selector and formatting helpers are implemented in
`src/lib/i18n` and `src/components/i18n`. Local dictionaries live in
`src/lib/i18n/dictionaries`; no external translation service is used at
runtime. The current localization pass is not yet complete: several long-form
marketing, education, portal and admin content areas still need translations.

## MT5 market prices

The market ticker, homepage command center, charts and quote grid use the same
server-side quote route. Configure the MetaApi connection in `.env.local` using
`.env.example` so the route reads the broker's MT5 bid/ask prices. Keep the
token and account ID server-side. `MT5_SYMBOL_MAP` is available for brokers
whose MT5 symbols differ from the website symbols. Without MT5 credentials the
site uses its non-executable development fallback and labels it as such.

The platforms page links to the official MT5 desktop, iOS and Android download
destinations. The homepage testimonial block has been removed, the primary
theme follows the purple, blue, green, violet, gray and sage palette, and the payments page contains the supplied rail limits,
processing times, directions and first-payout guidance.

## Validation

```bash
npm run typecheck
npm run build
npm run lint
npm run test:chat
```

Run these checks in an environment where dependencies are installed. The
project copy used for this handoff currently has incomplete `node_modules`, so
type checking, lint, build, and integration checks require a successful
`npm ci` first.

## Website assistant

The existing accessible chat widget posts to `src/app/api/chat/route.ts`. The
server detects the latest message language, retrieves short page-level chunks
from generated `knowledge/index.json` and published CMS/database content, and
can combine them with current account, calendar, or market data. When configured,
AI Gateway or loopback-only Ollama generates a grounded answer; otherwise a
deterministic source-based fallback is returned. Semantic cross-language search
requires both `DATABASE_URL` and AI Gateway credentials. See
`knowledge/README.md` for architecture, environment, synchronization, and
deployment details. Keep all credentials server-side; never use `NEXT_PUBLIC_`
variables.

To run HTTP smoke checks against an already running local site, set
`CHAT_TEST_URL` if it is not at `http://localhost:3000`, then run
`npm run test:chat:http`.

## Recent interface improvements

- Added an interactive **Market Command Center** to the homepage.
- Added market tabs for all markets, forex, metals, indices, and crypto.
- Added simulated live quote movement, watchlist selection, spreads, status signals, and compact chart bars.
- Added clearer trading CTAs for the market terminal and position calculator.
- Applied the six-color Connect Funded palette to shared cards, icon containers,
  trading widgets, controls and both light/dark surfaces.
- Updated homepage hero copy to lead with live multi-asset trading.
- Updated global SEO keywords toward online trading, CFDs, brokers, platforms, and market analysis.

## Trading Edge

The **Trading Edge** menu links to strategy lessons, technical analysis, market
insights, signals, risk tools, trade management, the private trading journal,
and performance analysis. Its page copy is available in English, French, and
Arabic. Market cards use the site's quote service and label simulated quotes;
the signals page stays empty unless a verified signal feed is connected.

The journal stores entries against the authenticated user's database id. After
configuring `DATABASE_URL`, apply the added `trader_journal_entries` table with
`npm run db:push`. AI reviews require either the configured AI Gateway or a
local Ollama model and are generated only from that user's saved journal rows.
When a user requests a review, trade details and notes are sent to the configured
AI service; screenshot URLs are not sent.

## Important production work still required

- Replace placeholder contact details and generic social links in `src/lib/site.ts`.
- Confirm the final legal entity, regulatory disclosures, jurisdiction availability, and risk language with qualified counsel.
- Complete the migration of legacy funded-product copy and flows where the business is now broker-only.
- Configure production environment variables for database, auth, storage, email, and AI services.
- Apply the database schema using `npm run db:push` after setting `DATABASE_URL`.
- Run chatbot integration and content-change synchronization checks against a configured database and AI provider before claiming live semantic retrieval or automated updates in production.
- Replace simulated market data with an approved live market-data provider before presenting quotes as live.
