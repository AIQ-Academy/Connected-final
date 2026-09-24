/**
 * Funding and payout FAQ — the Learn hub at /faq. Categories and answers are
 * fixed here so the page never depends on a CMS seed catching up.
 */

export const fundingFaqCategories = [
  "Deposits",
  "Withdrawals",
  "First payout",
  "Limits",
  "Processing times",
  "Verification",
  "Rejected requests",
  "Transaction tracking",
] as const;

export type FundingFaqCategory = (typeof fundingFaqCategories)[number];

export type FundingFaq = {
  id: string;
  category: FundingFaqCategory;
  question: string;
  answer: string;
  sortOrder: number;
};

export const fundingFaqs: FundingFaq[] = [
  {
    id: "deposit-methods",
    category: "Deposits",
    sortOrder: 1,
    question: "Which payment methods can I use to deposit?",
    answer:
      "Visa, local bank transfer, USDT (Tether), Whish Money, OMT and BOB Finance. Card, wallet and USDT deposits typically credit as soon as the rail confirms; a local bank transfer credits when the funds settle, usually in one to three business days.",
  },
  {
    id: "deposit-steps",
    category: "Deposits",
    sortOrder: 2,
    question: "How do I make a deposit?",
    answer:
      "In the client portal, select the rail, enter the amount, then review the minimum, maximum, fees and timing for that rail before you send anything. Complete the rail-specific instructions and keep the confirmation — the transaction status updates in the portal as the rail reports it.",
  },
  {
    id: "deposit-name-match",
    category: "Deposits",
    sortOrder: 3,
    question: "Do deposits have to come from an account in my name?",
    answer:
      "Yes. The paying account must be in your verified name. Third-party deposits are rejected and returned to the originating instrument where possible. Paying from someone else’s card, wallet or bank account can also put the trading account on hold.",
  },
  {
    id: "withdraw-methods",
    category: "Withdrawals",
    sortOrder: 10,
    question: "Which rails can I withdraw to?",
    answer:
      "The same six rails that accept deposits also pay out: Visa, local bank transfer, USDT, Whish Money, OMT and BOB Finance. The destination has to be in your verified name, and some rails ask for ownership evidence before the first withdrawal on that method.",
  },
  {
    id: "withdraw-steps",
    category: "Withdrawals",
    sortOrder: 11,
    question: "How do I request a withdrawal?",
    answer:
      "Confirm you are eligible, select a supported payout rail, enter the amount and destination, then complete any verification the portal requests. You will see a review status and the expected processing time before the request is confirmed.",
  },
  {
    id: "withdraw-fees",
    category: "Withdrawals",
    sortOrder: 12,
    question: "Are there fees on deposits or withdrawals?",
    answer:
      "Each rail card on the payments page states the fee, or that a fee figure has not yet been provided, before you send anything. Your own bank, card issuer or wallet provider may still apply a charge at their end, which we cannot waive.",
  },
  {
    id: "first-payout-checklist",
    category: "First payout",
    sortOrder: 20,
    question: "What must be complete before the first payout?",
    answer:
      "Identity verified with a visible Verified status in the client area; profile details matching your identity and payout destination; a supported payout rail with ownership evidence if required; account eligibility, any minimum payout and restrictions met; documents ready if asked; and processing time, fees, limits and status notifications acknowledged before you confirm. Nothing is added to that list after you start winning.",
  },
  {
    id: "first-payout-review",
    category: "First payout",
    sortOrder: 21,
    question: "Does the first payout take longer than later ones?",
    answer:
      "The first request is reviewed against the checklist above. Once that rail and those documents are on file, later requests on the same destination typically move through the published processing time for that rail — instant on card, wallet and USDT, one to three business days on local bank transfer.",
  },
  {
    id: "first-payout-amount",
    category: "First payout",
    sortOrder: 22,
    question: "Is there a minimum on the first payout?",
    answer:
      "The per-transaction minimum is the figure published on the rail you select: $25 on Visa, local bank transfer, Whish Money, OMT and BOB Finance, and $20 on USDT. If a further account-level minimum applies, it is shown in the portal before you confirm the request.",
  },
  {
    id: "limits-per-rail",
    category: "Limits",
    sortOrder: 30,
    question: "What are the minimum and maximum amounts per rail?",
    answer:
      "Visa: $25 to $5,000. Local bank transfer: $25 to $25,000. USDT: $20 to $50,000. Whish Money, OMT and BOB Finance: $25 to $5,000 per transaction, with a $10,000 daily cap. Those figures are stated on each rail card before you send.",
  },
  {
    id: "limits-daily-cap",
    category: "Limits",
    sortOrder: 31,
    question: "Is there a daily cap?",
    answer:
      "Whish Money, OMT and BOB Finance publish a $10,000 daily cap. Visa, local bank transfer and USDT do not currently publish a daily cap — the per-transaction maximum is the binding limit until a daily figure is stated. Where a cap is unpublished, the rail card says so.",
  },
  {
    id: "limits-currency",
    category: "Limits",
    sortOrder: 32,
    question: "What currency do deposits and payouts use?",
    answer:
      "All six published rails are denominated in USD. If your own bank or wallet converts from another currency, the rate and any conversion charge are set by that provider, not by Connect Funded.",
  },
  {
    id: "timing-deposits",
    category: "Processing times",
    sortOrder: 40,
    question: "How long does a deposit take to credit?",
    answer:
      "Visa, USDT, Whish Money, OMT and BOB Finance are published as instant once the rail confirms. A local bank transfer takes one to three business days to settle. The portal shows the expected timing for the rail you selected before you send.",
  },
  {
    id: "timing-withdrawals",
    category: "Processing times",
    sortOrder: 41,
    question: "How long does a withdrawal take to arrive?",
    answer:
      "The same published times apply on the way out: instant on Visa, USDT and the three wallets once approved, and one to three business days on local bank transfer. Approval and rail settlement are separate clocks — you see both in the request review before you confirm.",
  },
  {
    id: "timing-weekends",
    category: "Processing times",
    sortOrder: 42,
    question: "Do weekends and holidays change processing times?",
    answer:
      "Card, wallet and USDT rails can still confirm outside banking hours. Local bank transfer follows business days, so a request sent on Friday may not start the one-to-three-day clock until Monday. Public holidays in the sending or receiving banking system have the same effect.",
  },
  {
    id: "verify-kyc",
    category: "Verification",
    sortOrder: 50,
    question: "What identity checks are required before I can move money?",
    answer:
      "A government-issued photo ID and a proof of address dated within the last three months, uploaded once in the client portal. You need a visible Verified status before the first payout. Documents are usually reviewed within a few hours on a business day.",
  },
  {
    id: "verify-name-match",
    category: "Verification",
    sortOrder: 51,
    question: "What does account name match mean?",
    answer:
      "The legal name on your profile, the identity documents, and the paying or receiving account must be the same person. A joint account, a company account or a wallet registered to someone else will not pass, even if you control it in practice.",
  },
  {
    id: "verify-documents",
    category: "Verification",
    sortOrder: 52,
    question: "Which extra documents might you request?",
    answer:
      "Proof of address, payment-method ownership (a card statement, wallet screenshot or bank letter), and source-of-funds information on unusually large or unusual patterns. If something is required, the portal lists it before the request can be confirmed — it is not added after you submit.",
  },
  {
    id: "rejected-deposit",
    category: "Rejected requests",
    sortOrder: 60,
    question: "Why would a deposit be rejected?",
    answer:
      "The most common reasons are a third-party paying instrument, a name that does not match your verified profile, an amount outside the published minimum or maximum, or a rail that cannot complete. Rejected deposits are returned to the originating instrument where the rail allows it.",
  },
  {
    id: "rejected-withdrawal",
    category: "Rejected requests",
    sortOrder: 61,
    question: "Why would a withdrawal be rejected?",
    answer:
      "Typical causes are incomplete verification, a destination that is not in your name, an unsupported rail, an amount outside the published limits, or eligibility conditions that are not yet met. The portal states the reason against the request so you can correct it and resubmit.",
  },
  {
    id: "rejected-next",
    category: "Rejected requests",
    sortOrder: 62,
    question: "What happens to the funds if a request is rejected?",
    answer:
      "A rejected deposit is returned on the originating rail where possible. A rejected withdrawal leaves the balance on the trading account; nothing has left us, so there is nothing to reverse. Fix the stated reason and submit again — you do not lose the request slot.",
  },
  {
    id: "tracking-where",
    category: "Transaction tracking",
    sortOrder: 70,
    question: "Where can I see the status of a deposit or withdrawal?",
    answer:
      "In the client portal, on the transaction or payout record for that request. You get a confirmation when the request is placed, and the status updates as the rail reports it. Support can only add what the rail has not yet reported, so the portal record is the first place to look.",
  },
  {
    id: "tracking-statuses",
    category: "Transaction tracking",
    sortOrder: 71,
    question: "What do the status labels mean?",
    answer:
      "Submitted means we have the request. In review means verification or eligibility is being checked. Processing means it has been handed to the rail. Completed means the rail has confirmed. Rejected means it stopped, with the reason on the record. Times shown are expected windows, not guarantees from the rail.",
  },
  {
    id: "tracking-notify",
    category: "Transaction tracking",
    sortOrder: 72,
    question: "How will I know when funds have landed?",
    answer:
      "The portal record moves to Completed, and you receive the status notification you acknowledged when you confirmed the request. Instant rails usually complete in the same session; a bank transfer completes when the receiving bank posts it, which can trail our release by a business day.",
  },
];
