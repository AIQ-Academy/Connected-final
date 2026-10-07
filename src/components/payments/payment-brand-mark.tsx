import { Landmark, Wallet } from "lucide-react";

/** Small, recognizable method marks shared by the payment cards and table. */
export function PaymentBrandMark({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  const normalized = name.toLowerCase();
  const base = `inline-flex shrink-0 items-center justify-center rounded-lg border border-line-soft bg-sunken px-2 text-brand-light ${className}`;

  if (normalized.includes("visa")) {
    return <span className={`${base} font-sans text-sm font-black italic tracking-tight`}>VISA</span>;
  }
  if (normalized.includes("mastercard")) {
    return (
      <span className={`${base} gap-0 px-2`} aria-hidden="true">
        <i className="size-4 rounded-full bg-[#eb001b]" />
        <i className="-ms-1.5 size-4 rounded-full bg-[#f79e1b] opacity-90" />
      </span>
    );
  }
  if (normalized.includes("bitcoin")) {
    return <span className={`${base} text-lg font-bold`} aria-hidden="true">₿</span>;
  }
  if (normalized.includes("usdt")) {
    return <span className={`${base} text-sm font-bold`} aria-hidden="true">₮</span>;
  }
  if (normalized.includes("bank")) {
    return <span className={base}><Landmark className="size-4" aria-hidden="true" /></span>;
  }
  if (normalized.includes("omt")) {
    return <span className={`${base} text-xs font-black tracking-wide`}>OMT</span>;
  }
  if (normalized.includes("bob")) {
    return <span className={`${base} text-xs font-black tracking-wide`}>BOB</span>;
  }
  if (normalized.includes("whish")) {
    return <span className={`${base} gap-1 text-[0.65rem] font-bold`}><Wallet className="size-3.5" aria-hidden="true" />whish</span>;
  }

  return <span className={base}><Wallet className="size-4" aria-hidden="true" /></span>;
}
