/**
 * The five legal documents rendered at /legal/[slug].
 *
 * Copy is stored as plain strings and rendered with `{paragraph}` so the long
 * prose never has to be escaped for JSX, and so a reviewing lawyer can read
 * and redline it without touching a component.
 */

export const legalSlugs = [
  "terms",
  "privacy",
  "risk-disclosure",
  "aml-kyc",
  "refunds",
] as const;

export type LegalSlug = (typeof legalSlugs)[number];

export type LegalSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type LegalDocument = {
  slug: LegalSlug;
  title: string;
  /** Used in the cross-links block and the table of contents header. */
  shortTitle: string;
  description: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
};

/** Rendered as an amber callout at the top of every document. */
export const legalTemplateNotice = {
  title: "Template pending legal review",
  body: "This document is a drafting template prepared for the Connect Funded platform build. It has not yet been reviewed or approved by qualified legal counsel in any jurisdiction, it does not constitute legal advice, and it should not be relied upon as a statement of your rights or of ours until that review is complete. Where this template conflicts with applicable law, applicable law prevails.",
};

const terms: LegalDocument = {
  slug: "terms",
  title: "Terms & Conditions",
  shortTitle: "Terms",
  description:
    "The agreement governing trading account purchases, trading accounts, prohibited trading practices, withdrawals, liability and dispute resolution at Connect Funded.",
  lastUpdated: "1 August 2026",
  intro:
    "These terms govern your use of the Connect Funded website, client portal and trader trading service. Read them before purchasing a trading account: they set out exactly what is being sold, what is not, and the circumstances in which an account can be closed.",
  sections: [
    {
      heading: "About these terms and who they bind",
      paragraphs: [
        "These Terms and Conditions form a binding agreement between you and Connect Funded, a firm operating from the Dubai International Financial Centre, Dubai, United Arab Emirates (referred to here as Connect Funded, the firm, we or us). They apply from the moment you create an account, purchase a trading account, or otherwise use any part of the platform.",
        "By registering you confirm that you have read these terms, the Risk Disclosure, the Privacy Policy, the AML and KYC Policy and the Refund Policy, and that you accept all of them. Where one of those documents deals with a subject in more detail than this one, the more specific document governs that subject.",
        "Connect Funded is not a bank, a broker-dealer, an investment adviser or a licensed provider of regulated financial services, and nothing on the platform is an offer of securities, an offer of investment management, or personal financial advice.",
      ],
    },
    {
      heading: "Eligibility and account registration",
      paragraphs: [
        "You may register only if you are at least 18 years old, have full legal capacity to enter into this agreement, and are not resident in, a national of, or acting on behalf of any person in a jurisdiction subject to comprehensive sanctions or otherwise listed as restricted in our AML and KYC Policy.",
        "You must register in your own legal name, using an email address you control, and provide accurate information at registration and at verification. One natural person may hold one registered profile. Accounts opened using another person's identity, or using details that cannot be verified, will be closed.",
        "You are responsible for the security of your credentials and for every action taken through your profile. Notify us immediately if you believe your credentials have been compromised.",
      ],
      bullets: [
        "Minimum age 18, with full legal capacity",
        "Registration in your own legal name only",
        "One registered profile per natural person",
        "Accurate details at registration and at verification",
      ],
    },
    {
      heading: "The nature of the accounts",
      paragraphs: [
        "Trading account accounts operate in a simulated trading environment. Orders are executed against live streamed pricing sourced from our liquidity providers, but they are not routed to an external market and they create no position in any underlying instrument. Your performance is measured; no third-party market exposure is created by you.",
        "Trading accounts are traded under an arrangement with the firm in respect of the firm's own capital. You are not depositing money for trading, you do not hold or own the capital allocated to you, and you have no proprietary claim to it. What you acquire on reaching active trading status is a contractual right to a share of the net profit produced under the rules in force, calculated and paid as described below.",
        "Because you never deposit trading capital, your financial exposure to the programme is limited to the fees you pay. The Risk Disclosure explains the risks that remain.",
      ],
    },
    {
      heading: "Purchasing a trading account",
      paragraphs: [
        "An trading account is purchased by paying a one-off fee for the tier you select. The published tiers are $10,000 at $99, $25,000 at $189, $50,000 at $299, $100,000 at $499 and $200,000 at $899. Optional add-ons may be purchased at the time of checkout and are priced as a proportion of the base fee.",
        "Card, mobile wallet and cryptocurrency payments activate the account as soon as authorisation or the required network confirmations clear. Bank transfers activate on receipt of cleared funds. Payment must be made from an instrument held in your own name; third-party payments are rejected and may result in closure of the account.",
        "Prices are quoted in United States dollars. Where your payment provider converts from another currency, the conversion rate and any charge applied by that provider are matters between you and them.",
      ],
    },
    {
      heading: "Trading account rules and profit targets",
      paragraphs: [
        "Each trading account consists of two phases. Phase 1 requires a profit of between 8% and 10% of the starting balance depending on tier. Phase 2 requires half of that figure, between 4% and 5%. Both phases run under identical risk limits.",
        "A minimum of four trading days must be recorded in each phase. A trading day is any calendar day, measured in UTC, on which at least one position is opened. There is no maximum duration on either phase and no calendar deadline of any kind.",
        "Progression from Phase 1 to Phase 2 is automatic on reaching the target with all rules satisfied. Progression from Phase 2 to a trading account additionally requires successful completion of identity verification under the AML and KYC Policy.",
      ],
      bullets: [
        "Phase 1 profit target: 8% to 10% of starting balance, by tier",
        "Phase 2 profit target: 4% to 5% of starting balance, by tier",
        "Minimum four trading days per phase, measured in UTC",
        "No time limit and no calendar deadline on either phase",
      ],
    },
    {
      heading: "Risk limits and automatic enforcement",
      paragraphs: [
        "Two hard limits apply to every account on every tier, in trading account and after funding. The maximum daily drawdown is 5%, measured against the higher of the starting balance or the account equity recorded at the 00:00 UTC daily reset. The maximum overall drawdown is 10%, measured against the initial account balance and static rather than trailing.",
        "Both limits are assessed against equity and therefore include unrealised profit and loss on open positions. A limit can be breached without any position having been closed.",
        "Enforcement is automatic and occurs at the platform at the moment of breach. Breached accounts are closed immediately and cannot be reinstated. We do not exercise discretion in favour of a trader who has breached, and we do not apply discretion against a trader who has not; a breach is a measured event, not a judgement.",
        "Where a breach is caused by a demonstrable pricing error, a platform malfunction or an erroneous execution attributable to us, you may raise a dispute under the section on dispute resolution below and the risk desk will review the underlying execution records.",
      ],
    },
    {
      heading: "Prohibited trading practices",
      paragraphs: [
        "Expert advisors, custom indicators, algorithmic execution, hedging within a single account, news trading and holding positions over the weekend are all permitted on every tier. What is prohibited is a narrower category: strategies that extract value from the pricing mechanism or from the structure of the programme rather than from the market.",
        "Where a prohibited practice is identified, the affected accounts may be suspended pending review, any profit attributable to the practice may be voided, and the accounts may be closed without refund. Repeated or deliberate abuse will result in permanent exclusion from the programme.",
      ],
      bullets: [
        "Latency arbitrage, or any strategy exploiting delay between our feed and another venue",
        "Tick scalping against quotes that are known or suspected to be stale",
        "Reverse or group hedging, where opposing exposure is held across accounts or between traders to guarantee that one account passes",
        "Coordinated trading across multiple profiles designed to defeat the allocation cap",
        "Exploiting a demonstrable pricing error, platform malfunction or feed outage rather than reporting it",
        "Trading on the basis of information obtained through unauthorised access to any Connect Funded system",
        "Account sharing, or permitting any person other than the registered holder to trade the account",
      ],
    },
    {
      heading: "Trading accounts, trading revenue share and withdrawals",
      paragraphs: [
        "On reaching active trading status you become entitled to a share of the net profit generated on the account. The share is 80% on the $10,000 and $25,000 tiers, 85% on the $50,000 and $100,000 tiers, and 90% on the $200,000 Professional tier, unless a purchased add-on or a scaling milestone has raised it.",
        "Withdrawal requests may be made on a bi-weekly cycle, or weekly on the Professional tier. Approved requests are released within 24 to 48 hours of approval, with settlement time thereafter depending on the rail you have chosen. Connect Funded absorbs the processing fee on every method; charges applied by your own bank, card issuer or wallet provider are yours.",
        "Net profit is calculated on closed positions only. Open positions are excluded from a withdrawal calculation and remain subject to the drawdown limits. Where a withdrawal is approved, the account balance is reduced by the full profit distributed, and the overall drawdown floor is recalculated from the resulting balance.",
        "The deposit you paid for an account that reaches active trading status is reimbursed alongside your first approved withdrawal, as described in the Refund Policy.",
      ],
    },
    {
      heading: "Scaling and combined allocation",
      paragraphs: [
        "A trading account that returns 10% cumulatively across two consecutive withdrawal cycles qualifies for a scaling review. On approval the allocated capital doubles and the trading revenue share steps up by up to five percentage points, to a maximum of 90%. A split raised by scaling is never subsequently reduced.",
        "Scaling continues on the same basis up to a ceiling of $2,000,000 in allocated capital per trader. Scaling approvals are made by the risk desk and take account of the consistency of the returns, not only their size.",
        "Outside the account growth plan, a trader may hold a maximum of $400,000 in combined starting allocation across all accounts. Copy trading between accounts held by the same registered trader is permitted provided combined exposure remains within that cap.",
      ],
    },
    {
      heading: "Platform access, market data and third-party services",
      paragraphs: [
        "Access to MetaTrader 5, cTrader and the Web Terminal is provided for the sole purpose of trading your Connect Trading accounts, and is subject to the licence terms of the respective platform providers. Market data displayed on the website and inside the platforms is indicative, is provided for information only, and is not a dealable quote.",
        "We use third-party providers for pricing, charting, payment processing, identity verification and communications. We select those providers with care but we do not control them, and we are not responsible for interruptions, errors or delays originating with them.",
        "We may carry out maintenance, apply updates, or suspend access temporarily where necessary to protect the integrity of the platform. Where a suspension is planned we will give notice through the client portal.",
      ],
    },
    {
      heading: "Intellectual property",
      paragraphs: [
        "All content on the Connect Funded website and in the client portal, including the rulebook, the Trading Academy courses and glossary, the desk notes, the interface designs, the logotype and the Connect Funded name, is owned by the firm or licensed to it, and is protected by copyright, trade mark and database rights.",
        "You are granted a personal, non-exclusive, non-transferable and revocable licence to access and use that content for your own trading and study. You may not reproduce, redistribute, publish, sell, scrape, or use it to train a machine learning model, and you may not remove any proprietary notice from it.",
        "Where you submit content to us, including support correspondence, testimonials and feedback, you grant us a non-exclusive, royalty-free licence to use it for the operation and improvement of the service. We will not publish your name alongside a testimonial without your consent.",
      ],
    },
    {
      heading: "Suspension and termination",
      paragraphs: [
        "You may close your profile at any time by writing to support. Closure does not entitle you to a refund except where the Refund Policy provides for one, and it does not extinguish a withdrawal already approved.",
        "We may suspend or terminate access immediately where a hard risk limit has been breached, where a prohibited practice is identified, where verification cannot be completed, where a sanctions or AML control is triggered, where a chargeback is raised on a delivered trading account, or where you materially breach these terms.",
        "On termination for cause, unpaid profit attributable to the conduct concerned may be withheld. Profit properly earned before the conduct concerned, and already approved for withdrawal, will be paid.",
      ],
    },
    {
      heading: "Limitation of liability and indemnity",
      paragraphs: [
        "Nothing in these terms limits liability for fraud, fraudulent misrepresentation, or any other liability that cannot lawfully be limited.",
        "Subject to that, Connect Funded is not liable for indirect, incidental, special or consequential loss, for loss of profit, revenue, goodwill or anticipated savings, or for loss arising from your reliance on indicative market data, educational content or any commentary published by the desk. Our total aggregate liability to you in connection with the programme is limited to the total fees you have paid to us in the twelve months preceding the event giving rise to the claim.",
        "You agree to indemnify Connect Funded against loss arising from your breach of these terms, your infringement of a third-party right, or your use of the platform in a manner prohibited by them.",
      ],
    },
    {
      heading: "Changes to these terms",
      paragraphs: [
        "We may amend these terms to reflect changes in the programme, in the technology, or in the law. Material changes will be notified through the client portal and by email to the address on your profile at least fourteen days before they take effect.",
        "Rules governing a trading account already purchased do not change to your detriment during that trading account. A change to a profit target, a drawdown limit or a trading revenue share applies to accounts opened after the change takes effect, unless the change is in your favour.",
        "The date at the top of this document is the date of the most recent revision. Continuing to use the platform after a change takes effect constitutes acceptance of the amended terms.",
      ],
    },
    {
      heading: "Governing law and dispute resolution",
      paragraphs: [
        "These terms and any non-contractual obligation arising out of them are governed by the laws applicable in the Dubai International Financial Centre.",
        "Before commencing proceedings you agree to raise the matter with us in writing, through the client portal or by email, and to allow thirty days for it to be investigated and answered. Most disputes concern a specific execution or a specific automated decision, and both can be resolved from records we hold.",
        "Where a dispute cannot be resolved that way, the courts of the Dubai International Financial Centre have exclusive jurisdiction. Nothing in this section prevents either party from seeking urgent injunctive relief in any competent court.",
      ],
    },
    {
      heading: "Contact and notices",
      paragraphs: [
        "Notices to Connect Funded should be sent to support@connectfunded.com, or through a ticket in the client portal, which produces a timestamped record for both parties. Commercial and partnership notices should be sent to sales@connectfunded.com.",
        "Notices to you will be sent to the email address registered on your profile and posted in the client portal. It is your responsibility to keep that address current.",
      ],
    },
  ],
};

