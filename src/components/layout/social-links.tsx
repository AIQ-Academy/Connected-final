import type { ReactElement } from "react";

import { socials } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * lucide-react v1 no longer ships brand marks, so each network is drawn here
 * from its official glyph rather than substituting a generic icon.
 */
type IconProps = { className?: string };

function XIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817-5.967 6.817H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      aria-hidden="true"
      className={className}
    >
      <rect x="2.6" y="2.6" width="18.8" height="18.8" rx="5.4" />
      <circle cx="12" cy="12" r="4.05" />
      <circle cx="17.5" cy="6.5" r="1.05" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YouTubeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M23.5 6.9a3.02 3.02 0 0 0-2.12-2.14C19.5 4.25 12 4.25 12 4.25s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.9C0 8.79 0 12 0 12s0 3.21.5 5.1a3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14C24 15.21 24 12 24 12s0-3.21-.5-5.1M9.55 15.57V8.43L15.82 12z" />
    </svg>
  );
}

function TelegramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M21.94 4.1 18.63 19.7c-.25 1.1-.9 1.38-1.83.86l-5.05-3.72-2.44 2.34c-.27.27-.5.5-1.02.5l.36-5.14L18.01 6.1c.4-.36-.09-.56-.63-.2L4.82 13.86l-5.02-1.57c-1.09-.34-1.11-1.09.23-1.62l19.62-7.56c.9-.34 1.7.2 1.29 3z" transform="translate(1.2 0)" />
    </svg>
  );
}

function DiscordIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.32 4.57A19.8 19.8 0 0 0 15.43 3c-.24.42-.5.99-.69 1.44a18.3 18.3 0 0 0-5.48 0C9.07 3.99 8.8 3.42 8.57 3a19.7 19.7 0 0 0-4.9 1.57C.56 9.2-.28 13.72.14 18.17a19.9 19.9 0 0 0 6.03 3.06c.49-.67.92-1.38 1.29-2.12-.71-.27-1.39-.6-2.03-.98.17-.13.34-.26.5-.4a14.2 14.2 0 0 0 12.14 0c.16.14.33.27.5.4-.64.38-1.32.71-2.03.98.37.74.8 1.45 1.29 2.12a19.85 19.85 0 0 0 6.04-3.06c.5-5.16-.84-9.64-3.55-13.6M8.02 15.45c-1.18 0-2.15-1.09-2.15-2.42s.95-2.43 2.15-2.43 2.17 1.09 2.15 2.43c0 1.33-.95 2.42-2.15 2.42m7.96 0c-1.18 0-2.15-1.09-2.15-2.42s.95-2.43 2.15-2.43 2.17 1.09 2.15 2.43c0 1.33-.94 2.42-2.15 2.42" />
    </svg>
  );
}

function LinkedInIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13m1.78 13.02H3.55V9h3.57zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0" />
    </svg>
  );
}

const iconFor: Record<string, (props: IconProps) => ReactElement> = {
  X: XIcon,
  Instagram: InstagramIcon,
  YouTube: YouTubeIcon,
  Telegram: TelegramIcon,
  Discord: DiscordIcon,
  LinkedIn: LinkedInIcon,
};

export function SocialLinks({
  className,
  size = "md",
  tone = "default",
}: {
  className?: string;
  size?: "sm" | "md";
  tone?: "default" | "onDark";
}) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-2", className)}>
      {socials.map((social) => {
        const Icon = iconFor[social.label] ?? XIcon;
        return (
          <li key={social.label}>
            <a
              href={social.href}
              target="_blank"
              rel="noreferrer noopener"
              title={`${social.label} — ${social.handle}`}
              aria-label={`${social.label}: ${social.handle}`}
              className={cn(
                "grid place-items-center rounded-lg border transition-colors",
                size === "sm" ? "size-8" : "size-9",
                tone === "onDark"
                  ? "border-white/18 text-white/70 hover:border-white/40 hover:bg-white/10 hover:text-white"
                  : "border-line text-muted hover:text-brand-light hover:border-brand-light/60 hover:bg-brand-dim/25",
              )}
            >
              <Icon className={size === "sm" ? "size-3.5" : "size-4"} />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/** Exposed so the social-wall section can render the same marks at any size. */
export { XIcon, InstagramIcon, YouTubeIcon, TelegramIcon, DiscordIcon, LinkedInIcon };
