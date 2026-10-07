import { ArrowUpRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.47 14.38c-.28-.14-1.65-.81-1.9-.9-.26-.1-.44-.14-.63.14-.18.28-.72.9-.88 1.08-.16.18-.33.2-.61.07-.28-.14-1.17-.43-2.23-1.37-.82-.73-1.38-1.64-1.54-1.92-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.5.14-.16.18-.28.28-.47.09-.18.05-.35-.02-.49-.07-.14-.63-1.51-.86-2.07-.23-.55-.46-.47-.63-.48h-.54c-.18 0-.48.07-.73.35-.25.28-.96.94-.96 2.29s.98 2.65 1.12 2.83c.14.18 1.93 2.95 4.68 4.13.65.28 1.16.45 1.56.58.65.21 1.25.18 1.72.11.52-.08 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.11-.25-.18-.53-.32M12.05 2C6.5 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.08L2 22l5.07-1.33A9.95 9.95 0 0 0 12.05 22C17.6 22 22 17.52 22 12S17.6 2 12.05 2" />
    </svg>
  );
}

type WhatsAppCtaProps = {
  className?: string;
  size?: "md" | "lg";
  /** Compact pill for hero / toolbar rows. */
  compact?: boolean;
  label?: string;
};

/**
 * Primary WhatsApp deep-link. Uses mint (the site's live/funded accent) rather
 * than WhatsApp brand green so the control stays on-palette.
 */
export function WhatsAppCta({
  className,
  size = "lg",
  compact = false,
  label = site.whatsapp.label,
}: WhatsAppCtaProps) {
  return (
    <a
      href={site.whatsapp.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        buttonVariants({ variant: "mint", size }),
        "shadow-[0_12px_32px_-16px_rgb(12_157_118/0.55)]",
        className,
      )}
    >
      <WhatsAppIcon className={size === "lg" ? "size-[18px]" : "size-4"} />
      {label}
      {!compact && <ArrowUpRight className="size-4 opacity-80" aria-hidden="true" />}
    </a>
  );
}

export { WhatsAppIcon };