const privacy: LegalDocument = {
  slug: "privacy",
  title: "Privacy Policy",
  shortTitle: "Privacy",
  description:
    "What personal data Connect Funded collects, the lawful basis for processing it, how long it is retained, who it is shared with, and the rights you can exercise over it.",
  lastUpdated: "1 August 2026",
  intro:
    "This policy explains what we collect about you, why we are permitted to process it, how long we keep it and what you can require us to do with it. It covers the public website, the client portal and the trading platforms we provision on your behalf.",
  sections: [
    {
      heading: "Scope and who is responsible",
      paragraphs: [
        "Connect Funded, operating from the Dubai International Financial Centre, Dubai, United Arab Emirates, is the controller of the personal data described in this policy. The controller is the party that decides why and how your data is processed, and is therefore the party you can hold to account for it.",
        "This policy applies to the connectfunded.com website, the client portal, the accounts we provision for you on MetaTrader 5, cTrader and the Web Terminal, and to correspondence with our support, sales and hiring desks. It does not apply to third-party websites we link to.",
      ],
    },
    {
      heading: "Categories of personal data we collect",
      paragraphs: [
        "We collect only what the programme requires. Categories are grouped below by the reason they exist rather than by the system that holds them.",
      ],
      bullets: [
        "Identity data: full legal name, date of birth, nationality, country of residence, and the identity document and proof of address submitted at verification",
        "Contact data: email address, telephone number and postal address",
        "Account data: profile credentials in hashed form, account tier, account stage, platform logins and the audit trail of actions taken in the portal",
        "Trading data: orders, executions, positions, equity, balance and drawdown history on every account you hold",
        "Financial data: payment method type, the masked instrument identifier, payment and withdrawal amounts, and the settlement references produced by our processors",
        "Compliance data: sanctions and politically exposed person screening results, and any source-of-funds evidence requested",
        "Technical data: IP address, device and browser characteristics, session timestamps and security event logs",
        "Communications data: support tickets, emails, contact form submissions and the notes our teams record against them",
      ],
    },
    {
      heading: "How we collect it",
      paragraphs: [
        "Most of what we hold you give us directly: at registration, at checkout, at verification, and whenever you contact a desk. Trading data is generated automatically as you use the platforms. Technical data is collected by our servers and by the limited analytics described below.",
        "A small amount of data comes from third parties: payment processors confirm the outcome of a transaction, and screening providers return the result of a sanctions or politically exposed person check. We do not buy personal data from data brokers and we do not enrich your profile with data purchased elsewhere.",
      ],
    },
    {
      heading: "Purposes and lawful basis",
      paragraphs: [
        "We process personal data on four bases. Where processing is necessary to perform our contract with you, that includes provisioning accounts, enforcing risk limits, calculating and paying out profit, and providing support. Where processing is necessary to comply with a legal obligation, that includes identity verification, sanctions screening, suspicious activity reporting and the retention of records.",
        "Where processing rests on our legitimate interests, those interests are operating a secure platform, preventing fraud and abuse of the programme, improving the service, and defending legal claims. We balance those interests against your rights each time, and you may object to processing on this basis.",
        "Where processing rests on consent, that covers marketing email, non-essential cookies, and the publication of a testimonial with your name attached. Consent can be withdrawn at any time without affecting processing already carried out.",
      ],
    },
    {
      heading: "Cookies and similar technologies",
      paragraphs: [
        "Strictly necessary cookies keep you signed in, maintain your session, remember your theme preference and protect forms against cross-site request forgery. They cannot be switched off without breaking the service and they are set on the legitimate interest basis rather than on consent.",
        "Analytics cookies, where used, measure aggregate page performance and navigation patterns. They are set only with your consent, and that consent can be withdrawn through the same control that granted it.",
        "We do not operate advertising cookies, cross-site tracking pixels or data-sharing arrangements with advertising networks on this site.",
      ],
    },
    {
      heading: "Marketing communications",
      paragraphs: [
        "Operational email is sent on the contractual basis and cannot be unsubscribed while you hold an account: verification outcomes, withdrawal confirmations, breach notices, security alerts and material changes to the rulebook.",
        "Marketing email, including the weekly desk note and product announcements, is sent only where you have opted in. Every marketing message carries a one-click unsubscribe, and unsubscribing takes effect immediately across all marketing lists.",
      ],
    },
    {
      heading: "Sharing with processors and third parties",
      paragraphs: [
        "We share personal data with service providers who process it on our instructions and under a written data processing agreement. Those categories are payment and withdrawal processors, identity verification and sanctions screening providers, trading platform and liquidity providers, cloud hosting and database providers, email delivery providers, and error monitoring services.",
        "We disclose data to a regulator, law enforcement agency or court where we are legally required to do so, and to professional advisers where necessary to obtain legal or accounting advice. Suspicious activity reports are made confidentially and, as set out in the AML and KYC Policy, cannot be disclosed to you.",
        "We do not sell personal data, and we do not share it with third parties for their own marketing purposes.",
      ],
    },
    {
      heading: "International transfers",
      paragraphs: [
        "Our processors operate in several jurisdictions, including the United Arab Emirates, the European Economic Area and the United States. Where personal data leaves the jurisdiction in which it was collected, we rely on an adequacy decision where one applies, and otherwise on standard contractual clauses supplemented by technical measures such as encryption in transit and at rest.",
        "You may request a summary of the safeguards applied to a specific transfer by writing to the data protection contact below.",
      ],
    },
    {
      heading: "Data retention",
      paragraphs: [
        "We keep personal data only as long as the purpose requires, and then delete or irreversibly anonymise it. Where a legal retention period applies it overrides a shorter operational one.",
      ],
      bullets: [
        "Identity and verification records: six years after the end of the business relationship, as required by anti-money-laundering record-keeping obligations",
        "Transaction, withdrawal and accounting records: six years after the transaction",
        "Trading and account history: six years after account closure, retained for dispute resolution and audit",
        "Support correspondence: three years after the ticket is closed",
        "Marketing consent records: for the duration of the consent and three years after it is withdrawn, as evidence that it was validly obtained",
        "Unsuccessful job applications: twelve months, unless you ask us to keep them longer",
        "Technical and security logs: twelve months, in a form separated from account identifiers wherever practicable",
      ],
    },
    {
      heading: "Your rights",
      paragraphs: [
        "Subject to the exemptions in applicable law, you may request access to the personal data we hold about you, correction of anything inaccurate, deletion where we no longer have a basis to keep it, restriction of processing while a dispute over accuracy is resolved, a portable copy of the data you provided to us, and objection to processing carried out on the legitimate interest basis.",
        "Requests are answered within thirty days. There is no charge unless a request is manifestly unfounded or repetitive. We may need to verify your identity before acting, which is itself a protection for you.",
        "Deletion cannot override a legal retention obligation. Where we must keep verification or transaction records for the periods set out above, we will restrict processing to that purpose rather than delete them early, and we will tell you which category applies.",
      ],
    },
    {
      heading: "Automated decision-making",
      paragraphs: [
        "Two processes on the platform are automated. Risk-limit enforcement evaluates account equity against the published daily and overall drawdown limits and closes an account that breaches them. Sanctions screening compares your details against published lists and holds an account where a potential match is returned.",
        "Both have a consequential effect, and both are reviewable by a human being. Where an automated decision has been applied to your account you may raise a ticket asking for it to be reviewed by the risk or compliance desk, and you are entitled to an explanation of the record the decision was based on.",
      ],
    },
    {
      heading: "Security",
      paragraphs: [
        "Personal data is encrypted in transit using current TLS, and at rest in our databases and backups. Credentials are stored as salted hashes and are never recoverable in plain text, including by us.",
        "Access is granted on a least-privilege basis, is tied to a named individual, requires multi-factor authentication, and is logged in an audit trail. Verification documents are stored separately from trading data with a shorter access list.",
        "Where a personal data breach is likely to result in a risk to your rights, we will notify the relevant supervisory authority and, where the risk is high, notify you directly with a description of what happened and what you should do.",
      ],
    },
    {
      heading: "Children",
      paragraphs: [
        "The service is not offered to anyone under 18 and we do not knowingly collect data about children. Where we learn that an account has been opened by a minor, it is closed and the associated data is deleted except where a legal obligation requires it to be retained.",
      ],
    },
    {
      heading: "Complaints and contact",
      paragraphs: [
        "Data protection enquiries and rights requests should be addressed to support@connectfunded.com with the subject line marked for the attention of the data protection contact, or raised as a ticket in the client portal.",
        "If you are not satisfied with our response you may complain to the supervisory authority in the jurisdiction in which you live or in which the processing took place. Telling us first is usually faster, and it does not affect your right to complain afterwards.",
      ],
    },
    {
      heading: "Changes to this policy",
      paragraphs: [
        "We will update this policy when our processing changes. Material changes are notified through the client portal and by email at least fourteen days before they take effect, and the revision date at the top of the document is updated each time.",
      ],
    },
  ],
};

