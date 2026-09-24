import { Bitcoin, CreditCard, Landmark, Wallet } from "lucide-react";

import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import {
  NOT_PROVIDED,
  paymentDirectionLabels,
  paymentMethods,
  type PaymentMethod,
} from "@/lib/content";
import { cn } from "@/lib/utils";

const categoryIcons: Record<PaymentMethod["category"], typeof Wallet> = {
  card: CreditCard,
  bank: Landmark,
  wallet: Wallet,
  crypto: Bitcoin,
};

type Field = { label: string; value: string; note?: string };

function railFields(method: PaymentMethod): Field[] {
  return [
    {
      label: "Direction",
      value: paymentDirectionLabels[method.directions],
    },
    { label: "Minimum", value: method.minimum },
    { label: "Per-transaction maximum", value: method.maximum },
    {
      label: "Daily cap",
      value: method.dailyCap,
      note: method.sharedTerms
        ? "Shared terms with Whish Money — confirm before publication."
        : undefined,
    },
    { label: "Processing time", value: method.processing },
    { label: "Currency", value: method.currency },
    { label: "Fees", value: method.fees },
    { label: "Account name match", value: method.nameMatch },
    { label: "Verification documents", value: method.verification },
    { label: "Geographic restrictions", value: method.geo },
  ];
}

export function RailCards() {
  return (
    <StaggerGroup className="grid gap-5 lg:grid-cols-2">
      {paymentMethods.map((method) => {
        const Icon = categoryIcons[method.category];
        const fields = railFields(method);

        return (
          <StaggerItem
            key={method.name}
            className="border-line-soft bg-panel flex flex-col rounded-2xl border p-6 sm:p-7"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="border-line-soft bg-sunken text-brand-light grid size-9 place-items-center rounded-lg border">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-ink font-display text-base font-semibold">
                    {method.name}
                  </h3>
                  <p className="text-faint mt-0.5 font-mono text-[0.6875rem] tracking-[0.08em] uppercase">
                    {method.processing}
                  </p>
                </div>
              </div>
              <Badge
                tone={method.directions === "both" ? "mint" : "brand"}
                size="sm"
              >
                {paymentDirectionLabels[method.directions]}
              </Badge>
            </div>

            <dl className="border-line-soft mt-6 divide-line-soft divide-y border-t">
              {fields.map(
                (field) =>
                  field.value !== NOT_PROVIDED && (
                    <div
                      key={field.label}
                      className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                    >
                      <dt className="text-muted text-[0.8125rem]">
                        {field.label}
                      </dt>
                      <dd className="sm:text-right">
                        <span
                          className={cn(
                            "text-[0.8125rem] leading-relaxed",
                            field.value === NOT_PROVIDED
                              ? "text-faint"
                              : "text-ink",
                          )}
                        >
                          {field.value}
                          {field.note && field.value !== NOT_PROVIDED
                            ? "*"
                            : null}
                        </span>
                        {field.note ? (
                          <span className="text-faint mt-1 block text-xs leading-relaxed">
                            {field.note}
                          </span>
                        ) : null}
                      </dd>
                    </div>
                  ),
              )}
            </dl>
          </StaggerItem>
        );
      })}
    </StaggerGroup>
  );
}

export function CategoryCards() {
  return <RailCards />;
}
