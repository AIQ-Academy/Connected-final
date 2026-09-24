/**
 * Demo credentials for the client walkthrough. These are seeded by
 * `npm run db:demo-passwords` and surfaced on the login screen on purpose —
 * this build is a demonstration environment, not a production deployment.
 * Delete this file and the hint card before the site handles real traders.
 */
export const demoAccounts = [
  {
    label: "Funded trader",
    email: "demo@connectfunded.com",
    password: "ConnectDemo2026!",
    description: "Marwan Haddad — a funded $50K account and a $200K in phase 2.",
    href: "/portal",
  },
  {
    label: "Administrator",
    email: "admin@connectfunded.com",
    password: "ConnectAdmin2026!",
    description: "Operations desk — registrations, CRM, KYC, payouts and support.",
    href: "/admin",
  },
] as const;