const riskDisclosure: LegalDocument = {
  slug: "risk-disclosure",
  title: "Risk Disclosure",
  shortTitle: "Risk Disclosure",
  description:
    "The risks of leveraged multi-asset trading, of the simulated trading account environment, and of the fees you place at risk when you buy a trading account from Connect Funded.",
  lastUpdated: "1 August 2026",
  intro:
    "Trading leveraged instruments carries a significant risk of loss and is not suitable for everyone. This notice sets out the principal risks of participating in the Connect Funded programme. It is not exhaustive, and it is not a substitute for independent advice.",
  sections: [
    {
      heading: "Purpose of this notice",
      paragraphs: [
        "This notice is provided so that you can make an informed decision before purchasing a trading account. It describes the risks inherent in the instruments traded on the platform and the risks specific to leveraged CFD trading.",
        "It does not describe every risk that could affect you, and it takes no account of your personal circumstances, objectives or financial position. If you do not fully understand a risk described here, seek independent professional advice before proceeding.",
      ],
    },
    {
      heading: "Nature of the products",
      paragraphs: [
        "The instruments available on the platform are contracts for difference over foreign exchange pairs, precious metals, energy and soft commodities, global equity indices, individual share prices and cryptocurrencies. A contract for difference derives its value from an underlying market without conferring ownership of, or any right in, that underlying.",
        "These are complex, leveraged products. Small movements in the underlying market produce disproportionately large movements in the value of a position. They are intended for people who understand that relationship and can quantify it before opening a position.",
      ],
    },
    {
      heading: "The simulated trading account environment",
      paragraphs: [
        "Trading account accounts operate in a simulated environment. Orders execute against live streamed pricing but do not reach an external market, and no position in any underlying instrument is created by your trading.",
        "Simulated execution is a faithful but not identical model of live execution. Fill behaviour in extreme conditions, queue position at a price level, and the market impact of a large order cannot be reproduced exactly. Performance achieved in the trading account environment is therefore not a guarantee of comparable performance in a live market.",
        "Trading accounts are traded in respect of the firm's capital under the same rulebook. You do not deposit trading capital at any stage, and you cannot lose more than the fees you have paid.",
      ],
    },
    {
      heading: "Leverage and margin",
      paragraphs: [
        "Leverage of up to 1:100 is available on foreign exchange, 1:50 on metals and indices, 1:200 on commodities, 1:100 on share contracts for difference and 1:5 on cryptocurrencies. Leverage changes how much margin a position consumes; it does not change how much the position can lose.",
        "A position sized to the margin available rather than to a defined risk is the most common cause of an account breaching the 5% daily drawdown limit. Position sizing should be derived from the distance to your stop and the risk you are prepared to take, not from the maximum size the platform will allow.",
      ],
    },
    {
      heading: "Market risk and volatility",
      paragraphs: [
        "Prices move continuously and can move violently. Economic releases, central bank decisions, geopolitical events, changes in liquidity conditions and shifts in market sentiment can all produce moves far larger than recent history would suggest.",
        "Volatility is not constant. A position size that is prudent in a quiet session can be reckless in an active one, and instruments such as natural gas, cryptocurrencies and individual share contracts routinely exhibit multiples of the volatility seen in major currency pairs.",
      ],
    },
    {
      heading: "Gapping, slippage and execution risk",
      paragraphs: [
        "A market can gap, moving from one price to another with nothing tradable in between. Gaps occur most commonly at a weekly open, around scheduled announcements, and following unscheduled news. A stop order placed inside a gap will execute at the first available price on the other side of it, which may be materially worse than the level you set.",
        "Slippage also arises in fast but continuous markets. A market order guarantees execution, not price. Neither the platform nor Connect Funded can protect you from either effect, and neither is treated as an error.",
      ],
    },
    {
      heading: "Liquidity risk",
      paragraphs: [
        "Liquidity varies by instrument and by session. Spreads widen at the daily rollover, in thin holiday sessions, immediately before and after high-impact data, and in instruments with structurally shallow order books such as platinum and palladium.",
        "In stressed conditions the price at which a given size can be executed may be significantly away from the last quoted price, and resting orders may not be filled in full.",
      ],
    },
    {
      heading: "Overnight positions and rollover",
      paragraphs: [
        "Connect Funded does not charge swap fees or overnight financing adjustments on its accounts. Positions may remain open through the daily rollover without a financing deduction.",
        "Market prices can still move while a position is open, and market risk remains the trader's responsibility regardless of how long the position is held.",
      ],
    },
    {
      heading: "Currency risk",
      paragraphs: [
        "Accounts are denominated in United States dollars. Where you trade an instrument quoted in another currency, your profit and loss is converted, and the conversion rate itself introduces variability into the result.",
        "Where you receive a withdrawal in a currency other than the dollar, or in a cryptocurrency, the value you ultimately realise depends on the exchange rate at the moment of conversion and on any charge applied by your own provider.",
      ],
    },
    {
      heading: "Technology and connectivity risk",
      paragraphs: [
        "Trading depends on hardware, software, network connectivity and third-party infrastructure, any of which can fail. An interruption may prevent you from opening, modifying or closing a position at the moment you intend to.",
        "We maintain redundancy in our own systems and publish status notices when an incident affects the platform, but we do not control your connection, your device or the public internet between them. Where an incident on our side is demonstrated to have caused a loss or a breach, the risk desk will review the execution records under the dispute process in the Terms and Conditions.",
      ],
    },
    {
      heading: "Algorithmic and automated trading",
      paragraphs: [
        "Expert advisors, cBots and other automated strategies are permitted, and they carry risks of their own. A defect in logic, an unhandled market condition, a change in symbol specification or a loss of connectivity mid-cycle can produce a rapid sequence of unintended orders.",
        "You remain fully responsible for every order sent from your account, including those generated automatically while you are away from the terminal. Automated strategies should be tested, position-limited and monitored.",
      ],
    },
    {
      heading: "Risk specific to the trading service",
      paragraphs: [
        "The deposit is at risk. Most trading accounts do not reach active trading status. If your account breaches a risk limit, the fee is not returned, and you would need to purchase a new trading account or a discounted reset to try again.",
        "Reaching a trading account does not guarantee income. A trading account is subject to the same drawdown limits, and a breach closes it. Profit is paid only on closed positions, only on the published cycle, and only after approval.",
        "You should treat the deposit in the same way as any other amount at risk: only commit money you can afford to lose entirely, and do not fund a trading account with borrowed money or with capital you require for living expenses.",
      ],
    },
    {
      heading: "No investment advice",
      paragraphs: [
        "Nothing published by Connect Funded is personal advice or a recommendation to enter into any transaction. That includes the Trading Academy, the desk notes, the economic calendar, technical ratings, market commentary and anything said by a member of staff in a support conversation or a live session.",
        "Educational material describes methods and their trade-offs. It does not take account of your objectives, your financial position or your risk tolerance, and it should not be treated as though it did.",
      ],
    },
    {
      heading: "Taxation",
      paragraphs: [
        "The tax treatment of amounts received under this programme depends on your personal circumstances and on the jurisdiction in which you are resident, and it can change. Connect Funded does not provide tax advice and does not withhold tax on your behalf.",
        "You are responsible for determining, declaring and paying any tax due on withdrawals you receive, and for keeping the records your jurisdiction requires. Your withdrawal history is available in the client portal for that purpose.",
      ],
    },
    {
      heading: "Suitability",
      paragraphs: [
        "This programme is intended for people who understand leveraged instruments, who can absorb the loss of the fee, and who are able to follow a written risk framework under pressure. It is not a savings product, an investment, or a substitute for employment income.",
        "If you do not understand how a 5% daily drawdown limit interacts with unrealised profit and loss on an open position, or how to convert a stop distance into a position size, work through the relevant Trading Academy course before purchasing a trading account. Both are covered in the risk track, and access is free.",
      ],
    },
    {
      heading: "Acknowledgement",
      paragraphs: [
        "By purchasing a trading account you confirm that you have read this notice, that you understand the risks it describes, that you accept them, and that you are acting on your own judgement rather than on any statement made by Connect Funded.",
        "Past performance, whether your own, another trader's or the desk's, is not a reliable indicator of future results.",
      ],
    },
  ],
};

