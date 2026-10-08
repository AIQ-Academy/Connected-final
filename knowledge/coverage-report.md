# Website knowledge coverage report

Generated: 2026-10-08T12:03:52.154Z
Content version: website-source-v2

## Coverage counts

| Measure | Count |
| --- | ---: |
| pages scanned | 32 |
| pages indexed | 32 |
| sections scanned | 909 |
| knowledge items | 41 |
| numerical facts | 123 |
| trading condition records | 3 |
| account condition records | 6 |
| faq records | 2 |
| platform records | 2 |
| instrument records | 3 |
| payment records | 3 |

Domain counts are source record counts, not counts of individual live database entities.

## Indexed routes

- `/`
- `/about`
- `/accounts`
- `/broker`
- `/broker/coming-soon`
- `/contact`
- `/education`
- `/faq`
- `/funded`
- `/funded/coming-soon`
- `/glossary`
- `/how-it-works`
- `/legal/:slug`
- `/markets`
- `/news/:slug`
- `/payments`
- `/platforms`
- `/products`
- `/register`
- `/tools`
- `/tools/calculator`
- `/tools/economic-calendar`
- `/trade`
- `/trade/:asset`
- `/trading`
- `/trading-edge`
- `/trading-edge/:section`
- `/trading-edge/strategies/:slug`
- `/trading/accounts`
- `/trading/coming-soon`
- `/trading/conditions`
- `/trading/how-it-works`

## Routes without extractable copy

- None.

## Language coverage

| Language | Pages with indexed content |
| --- | ---: |
| EN | 32 |
| FR | 32 |
| AR | 32 |

## Missing or runtime-only information

- Published FAQs, CMS-managed home/trading copy, active instrument rows, published news, quotes, and calendar entries are dynamic database/feed sources and are loaded by chat at request time; the source-only scan cannot report their live totals.
- Live account balances, verification state, payouts, and other visitor-specific portal values are not added to the public chatbot index.

## Review notes

- Duplicate and conflicting-value groups are review candidates; do not resolve them automatically.
- Runtime CMS, published FAQ, instrument, news, economic-calendar, quote, and account data are fetched by the chatbot when the database/feed is available; they are not part of this source-only build scan.
- Parameterized routes are indexed as templates. Their live record values depend on the current published database content.
- Authentication-only account records and visitor-specific values are intentionally not copied into the public knowledge index.

Potential exact duplicates: 1. Potential numerical conflicts requiring human review: 11. Every numerical value and its source context/version is retained in `coverage-report.json`.
