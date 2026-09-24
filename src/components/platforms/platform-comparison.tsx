import { Table, TableShell, Td, Th, Tr } from "@/components/ui/data-table";
import { platforms } from "@/lib/content";
import { cn } from "@/lib/utils";

/** Pulls a value straight off the published spec so the table cannot drift. */
function fromSpec(slug: string, label: string) {
  const platform = platforms.find((entry) => entry.slug === slug);
  return platform?.spec.find((entry) => entry.label === label)?.value ?? "—";
}

type ComparisonRow = {
  label: string;
  values: Record<string, string>;
};

const rows: ComparisonRow[] = [
  {
    label: "Order types",
    values: {
      mt5: fromSpec("mt5", "Order types"),
      ctrader: fromSpec("ctrader", "Order types"),
      web: fromSpec("web", "Order types"),
    },
  },
  {
    label: "Charting timeframes",
    values: {
      mt5: fromSpec("mt5", "Charting timeframes"),
      ctrader: fromSpec("ctrader", "Charting timeframes"),
      web: fromSpec("web", "Charting timeframes"),
    },
  },
  {
    label: "Automation",
    values: {
      mt5: fromSpec("mt5", "Automation"),
      ctrader: fromSpec("ctrader", "Automation"),
      web: fromSpec("web", "Automation"),
    },
  },
  {
    label: "Hedging",
    values: {
      mt5: fromSpec("mt5", "Hedging"),
      ctrader: fromSpec("ctrader", "Hedging"),
      web: fromSpec("web", "Hedging"),
    },
  },
  {
    label: "Custom indicators",
    values: {
      mt5: "Unlimited",
      ctrader: "Unlimited",
      web: "Built-in set",
    },
  },
  {
    label: "Strategy tester",
    values: {
      mt5: "Real tick data",
      ctrader: "Tick and bar data",
      web: "Not available",
    },
  },
  {
    label: "Depth of market",
    values: {
      mt5: "Aggregated book",
      ctrader: "Full Level II",
      web: "Top of book",
    },
  },
  {
    label: "Desktop build",
    values: {
      mt5: "Windows",
      ctrader: "Windows and macOS",
      web: "None needed",
    },
  },
  {
    label: "Native macOS app",
    values: { mt5: "No", ctrader: "Yes", web: "Runs in the browser" },
  },
  {
    label: "Mobile app",
    values: {
      mt5: "iOS and Android",
      ctrader: "iOS and Android",
      web: "Any mobile browser",
    },
  },
  {
    label: "Install required",
    values: { mt5: "Yes, for desktop", ctrader: "Yes, for desktop", web: "No" },
  },
  {
    label: "Multi-monitor charting",
    values: {
      mt5: "Detached chart windows",
      ctrader: "Detachable workspace",
      web: "Single window",
    },
  },
  {
    label: "Live drawdown headroom",
    values: {
      mt5: "Client portal",
      ctrader: "Client portal",
      web: "In the header",
    },
  },
];

export function PlatformComparison() {
  const caption =
    "MetaTrader 5, cTrader and the Web Terminal compared across execution, automation and access";

  return (
    <TableShell caption={caption}>
      <Table className="min-w-[760px]">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <Th className="pl-5 min-w-[14rem]">Capability</Th>
            {platforms.map((platform) => (
              <Th key={platform.slug} className="text-right last:pr-5">
                <span className="text-ink block text-[0.8125rem] font-semibold tracking-normal normal-case">
                  {platform.name}
                </span>
                <span className="text-faint block text-[0.6875rem] font-normal tracking-normal normal-case">
                  {platform.tagline}
                </span>
              </Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <Tr key={row.label}>
              <Td className="text-ink pl-5 text-[0.8125rem] font-medium">
                {row.label}
              </Td>
              {platforms.map((platform) => {
                const value = row.values[platform.slug] ?? "—";
                const negative = value === "No" || value === "Not supported" || value === "Not available";

                return (
                  <Td
                    key={platform.slug}
                    className={cn(
                      "tabular text-right font-mono text-[0.8125rem] last:pr-5",
                      negative ? "text-faint" : "text-muted",
                    )}
                  >
                    {value}
                  </Td>
                );
              })}
            </Tr>
          ))}
        </tbody>
      </Table>
    </TableShell>
  );
}
