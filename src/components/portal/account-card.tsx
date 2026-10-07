import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Panel, PanelBody } from "@/components/app/panel";
import {
  AccountHeading,
  BalanceRow,
  BreachNotice,
  EvaluationBlock,
  FundedBlock,
  PayoutHoldNotice,
} from "@/components/portal/account-parts";
import type { AccountTier, TradingAccount } from "@/db/schema";

export function AccountCard({
  account,
  tier,
}: {
  account: TradingAccount;
  tier: AccountTier;
}) {
  return (
    <Panel className="overflow-hidden">
      <PanelBody className="flex flex-col gap-5">
        <AccountHeading
          account={account}
          tier={tier}
          action={
            <Link
              href="/portal/accounts"
              className="text-brand-light hover:text-brand inline-flex items-center gap-1 text-[0.8125rem] transition-colors"
            >
              Full detail
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
              <span className="sr-only"> for account {account.login}</span>
            </Link>
          }
        />

        <BalanceRow account={account} />

        {(account.status === "phase1" || account.status === "phase2") && (
          <EvaluationBlock account={account} tier={tier} />
        )}

        {account.status === "funded" && <FundedBlock account={account} tier={tier} />}

        {account.status === "payout_hold" && (
          <>
            <FundedBlock account={account} tier={tier} />
            <PayoutHoldNotice account={account} />
          </>
        )}

        {account.status === "failed" && <BreachNotice account={account} tier={tier} />}
      </PanelBody>
    </Panel>
  );
}
