# Connect Funded Route and Localization Audit

Audit date: 2026-10-03

## Localization update — 2026-10-07

Applied in this pass without changing page structure or interactions:

- Education course titles, summaries and module lists now have French and Arabic copy; learning-path stages and glossary definitions are localized as well. Standard trading terms, platform names, symbols and published figures remain unchanged.
- The social-channel section’s heading, descriptions, disclaimer, follower label and accessible link labels are localized in French and Arabic.
- Client-portal navigation and the sign-in page are localized; the registration introduction and AI/classic mode selector are localized.
- Corrected the French calculator label for “Take profit”.

This is **not a certification that every screen is fully localized**. The following user-visible content still needs translation and review:

- All five legal documents’ substantive text, plus their document-specific headings and supporting labels.
- Registration wizard fields, validation messages, review/confirmation screens and the AI onboarding conversation/forms.
- Client-portal verification, payout, support/ticket pages, and shared account/payout widgets. The dashboard and accounts page already use localized dictionary entries, but their reusable widgets still need a full audit.
- Locale-specific CMS/news records and other database-provided copy when the corresponding localized record is absent.
- Route-by-route visual review in Arabic RTL and French on desktop and mobile.

No translated English-source copy was added to the English locale. The remaining items above must be completed before the requested “no untranslated English” requirement can be certified.

## Route inventory

### Public site
- `/` — home
- `/about`
- `/broker`
- `/broker/coming-soon`
- `/contact`
- `/education`
- `/faq`
- `/legal/[slug]` — dynamic policy pages
- `/markets`
- `/news/[slug]` — dynamic articles
- `/payments`
- `/platforms`
- `/products`
- `/tools`
- `/tools/calculator`
- `/tools/economic-calendar`
- `/trade`
- `/trade/[asset]` — six asset-class pages
- `/trading`
- `/trading/accounts`
- `/trading/coming-soon`
- `/trading/conditions`
- `/trading/how-it-works`

### Client portal
- `/portal/login`
- `/portal`
- `/portal/accounts`
- `/portal/kyc`
- `/portal/payouts`
- `/portal/support`
- `/portal/support/[ticketId]`

### Administration
- `/admin`
- `/admin/content`
- `/admin/content/[key]`
- `/admin/kyc`
- `/admin/leads`
- `/admin/media`
- `/admin/payouts`
- `/admin/support`

### Other pages
- `/register`
- framework not-found page

API routes were also inventoried: authentication, registration, contact, newsletter, chat/onboarding, quotes, CMS search, and media upload.

## Shared UI inventory

There are 110 TSX component files under `src/components`, including site navigation/header/footer, market widgets, calculators, FAQ and education explorers, account/payment cards, forms, portal workspaces, admin tables, legal rendering, and shared UI primitives. English/Arabic/French dictionary parity is enforced by TypeScript; Arabic RTL and locale-aware routing are already part of the project.

## Localization work applied in this update

- Payments page: locale-specific payment rail names/details, category cards, table labels, key headings, and calls to action.
- About page: locale-aware company stats and translations for the hero and selected story/CTA copy.
- Trading: passes the active locale to the shared differentiator section, including its image copy.
- FAQ: localized seeded FAQ questions/answers, category names, search/empty states, page headings, and key support/CTA labels.
- Theme provider and breadcrumb lint issues addressed while validating the localization changes.
- Added French and Arabic route copy for the products, live account types, trading conditions, live-trading steps, education landing sections, and contact page.
- Localized contract conventions, market-session descriptions, execution and financing commitments, contact channels and FAQs, account comparisons, and the About page's operating narrative and team descriptions.
- Localized education course-level and learning-track labels plus glossary category filters.

## Remaining localization work

This audit does not certify complete translation. Education course titles, summaries, module lists, learning-path details, and glossary definitions remain English-only; some About/social content, legal documents, asset-class pages, market widgets, registration, and portal/admin views also need review. Dynamic CMS content needs localized fields or per-locale records; absent those records, English copy can still appear. Arabic/French route-by-route visual checks across desktop and mobile have not yet been completed.
