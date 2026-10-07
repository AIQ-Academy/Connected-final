import { CloudOff, LifeBuoy, RotateCw } from "lucide-react";

import { Panel, PanelBody } from "@/components/app/panel";
import { ButtonLink } from "@/components/ui/button";

/**
 * `getTraderWorkspace` only returns null when the database is unreachable.
 * The trader sees a calm explanation and two ways forward, never a crash.
 */
export function WorkspaceUnavailable({
  surface = "your account data",
}: {
  surface?: string;
}) {
  return (
    <Panel>
      <PanelBody className="flex flex-col items-center gap-5 py-14 text-center">
        <span
          className="border-line bg-sunken text-faint grid size-12 place-items-center rounded-full border"
          aria-hidden="true"
        >
          <CloudOff className="size-5" />
        </span>

        <div className="max-w-md">
          <h2 className="font-display text-[1.125rem] font-semibold">
            We cannot reach {surface} right now
          </h2>
          <p className="text-muted mt-2 text-[0.875rem]">
            Your account, balances and payout history are safe. This is a
            connection problem on our side, and it usually clears within a
            minute. Nothing you have submitted has been lost.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/portal" variant="soft">
            <RotateCw aria-hidden="true" />
            Try again
          </ButtonLink>
          <ButtonLink href="/contact" variant="ghost">
            <LifeBuoy aria-hidden="true" />
            Contact the desk
          </ButtonLink>
        </div>

        <p className="text-faint text-[0.75rem]">
          Open positions are unaffected. Your trading platform connects directly
          to the broker bridge, not to this portal.
        </p>
      </PanelBody>
    </Panel>
  );
}
