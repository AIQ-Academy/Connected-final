"use client";

import { useActionState, useId, useRef, useState } from "react";
import { Check, CircleCheck, Loader2, TriangleAlert, Wallet } from "lucide-react";

import { requestPayout, type ActionResult } from "@/app/portal/actions";
import { Field } from "@/components/form/field";
import {
  MIN_PAYOUT,
  payoutMethodNotes,
  payoutMethods,
  type PayoutMethod,
} from "@/components/portal/payout-methods";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";

export type PayoutAccountOption = {
  id: string;
  login: string;
  tierName: string;
  /** currentBalance − startingBalance, the withdrawable profit. */
  available: number;
  cadence: string;
  nextWindow: string;
};

export function PayoutRequestForm({
  accounts,
}: {
  accounts: PayoutAccountOption[];
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    requestPayout,
    null,
  );

  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PayoutMethod>(payoutMethods[0]);
  const [touched, setTouched] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);

  const amountId = useId();
  const amountRef = useRef<HTMLInputElement>(null);

  const selected = accounts.find((account) => account.id === accountId) ?? accounts[0];
  const available = selected?.available ?? 0;
  const parsed = Number(amount.replace(/[^0-9.-]/g, ""));
  const hasAmount = amount.trim().length > 0;

  const amountError = !hasAmount
    ? null
    : Number.isNaN(parsed) || parsed <= 0
      ? "Enter the amount you want to withdraw."
      : parsed < MIN_PAYOUT
        ? `The minimum payout request is ${formatCurrency(MIN_PAYOUT)}.`
        : parsed > available
          ? `That is more than the ${formatCurrency(available, { decimals: 2 })} available on ${selected?.login}.`
          : null;

  // Once a request lands, the same figure cannot be sent twice by accident.
  const duplicate =
    Boolean(state?.ok) && submitted !== null && submitted === `${accountId}:${amount}`;

  const blocked =
    !selected || !hasAmount || Boolean(amountError) || duplicate || pending;

  if (!selected) return null;

  return (
    <form
      action={(formData) => {
        setSubmitted(`${accountId}:${amount}`);
        setTouched(true);
        formAction(formData);
      }}
      className="flex flex-col gap-6"
    >
      <input type="hidden" name="accountId" value={selected.id} />

      {state && (
        <div
          role={state.ok ? "status" : "alert"}
          className={cn(
            "flex items-start gap-2.5 rounded-[var(--radius-md)] border px-4 py-3 text-[0.8125rem]",
            state.ok
              ? "border-mint/40 bg-mint/10 text-mint"
              : "border-loss/40 bg-loss/10 text-loss",
          )}
        >
          {state.ok ? (
            <CircleCheck className="mt-px size-4 shrink-0" aria-hidden="true" />
          ) : (
            <TriangleAlert className="mt-px size-4 shrink-0" aria-hidden="true" />
          )}
          <span>{state.message}</span>
        </div>
      )}

      {accounts.length > 1 && (
        <fieldset>
          <legend className="text-muted mb-2.5 text-[0.8125rem] font-medium">
            Withdraw from
          </legend>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {accounts.map((account) => {
              const active = account.id === selected.id;
              return (
                <label
                  key={account.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border px-4 py-3 transition-colors",
                    "has-[input:focus-visible]:outline-brand-light has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2",
                    active
                      ? "border-brand bg-brand-dim/30"
                      : "border-line hover:border-brand-light/60 hover:bg-sunken",
                  )}
                >
                  <input
                    type="radio"
                    name="accountPicker"
                    value={account.id}
                    checked={active}
                    onChange={() => setAccountId(account.id)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border",
                      active ? "border-brand bg-brand" : "border-line",
                    )}
                  >
                    {active && <Check className="size-2.5 text-white" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.875rem] font-medium">
                      {account.tierName}{" "}
                      <span className="text-faint font-mono text-[0.78125rem]">
                        {account.login}
                      </span>
                    </span>
                    <span className="text-muted tabular block text-[0.78125rem]">
                      {formatCurrency(account.available, { decimals: 2 })} available
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <div>
        <Field
          label="Amount to withdraw"
          htmlFor={amountId}
          required
          error={touched ? (amountError ?? undefined) : undefined}
          hint={`Between ${formatCurrency(MIN_PAYOUT)} and ${formatCurrency(available, { decimals: 2 })} on ${selected.login}.`}
        >
          <div className="relative">
            <span
              className="text-faint pointer-events-none absolute top-1/2 start-4 -translate-y-1/2 text-[0.9375rem]"
              aria-hidden="true"
            >
              $
            </span>
            <input
              id={amountId}
              ref={amountRef}
              name="amount"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              onBlur={() => setTouched(true)}
              aria-invalid={touched && amountError ? true : undefined}
              className={cn(
                "border-line bg-raised text-ink placeholder:text-faint tabular h-12 w-full rounded-full border pe-4 ps-8 text-[0.9375rem] outline-none transition-[border-color,box-shadow] duration-200",
                "focus:border-brand-light focus:shadow-[0_0_0_3px_rgb(var(--cf-brand-glow)/0.16)]",
                touched && amountError && "border-loss/70",
              )}
            />
          </div>
        </Field>

        <button
          type="button"
          onClick={() => {
            setAmount(available.toFixed(2));
            setTouched(true);
            amountRef.current?.focus();
          }}
          className="text-brand-light hover:text-brand mt-2 text-[0.78125rem] underline-offset-4 transition-colors hover:underline"
        >
          Request the full {formatCurrency(available, { decimals: 2 })} available
        </button>
      </div>

      <fieldset>
        <legend className="text-muted mb-2.5 text-[0.8125rem] font-medium">
          Payout method <span className="text-brand-light">*</span>
        </legend>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {payoutMethods.map((option) => {
            const active = option === method;
            return (
              <label
                key={option}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border px-4 py-3 transition-colors",
                  "has-[input:focus-visible]:outline-brand-light has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2",
                  active
                    ? "border-brand bg-brand-dim/30"
                    : "border-line hover:border-brand-light/60 hover:bg-sunken",
                )}
              >
                <input
                  type="radio"
                  name="method"
                  value={option}
                  checked={active}
                  onChange={() => setMethod(option)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border",
                    active ? "border-brand bg-brand" : "border-line",
                  )}
                >
                  {active && <Check className="size-2.5 text-white" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.875rem] font-medium">{option}</span>
                  <span className="text-faint block text-[0.78125rem]">
                    {payoutMethodNotes[option]}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="border-line-soft bg-sunken/50 rounded-[var(--radius-md)] border px-4 py-3.5">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-muted text-[0.8125rem]">Request total</span>
          <span className="font-display tabular text-[1.125rem] font-semibold">
            {hasAmount && !amountError && !Number.isNaN(parsed)
              ? formatCurrency(parsed, { decimals: 2 })
              : "—"}
          </span>
        </div>
        <p className="text-faint mt-1.5 text-[0.78125rem]">
          Connect Funded covers the processing fee, so nothing is deducted from
          the figure above. Your next {selected.cadence} window opens{" "}
          {selected.nextWindow}.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={blocked}>
          {pending ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              Sending your request
            </>
          ) : (
            <>
              <Wallet aria-hidden="true" />
              Submit payout request
            </>
          )}
        </Button>
        <p className="text-faint text-[0.78125rem]" aria-live="polite">
          {pending
            ? "Confirming the request with the desk."
            : duplicate
              ? "That request is already with the desk. Change the amount to send another."
              : "Requests are reviewed by the desk, then released within 24 to 48 hours."}
        </p>
      </div>
    </form>
  );
}