const amlKyc: LegalDocument = {
  slug: "aml-kyc",
  title: "AML & KYC Policy",
  shortTitle: "AML & KYC",
  description:
    "How Connect Funded verifies identity, screens for sanctions, assesses source of funds, monitors activity and retains compliance records under a risk-based programme.",
  lastUpdated: "1 August 2026",
  intro:
    "Connect Funded operates a risk-based anti-money-laundering and counter-terrorist-financing programme. This policy explains what we check, when we check it, what we do with the result, and what happens if a check cannot be completed.",
  sections: [
    {
      heading: "Purpose and scope",
      paragraphs: [
        "The purpose of this policy is to prevent the platform and its withdrawal rails being used to launder criminal proceeds, finance terrorism, evade sanctions or move funds on behalf of a third party.",
        "It applies to every registered trader, every payment instrument used to purchase a trading account, every withdrawal destination, and every member of staff involved in onboarding, payments or account administration.",
      ],
    },
    {
      heading: "Framework and risk-based approach",
      paragraphs: [
        "Our controls are modelled on the United Arab Emirates federal anti-money-laundering framework, the rules applicable in the Dubai International Financial Centre, and the Financial Action Task Force Recommendations.",
        "The programme is risk-based. The depth of due diligence applied to a given trader is proportionate to the risk that trader presents, assessed on residence and nationality, the payment instruments used, the size and pattern of withdrawals requested, screening results, and any adverse information identified.",
        "Risk ratings are reviewed when a material change occurs, such as a change of residence, a new payment instrument, a scaling upgrade or an unusual withdrawal pattern.",
      ],
    },
    {
      heading: "Customer due diligence",
      paragraphs: [
        "Standard due diligence is completed before a trading account is issued and before any withdrawal is released. It cannot be deferred past those points, and a trading account cannot be converted to a trading account while verification is outstanding.",
        "Documents are uploaded once inside the client portal over an encrypted connection and are reviewed by the compliance desk, usually within a few hours on a business day. We do not accept identity documents by email.",
      ],
      bullets: [
        "A valid government-issued photo identity document: passport, national identity card or driving licence",
        "A proof of address dated within the last three months: utility bill, bank statement or government correspondence",
        "Confirmation of date of birth, nationality and country of residence",
        "A liveness or selfie check where the document image quality or the risk rating requires it",
        "Confirmation that the payment instrument used is held in the same name as the verified identity",
      ],
    },
    {
      heading: "Enhanced due diligence",
      paragraphs: [
        "Enhanced due diligence is applied where a trader is resident in or connected to a higher-risk jurisdiction, where a screening result indicates a politically exposed person or a close associate of one, where adverse media is identified, or where transaction patterns are inconsistent with the profile.",
        "Enhanced measures include obtaining additional identity evidence, establishing source of funds and where relevant source of wealth, senior compliance approval before the relationship proceeds, and more frequent ongoing review.",
        "Being identified as a politically exposed person is not by itself a reason for refusal. It is a reason for additional scrutiny and for a documented approval decision.",
      ],
    },
    {
      heading: "Sanctions screening",
      paragraphs: [
        "Every applicant is screened at registration against United Nations, United Arab Emirates, European Union, United Kingdom and United States sanctions lists, along with politically exposed person and adverse media data. Screening is repeated periodically and whenever list data is updated.",
        "A potential match places the account on hold immediately, before any active trading status or withdrawal is granted. Holds are investigated by the compliance desk, and a false positive is cleared with the reason recorded.",
        "A confirmed match results in the relationship being refused or terminated, the assets concerned being frozen where required, and a report being made to the competent authority. In those circumstances we may be legally prohibited from explaining the reason to you.",
      ],
    },
    {
      heading: "Source of funds and source of wealth",
      paragraphs: [
        "Where the risk rating, the payment pattern or a screening result requires it, we will ask you to evidence the source of the funds used to purchase a trading account, and in higher-risk cases the origin of your wealth more generally.",
        "Acceptable evidence includes recent salary statements, an employment contract, audited business accounts, a tax return, a sale-of-asset document or a bank statement showing the originating credit. Requests are proportionate and we will explain what we need and why.",
        "Where evidence is not provided within a reasonable period, the account is suspended and any pending withdrawal is held until it is.",
      ],
    },
    {
      heading: "Restricted persons and jurisdictions",
      paragraphs: [
        "We do not open or maintain accounts for persons subject to sanctions, for persons resident in a comprehensively sanctioned jurisdiction, or for persons in a jurisdiction where offering this programme would breach local law.",
        "We also refuse relationships involving shell entities, bearer arrangements, anonymising services that obscure the origin of a payment, and any applicant who declines to complete verification.",
        "The restricted list is reviewed regularly and can change at short notice. Where a change makes an existing relationship impermissible, the account is closed and any legitimately earned and approved profit is paid to a verified destination where it is lawful to do so.",
      ],
    },
    {
      heading: "Payment instrument controls",
      paragraphs: [
        "Payments must be made from an instrument held in the name of the registered trader. Third-party payments are rejected and will be returned to the originating instrument where possible.",
        "Withdrawals are released only to an instrument or wallet already verified as belonging to the registered trader, and wherever possible to the same rail used for the original purchase. A request to pay out to a new destination triggers additional verification.",
        "Cryptocurrency withdrawals are screened for exposure to sanctioned addresses, mixing services and known illicit sources before release.",
      ],
    },
    {
      heading: "Ongoing monitoring",
      paragraphs: [
        "Account activity is monitored on a continuing basis for patterns inconsistent with a genuine trading relationship. That includes rapid purchase and refund cycles, purchases funded from multiple unrelated instruments, withdrawal destinations that change repeatedly, and clusters of accounts sharing device, address or payment characteristics.",
        "Monitoring alerts are reviewed by the compliance desk. Most are resolved with a simple explanation from the trader. Where they are not, the account is escalated.",
      ],
    },
    {
      heading: "Suspicious activity reporting",
      paragraphs: [
        "Where we know or suspect, or have reasonable grounds to suspect, that funds are the proceeds of crime or relate to terrorist financing, a suspicious activity report is filed with the competent financial intelligence unit.",
        "Reporting obligations override our duty of confidentiality to you. Where a report has been made, applicable law generally prohibits us from telling you that it has been made or from disclosing the content of it. This is commonly described as the prohibition on tipping off.",
        "A report is not an accusation and does not by itself result in account closure. It is a legal obligation triggered by a threshold of suspicion.",
      ],
    },
    {
      heading: "Record retention",
      paragraphs: [
        "Identity documents, verification decisions, screening results, source-of-funds evidence and transaction records are retained for a minimum of six years after the end of the business relationship, or longer where an authority directs it or where records are relevant to ongoing proceedings.",
        "Records of internal escalations and of suspicious activity reports are retained on the same basis and held with restricted access.",
        "Retention under this policy takes precedence over a deletion request made under the Privacy Policy. Where that applies we restrict processing to the compliance purpose and tell you which category the restriction falls under.",
      ],
    },
    {
      heading: "Refusal, suspension and closure",
      paragraphs: [
        "We may refuse an application, suspend an account or terminate a relationship where verification cannot be completed, where documents appear altered, where a sanctions match is confirmed, where source of funds cannot be evidenced, or where the pattern of activity remains unexplained after enquiry.",
        "Where an account is closed for a compliance reason and it is lawful to do so, verified profit already approved is paid to a verified destination and any unused deposit is treated under the Refund Policy. Where the law prohibits payment, funds are held or remitted as directed by the competent authority.",
      ],
    },
    {
      heading: "Training and internal controls",
      paragraphs: [
        "Every member of staff with access to onboarding, payments or account administration completes anti-money-laundering training on joining and at least annually thereafter, covering typologies relevant to online trading, sanctions obligations and internal escalation.",
        "Controls are documented, access to compliance systems is restricted to named individuals with multi-factor authentication, and every compliance decision is recorded in an audit trail with its reason.",
      ],
    },
    {
      heading: "Governance",
      paragraphs: [
        "The compliance function within the Payments and Treasury desk is accountable for this programme, reports to the firm's senior management, and maintains independence in escalation and reporting decisions.",
        "The policy is reviewed at least annually and whenever the applicable framework changes materially. Independent testing of the controls is commissioned periodically and findings are tracked to closure.",
      ],
    },
    {
      heading: "Contact",
      paragraphs: [
        "Questions about verification, a document request or an account hold should be raised as a ticket in the client portal or sent to support@connectfunded.com, marked for the attention of the compliance desk.",
        "Where we cannot explain the reason for a decision, it is because disclosure is legally restricted rather than because a reason does not exist.",
      ],
    },
  ],
};

