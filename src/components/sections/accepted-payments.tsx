import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { GridBackdrop } from "@/components/ui/aurora";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

type Rail = {
  name: string;
  timing: string;
  instant: boolean;
  mark: ReactNode;
};

/**
 * Headline rails on the home page. The full matrix — including Neteller,
 * USDC and Ethereum — lives on /payments so this stays a route map, not a
 * second copy of that page.
 */
const rails: Rail[] = [
  { name: "Visa", timing: "Instant", instant: true, mark: <VisaMark /> },
  {
    name: "Mastercard",
    timing: "Instant",
    instant: true,
    mark: <MastercardMark />,
  },
  {
    name: "Apple Pay",
    timing: "Instant",
    instant: true,
    mark: <ApplePayMark />,
  },
  {
    name: "Google Pay",
    timing: "Instant",
    instant: true,
    mark: <GooglePayMark />,
  },
  {
    name: "Bank transfer",
    timing: "1–2 days",
    instant: false,
    mark: <BankMark />,
  },
  { name: "Skrill", timing: "Instant", instant: true, mark: <SkrillMark /> },
  { name: "USDT", timing: "Instant", instant: true, mark: <UsdtMark /> },
  {
    name: "Bitcoin",
    timing: "1–3 confirmations",
    instant: false,
    mark: <BitcoinMark />,
  },
];

export function AcceptedPaymentsSection() {
  return (
    <Section
      id="accepted-payments"
      size="spacious"
      className="border-line-soft bg-sunken/50 overflow-hidden border-y"
    >
      <GridBackdrop className="opacity-50" />

      <Container className="relative">
        <SectionHeading
          eyebrow="Accepted payments"
          title="Pay with the rail you already use."
          lead="Cards, wallets, bank transfer and crypto. We absorb the processing fee on every one of them — the number at checkout is the number that leaves your account."
          action={
            <ButtonLink href="/payments" variant="outline">
              Processing times
              <ArrowRight />
            </ButtonLink>
          }
        />

        <div className="relative mt-12 sm:mt-16 lg:mt-20">
          <p className="text-faint mb-3 font-mono text-[0.625rem] tracking-[0.14em] uppercase sm:hidden">
            Swipe payment methods
          </p>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[color-mix(in_oklab,var(--cf-bg-sunken)_92%,transparent)] to-transparent sm:hidden"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[color-mix(in_oklab,var(--cf-bg-sunken)_92%,transparent)] to-transparent sm:hidden"
          />

          <StaggerGroup
            role="list"
            className="mobile-snap-rail  sm:grid sm:grid-cols-4 sm:gap-px sm:overflow-hidden sm:rounded-2xl sm:border"
          >
            {rails.map((rail) => (
              <StaggerItem
                role="listitem"
                aria-label={rail.name}
                key={rail.name}
                className="mobile-snap-card bg-panel border-line flex w-[9.5rem]
                 flex-col items-center justify-center gap-5 
                rounded-2xl border px-4 py-7 sm:w-auto 
                sm:border-0 sm:px-6 sm:py-10"
              >
                <span className="text-brand flex h-14 items-center justify-center">
                  {rail.mark}
                </span>
                <span
                  className={cn(
                    "font-mono text-[0.625rem] tracking-[0.14em] uppercase",
                    rail.instant ? "text-mint" : "text-faint",
                  )}
                >
                  {rail.timing}
                </span>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>

        <p className="text-muted mt-8 max-w-2xl text-sm leading-relaxed">
          Pay from an instrument in your own name. Third-party payments are
          returned. Card, wallet and crypto deposits activate the evaluation as
          soon as they clear.
        </p>
      </Container>
    </Section>
  );
}

function VisaMark() {
  return (
    <svg viewBox="0 0 64 22" className="h-10 w-auto" aria-hidden="true">
      <text
        x="32"
        y="17"
        textAnchor="middle"
        fill="currentColor"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontStyle="italic"
        fontWeight="800"
        fontSize="18"
        letterSpacing="1.2"
      >
        VISA
      </text>
    </svg>
  );
}

function MastercardMark() {
  return (
    <svg viewBox="0 0 48 28" className="h-11 w-auto" aria-hidden="true">
      <circle cx="18" cy="14" r="12" className="fill-current opacity-90" />
      <circle cx="30" cy="14" r="12" className="fill-current opacity-35" />
    </svg>
  );
}

function ApplePayMark() {
  return (
    <svg viewBox="0 0 78 22" className="h-10 w-auto" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12.4 5.1c.7-.9 1.2-2.1 1.1-3.3-1 .1-2.3.7-3.1 1.6-.7.8-1.3 2-1.1 3.2 1.2.1 2.4-.6 3.1-1.5zM12.9 6.7c-1.6-.1-3 1-3.8 1-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.6 1.3 10.1.8 1.2 1.8 2.6 3.2 2.5 1.3 0 1.8-.8 3.3-.8s1.9.8 3.3.8c1.4 0 2.2-1.2 3.1-2.5.6-.9 1.1-1.9 1.4-2.9-3.7-1.4-4.3-6.6-.7-8.3-.8-1.1-2-1.6-3.6-1.5z"
      />
      <text
        x="22"
        y="17.5"
        fill="currentColor"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontWeight="600"
        fontSize="14"
      >
        Pay
      </text>
    </svg>
  );
}

function GooglePayMark() {
  return (
    <svg viewBox="0 0 92 22" className="h-10 w-auto" aria-hidden="true">
      <text
        x="0"
        y="17"
        fill="currentColor"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontWeight="500"
        fontSize="15"
        letterSpacing="-0.3"
      >
        Google Pay
      </text>
    </svg>
  );
}

function BankMark() {
  return (
    <svg viewBox="0 0 32 26" className="h-11 w-auto" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16 1.5 1.5 9.2v1.8h29V9.2L16 1.5zm-11 11.2h3.2V21H5zM11.1 12.7h3.2V21h-3.2zm6.6 0h3.2V21h-3.2zm6.6 0H28V21h-3.7zM1.5 22.5h29V25h-29z"
      />
    </svg>
  );
}

function SkrillMark() {
  return (
    <svg viewBox="0 0 72 22" className="h-9 w-auto" aria-hidden="true">
      <text
        x="36"
        y="16.5"
        textAnchor="middle"
        fill="currentColor"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontWeight="700"
        fontSize="15"
        letterSpacing="0.4"
      >
        Skrill
      </text>
    </svg>
  );
}

function UsdtMark() {
  return (
    <svg viewBox="0 0 28 28" className="size-11" aria-hidden="true">
      <circle
        cx="14"
        cy="14"
        r="13"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        fill="currentColor"
        d="M8 10.2h12v2.1h-4.4V20h-3.2v-7.7H8zM10.2 7.4h7.6v2.1h-7.6z"
      />
    </svg>
  );
}

function BitcoinMark() {
  return (
    <svg viewBox="0 0 28 28" className="size-11" aria-hidden="true">
      <circle
        cx="14"
        cy="14"
        r="13"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <text
        x="14"
        y="19"
        textAnchor="middle"
        fill="currentColor"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontWeight="700"
        fontSize="14"
      >
        ₿
      </text>
    </svg>
  );
}
