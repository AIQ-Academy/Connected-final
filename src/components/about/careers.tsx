import { ArrowUpRight, MapPin } from "lucide-react";

import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";

export type OpenRole = {
  title: string;
  team: string;
  location: string;
  arrangement: "On-site" | "Hybrid" | "Remote";
  body: string;
};

export const openRoles: OpenRole[] = [
  {
    title: "Senior Risk Engineer",
    team: "Risk",
    location: "Dubai (DIFC)",
    arrangement: "Hybrid",
    body: "Own the service that evaluates drawdown against live equity on every tick, and the test suite that proves it is right. You will be writing the code that closes accounts, so correctness matters more than throughput.",
  },
  {
    title: "Trading Operations Analyst, Asia Session",
    team: "Trading Operations",
    location: "Dubai (DIFC)",
    arrangement: "On-site",
    body: "Cover the Sydney and Tokyo sessions from the Dubai desk: execution quality monitoring, liquidity routing and first-line platform incidents. Suits someone who already keeps market hours.",
  },
  {
    title: "Payments & Treasury Associate",
    team: "Payments & Treasury",
    location: "Remote (EMEA)",
    arrangement: "Remote",
    body: "Run the payout queue end to end — approval, settlement and reconciliation across card, bank, e-wallet and crypto rails. You will be the reason a trader gets paid on the day we said they would.",
  },
  {
    title: "Compliance Analyst, AML and KYC",
    team: "Risk",
    location: "Dubai (DIFC)",
    arrangement: "On-site",
    body: "Review verification documents, run sanctions and politically exposed person screening, and handle source-of-funds enquiries. Prior experience inside a DIFC or ADGM regulated entity is a strong advantage.",
  },
  {
    title: "Trader Support Specialist, Arabic and English",
    team: "Trader Support",
    location: "Dubai (DIFC)",
    arrangement: "Hybrid",
    body: "Answer the portal queue for Arabic and English speakers across evaluation rules, payouts and platform questions. We do not use scripts, so you will need to understand the rulebook properly.",
  },
  {
    title: "Full-Stack Engineer, Client Portal",
    team: "Engineering",
    location: "Remote (UTC-3 to UTC+6)",
    arrangement: "Remote",
    body: "Build the surfaces traders actually live in: drawdown headroom, payout requests, verification and reporting. TypeScript, React and Postgres, shipped behind tests and feature flags.",
  },
];

const hiringSteps = [
  {
    step: "01",
    title: "Written application",
    body: "Send a short note about the role and anything you have built or run that is relevant. No cover letter formalities, and no automated screening between you and a human.",
  },
  {
    step: "02",
    title: "Conversation with the desk lead",
    body: "Forty-five minutes with the person you would report to, covering how the team works and what the first ninety days actually look like.",
  },
  {
    step: "03",
    title: "A paid practical exercise",
    body: "A scoped piece of real work, timeboxed to a few hours and paid at a day rate. Nothing we ask you to produce ships without a further review.",
  },
  {
    step: "04",
    title: "Final panel and offer",
    body: "One conversation with two people from other desks, then a decision inside three business days. We tell you either way, with a reason.",
  },
];

export function Careers({ applyHref = "/contact" }: { applyHref?: string }) {
  return (
    <div>
      <StaggerGroup className="grid gap-5 lg:grid-cols-2">
        {openRoles.map((role) => (
          <StaggerItem
            key={role.title}
            className="border-line-soft bg-panel hover:border-brand/40 flex flex-col rounded-2xl border p-6 transition-colors duration-300"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand">{role.team}</Badge>
              <Badge>{role.arrangement}</Badge>
            </div>

            <h3 className="text-ink font-display mt-4 text-lg leading-snug font-semibold">
              {role.title}
            </h3>

            <p className="text-faint mt-1.5 inline-flex items-center gap-1.5 text-[0.8125rem]">
              <MapPin className="size-3.5" aria-hidden="true" />
              {role.location}
            </p>

            <p className="text-muted mt-3 text-sm leading-relaxed">
              {role.body}
            </p>
          </StaggerItem>
        ))}
      </StaggerGroup>

      <Reveal delay={0.1} className="mt-14">
        <h3 className="text-h3">How hiring works here</h3>
        <ol className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {hiringSteps.map((item) => (
            <li
              key={item.step}
              className="border-line-soft bg-panel rounded-2xl border p-5"
            >
              <span className="text-brand-light font-mono text-[0.6875rem] tracking-[0.14em]">
                {item.step}
              </span>
              <h4 className="text-ink font-display mt-2 text-[0.9375rem] leading-snug font-semibold">
                {item.title}
              </h4>
              <p className="text-muted mt-2 text-[0.8125rem] leading-relaxed">
                {item.body}
              </p>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal
        delay={0.15}
        className="border-line-soft bg-raised mt-10 flex flex-col gap-5 rounded-2xl border p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
      >
        <div>
          <p className="text-ink font-display text-lg font-semibold">
            Nothing here that fits?
          </p>
          <p className="text-muted mt-1.5 max-w-xl text-sm leading-relaxed">
            Write to us anyway with the role you think we are missing. Choose
            the careers topic on the contact form and it routes straight to the
            hiring desk rather than to support.
          </p>
        </div>
        <ButtonLink href={applyHref} variant="soft" className="shrink-0">
          Apply or introduce yourself
          <ArrowUpRight />
        </ButtonLink>
      </Reveal>
    </div>
  );
}
