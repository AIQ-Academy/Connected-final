import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";

/**
 * Presented as functional desks rather than named individuals: the people who
 * hold these seats change, the accountabilities do not.
 */
type DeskTeam = {
  code: string;
  name: string;
  headcount: number;
  accountable: string;
  duties: string[];
};

const teams: DeskTeam[] = [
  {
    code: "OPS",
    name: "Trading Operations",
    headcount: 11,
    accountable:
      "Keeping the bridge, the pricing feed and the three platforms running through every session, including the ones that start at 22:00 UTC.",
    duties: [
      "Liquidity routing and execution quality monitoring",
      "Account provisioning, resets and scaling upgrades",
      "Platform incidents and the status notices you receive",
    ],
  },
  {
    code: "RSK",
    name: "Risk",
    headcount: 7,
    accountable:
      "Writing the rulebook, encoding it into server-side checks, and reviewing every case where an automated decision is disputed.",
    duties: [
      "Drawdown enforcement logic and its test coverage",
      "Prohibited-practice detection and case review",
      "Allocation sizing, scaling approvals and exposure limits",
    ],
  },
  {
    code: "TRS",
    name: "Payments & Treasury",
    headcount: 6,
    accountable:
      "Moving money in both directions on the published timetable, and absorbing the processing cost so the amount requested is the amount received.",
    duties: [
      "Payout approval, settlement and reconciliation",
      "Card, bank, e-wallet and crypto rail maintenance",
      "KYC review, sanctions screening and source-of-funds checks",
    ],
  },
  {
    code: "SUP",
    name: "Trader Support",
    headcount: 14,
    accountable:
      "Answering the portal queue 24 hours a day, five days a week, in English, Arabic and French, without a script.",
    duties: [
      "Portal tickets, email and pre-sale questions",
      "Rule interpretation and evaluation guidance",
      "Onboarding walkthroughs and verification chasing",
    ],
  },
  {
    code: "ENG",
    name: "Engineering",
    headcount: 18,
    accountable:
      "The client portal, the public site, the risk engine and every integration between them, shipped behind tests rather than behind a maintenance window.",
    duties: [
      "Portal, admin console and public site",
      "Risk engine, market data pipeline and reporting",
      "Security, access control and audit logging",
    ],
  },
];

const totalHeadcount = teams.reduce((sum, team) => sum + team.headcount, 0);

export function DeskTeams() {
  return (
    <div>
      <StaggerGroup className="grid gap-5 lg:grid-cols-2">
        {teams.map((team) => (
          <StaggerItem
            key={team.code}
            className="border-line-soft bg-panel flex flex-col rounded-2xl border p-6"
          >
            <div className="flex items-start gap-4">
              <span
                aria-hidden="true"
                className="border-brand/30 bg-brand/12 text-brand-light grid size-12 shrink-0 place-items-center rounded-xl border font-mono text-[0.6875rem] font-semibold tracking-[0.12em]"
              >
                {team.code}
              </span>
              <div className="min-w-0">
                <h3 className="text-ink font-display text-lg leading-snug font-semibold">
                  {team.name}
                </h3>
                <p className="text-faint tabular mt-0.5 font-mono text-[0.6875rem] tracking-[0.1em] uppercase">
                  {team.headcount} people
                </p>
              </div>
            </div>

            <p className="text-muted mt-4 text-sm leading-relaxed">
              {team.accountable}
            </p>

            <ul className="border-line-soft mt-5 space-y-2 border-t pt-4">
              {team.duties.map((duty) => (
                <li
                  key={duty}
                  className="text-muted flex gap-2.5 text-[0.8125rem] leading-relaxed"
                >
                  <span
                    aria-hidden="true"
                    className="bg-brand mt-2 size-1 shrink-0 rounded-full"
                  />
                  {duty}
                </li>
              ))}
            </ul>
          </StaggerItem>
        ))}

        <StaggerItem className="border-brand/30 bg-brand/8 flex flex-col justify-center rounded-2xl border border-dashed p-6">
          <p className="text-ink font-display tabular text-4xl font-semibold">
            {totalHeadcount}
          </p>
          <p className="text-muted mt-2 text-sm leading-relaxed">
            people across five desks, working from Dubai and remotely across
            Europe, the Middle East and Africa. We publish accountabilities
            rather than headshots because the seat matters more than the name
            in it.
          </p>
        </StaggerItem>
      </StaggerGroup>

      <Reveal delay={0.1}>
        <p className="text-faint mt-8 text-sm">
          Every desk is reachable through the portal ticket queue. Risk
          decisions are reviewed by the risk desk itself, never by support, so
          you always get an answer from the team that made the call.
        </p>
      </Reveal>
    </div>
  );
}