const refunds: LegalDocument = {
  slug: "refunds",
  title: "Refund Policy",
  shortTitle: "Refunds",
  description:
    "When a Connect Funded deposit is refundable, how the fee is reimbursed with your first withdrawal, and how refund requests, chargebacks and disputes are handled.",
  lastUpdated: "1 August 2026",
  intro:
    "This policy sets out when a deposit can be refunded, when it cannot, and how a request is made and processed. It applies alongside the Terms and Conditions and forms part of the same agreement.",
  sections: [
    {
      heading: "Scope",
      paragraphs: [
        "This policy covers trading fees, add-on purchases and reset fees paid to Connect Funded. It does not cover profit withdrawals, which are governed by the withdrawal provisions of the Terms and Conditions.",
        "Nothing in this policy limits any non-excludable statutory right you may have under the consumer law of your own jurisdiction.",
      ],
    },
    {
      heading: "The 14-day untraded refund",
      paragraphs: [
        "You may request a full refund of an deposit within 14 calendar days of purchase, provided that no trade has been placed on any account issued under that purchase. A trade means any position opened, whether or not it was subsequently closed and whether or not it produced a profit.",
        "The 14-day period runs from the moment the payment is authorised, not from the moment you first sign in. Opening a platform, viewing charts, placing and cancelling a pending order that never triggered, or completing verification does not affect eligibility.",
        "Once a position has been opened, the trading account has been consumed and this refund is no longer available, irrespective of how many days remain in the window.",
      ],
    },
    {
      heading: "Reimbursement of the fee on your first withdrawal",
      paragraphs: [
        "Where an account reaches active trading status, the deposit paid for that account is reimbursed in full alongside your first approved withdrawal. The reimbursement is paid in addition to your profit share, not deducted from it.",
        "The reimbursement covers the base deposit for that account. Add-on purchases and reset fees are not reimbursed under this provision.",
        "Reimbursement is made once per trading account. If the account is later closed and you purchase a new trading account, the new fee stands on its own terms.",
      ],
    },
    {
      heading: "What is not refundable",
      paragraphs: [
        "The following are not refundable, and requests for them will be declined with the reason recorded.",
      ],
      bullets: [
        "An trading account on which any position has been opened",
        "An account closed for breaching the maximum daily or maximum overall drawdown limit",
        "An account closed for a prohibited trading practice or for a breach of the Terms and Conditions",
        "An account closed because identity verification could not be completed or a sanctions match was confirmed",
        "A request made more than 14 calendar days after purchase, where the trader has not reached active trading status",
        "Add-on purchases and reset fees, once the associated account has been activated",
        "Dissatisfaction with market conditions, with your own results, or with the outcome of a correctly enforced rule",
      ],
    },
    {
      heading: "Add-ons and resets",
      paragraphs: [
        "Add-ons purchased at checkout are refundable on the same 14-day untraded basis as the trading account they modify, and only together with it. An add-on cannot be refunded separately once the account has been traded.",
        "A reset restarts a trading account on a fresh account. Reset fees are refundable within 14 days only where the reset account has not been traded. Traders who breach within the first 14 days of an original purchase are offered a discounted reset, and taking that discount does not extend or renew the refund window on the original purchase.",
      ],
    },
    {
      heading: "Duplicate and erroneous charges",
      paragraphs: [
        "A duplicate charge, an incorrect amount, or a charge for an amount other than the one selected is refunded in full as soon as it is confirmed, regardless of the 14-day window and regardless of whether trading has taken place on the correctly charged account.",
        "Where a duplicate has resulted in two accounts being issued, you may instead ask for the second account to be retained and held for future use. That choice is yours, not ours.",
      ],
    },
    {
      heading: "How to request a refund",
      paragraphs: [
        "Raise a ticket in the client portal, or email support@connectfunded.com from the address registered on your profile, stating the account number, the purchase date and the reason for the request.",
        "Requests are acknowledged within one business day and a decision is issued within five business days. Where a request is declined, the decision states the specific provision relied upon, and you may ask for it to be reviewed once by a second reviewer.",
      ],
    },
    {
      heading: "Refund method and timing",
      paragraphs: [
        "Approved refunds are returned to the original payment method. We cannot redirect a refund to a different instrument, because doing so would defeat the payment controls in the AML and KYC Policy.",
        "We process an approved refund within 3 business days. Settlement after that depends on the rail: cards typically post within 5 to 10 business days depending on the issuer, bank transfers within 1 to 3 business days, e-wallets within 24 hours, and cryptocurrency the same day.",
        "Connect Funded absorbs its own processing costs on a refund. Charges levied by your bank, card issuer or wallet provider are outside our control.",
      ],
    },
    {
      heading: "Currency and cryptocurrency refunds",
      paragraphs: [
        "Fees are charged in United States dollars. A refund is returned in the same currency and for the same dollar amount that was charged. Where your provider converted the original charge, the amount you receive in your local currency may differ from the amount you originally paid because the exchange rate has moved. That difference is not recoverable from us.",
        "Cryptocurrency refunds are returned in the same asset and on the same network as the original payment, valued at the dollar amount of the original charge. The quantity of the asset returned may therefore differ from the quantity originally sent.",
      ],
    },
    {
      heading: "Chargebacks",
      paragraphs: [
        "If you believe a charge is wrong, contact us before contacting your card issuer. A refund request handled directly is almost always faster than a chargeback, and it does not put your other accounts at risk.",
        "Raising a chargeback on a delivered trading account is treated as a breach of the Terms and Conditions. All accounts associated with the profile are suspended immediately pending investigation, pending withdrawals are held, and the profile may be permanently excluded from the programme.",
        "Where a chargeback is found to have been raised in bad faith, we reserve the right to recover the disputed amount and the associated scheme costs, and to report the matter to the payment scheme.",
      ],
    },
    {
      heading: "Refunds where we close an account",
      paragraphs: [
        "Where we withdraw an account type, discontinue a product, or close an account for a reason that is not attributable to you, any unused balance is returned in full, together with any fee charged for a service that was not delivered.",
        "Where an account is closed because of a demonstrable platform failure attributable to us that made the trading account impossible to complete on its published terms, we will either restore the account to its pre-incident state or refund the fee, at your election.",
      ],
    },
    {
      heading: "Your statutory rights",
      paragraphs: [
        "Where the consumer law of your jurisdiction confers a right of withdrawal or a right to a remedy that is more generous than this policy, that right applies and this policy does not restrict it.",
        "Where you exercise a statutory right of withdrawal after beginning to use the service, we may be entitled to retain a proportionate amount for the service already supplied, and we will explain the calculation if that arises.",
      ],
    },
    {
      heading: "Disputes",
      paragraphs: [
        "A refund decision may be escalated in writing within 30 days of the decision. Escalations are reviewed by a person who was not involved in the original decision, and an outcome is issued within 10 business days.",
        "If the matter remains unresolved, the dispute resolution and governing law provisions of the Terms and Conditions apply.",
      ],
    },
    {
      heading: "Contact",
      paragraphs: [
        "Refund requests and escalations should go to support@connectfunded.com or through a client portal ticket, which timestamps the request and keeps the correspondence in one place for both of us.",
      ],
    },
  ],
};

const documentsBySlug: Record<LegalSlug, LegalDocument> = {
  terms,
  privacy,
  "risk-disclosure": riskDisclosure,
  "aml-kyc": amlKyc,
  refunds,
};

export const legalDocuments: LegalDocument[] = legalSlugs.map(
  (slug) => documentsBySlug[slug],
);

export function getLegalDocument(slug: string): LegalDocument | null {
  return (documentsBySlug as Record<string, LegalDocument | undefined>)[slug] ?? null;
}

/** Stable anchor id for a section, used by the table of contents. */
export function sectionId(index: number) {
  return `section-${index + 1}`;
}
