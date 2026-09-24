import { Table, TableShell } from "@/components/ui/data-table";
import { NOT_PROVIDED, paymentMethods } from "@/lib/content";
import { cn } from "@/lib/utils";

const caption =
  "Payment rails with minimum, maximum, processing time and daily cap";

function dailyCapLabel(method: (typeof paymentMethods)[number]) {
  if (method.dailyCap === NOT_PROVIDED) return method.dailyCap;
  return method.sharedTerms ? `${method.dailyCap}*` : method.dailyCap;
}

function CellValue({ value }: { value: string }) {
  const placeholder = value === NOT_PROVIDED || value.startsWith(NOT_PROVIDED);
  return (
    <span className={placeholder ? "text-faint" : "text-ink"}>{value}</span>
  );
}

export function MethodTable() {
  return (
    <div>
      <div className="md:hidden">
        <ul className="space-y-3">
          {paymentMethods.map((method) => (
            <li
              key={method.name}
              className="border-line-soft bg-panel rounded-2xl border p-5"
            >
              <p className="text-ink font-display text-[0.9375rem] font-semibold">
                {method.name}
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                <MobileField label="Minimum" value={method.minimum} />
                <MobileField label="Maximum" value={method.maximum} />
                <MobileField label="Processing" value={method.processing} />
                <MobileField label="Daily cap" value={dailyCapLabel(method)} />
              </dl>
            </li>
          ))}
        </ul>
      </div>

      <TableShell caption={caption} className="hidden md:block">
        <Table className="min-w-[720px]">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="bg-[#0e1020]">
              <Th>Payment rail</Th>
              <Th>Minimum</Th>
              <Th>Maximum</Th>
              <Th>Processing</Th>
              <Th>Daily cap</Th>
            </tr>
          </thead>
          <tbody>
            {paymentMethods.map((method, index) => (
              <tr
                key={method.name}
                className={cn(
                  "border-line-soft border-b last:border-b-0",
                  index % 2 === 1 ? "bg-sunken/70" : "bg-panel",
                )}
              >
                <td className="text-ink px-4 py-3.5 pl-5 text-[0.8125rem] font-medium">
                  {method.name}
                </td>
                <td className="tabular px-4 py-3.5 font-mono text-[0.8125rem]">
                  <CellValue value={method.minimum} />
                </td>
                <td className="tabular px-4 py-3.5 font-mono text-[0.8125rem]">
                  <CellValue value={method.maximum} />
                </td>
                <td className="px-4 py-3.5 font-mono text-[0.8125rem]">
                  <CellValue value={method.processing} />
                </td>
                <td className="px-4 py-3.5 pr-5 font-mono text-[0.8125rem]">
                  <CellValue value={dailyCapLabel(method)} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableShell>
    </div>
  );
}

function Th({ children }: { children: string }) {
  return (
    <th
      scope="col"
      className="px-4 py-3.5 text-left font-mono text-[0.6875rem] font-medium tracking-[0.12em] text-white uppercase first:pl-5 last:pr-5"
    >
      {children}
    </th>
  );
}

function MobileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-faint font-mono text-[0.625rem] tracking-[0.12em] uppercase">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1 font-mono text-[0.8125rem]",
          value === NOT_PROVIDED || value.startsWith(NOT_PROVIDED)
            ? "text-faint"
            : "text-ink",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
