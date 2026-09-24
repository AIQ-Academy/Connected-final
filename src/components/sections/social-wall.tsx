import { ExternalLink } from "lucide-react";
import type { ReactElement } from "react";

import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import {
  DiscordIcon,
  InstagramIcon,
  LinkedInIcon,
  TelegramIcon,
  XIcon,
  YouTubeIcon,
} from "@/components/layout/social-links";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { socials } from "@/lib/site";

type SocialLabel = (typeof socials)[number]["label"];

type NetworkMeta = {
  icon: (props: { className?: string }) => ReactElement;
  followers: string;
  reason: string;
  /** Brand-tinted hover treatment, kept to a single accent per tile. */
  tile: string;
  mark: string;
};

const NETWORKS: Record<SocialLabel, NetworkMeta> = {
  X: {
    icon: XIcon,
    followers: "48.2K",
    reason: "Running commentary through the London and New York overlap.",
    tile: "hover:border-[#8b98a5]/50",
    mark: "group-hover:bg-[#8b98a5]/12 group-hover:text-[#e7e9ea] group-hover:border-[#8b98a5]/40",
  },
  Instagram: {
    icon: InstagramIcon,
    followers: "61.4K",
    reason: "Payout receipts and the trades behind them, posted the day they clear.",
    tile: "hover:border-[#e1306c]/50",
    mark: "group-hover:bg-[#e1306c]/12 group-hover:text-[#f472a6] group-hover:border-[#e1306c]/40",
  },
  YouTube: {
    icon: YouTubeIcon,
    followers: "27.9K",
    reason: "Full evaluation walkthroughs filmed on live funded accounts.",
    tile: "hover:border-[#ff3d3d]/50",
    mark: "group-hover:bg-[#ff3d3d]/12 group-hover:text-[#ff7a7a] group-hover:border-[#ff3d3d]/40",
  },
  Telegram: {
    icon: TelegramIcon,
    followers: "34.6K",
    reason: "Session-open levels and high-impact event alerts.",
    tile: "hover:border-[#229ed9]/50",
    mark: "group-hover:bg-[#229ed9]/12 group-hover:text-[#6ec6f0] group-hover:border-[#229ed9]/40",
  },
  Discord: {
    icon: DiscordIcon,
    followers: "19.3K",
    reason: "Weekly trade reviews with the desk and other funded traders.",
    tile: "hover:border-[#5865f2]/50",
    mark: "group-hover:bg-[#5865f2]/12 group-hover:text-[#98a1ff] group-hover:border-[#5865f2]/40",
  },
  LinkedIn: {
    icon: LinkedInIcon,
    followers: "12.1K",
    reason: "How we set risk parameters, plus firm and hiring news.",
    tile: "hover:border-[#0a66c2]/50",
    mark: "group-hover:bg-[#0a66c2]/12 group-hover:text-[#6aa9e9] group-hover:border-[#0a66c2]/40",
  },
};

export function SocialWallSection() {
  return (
    <Section className="relative overflow-hidden">
      <Container className="relative">
        <SectionHeading
          eyebrow="Follow the desk"
          title="Six channels, one trading desk"
          lead="Levels before the session opens, event alerts as they land and payout proof once they clear. Pick the channel that fits how you work."
        />

        <StaggerGroup
          role="list"
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {socials.map((social) => {
            const meta = NETWORKS[social.label];
            const Icon = meta.icon;

            return (
              <StaggerItem role="listitem" key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`Follow Connect Funded on ${social.label} — ${social.handle}, opens in a new tab`}
                  className={`border-line-soft bg-panel group relative flex h-full flex-col rounded-2xl border p-5 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 ${meta.tile}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={`border-line bg-sunken text-muted grid size-11 place-items-center rounded-xl border transition-colors duration-300 ${meta.mark}`}
                      aria-hidden="true"
                    >
                      <Icon className="size-[18px]" />
                    </span>
                    <ExternalLink
                      className="text-faint group-hover:text-ink size-4 transition-colors"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="mt-5 flex items-baseline justify-between gap-3">
                    <span className="text-ink font-display text-base font-semibold">
                      {social.label}
                    </span>
                    <span className="text-faint tabular font-mono text-[0.6875rem] tracking-[0.06em] uppercase">
                      {meta.followers} followers
                    </span>
                  </div>

                  <span className="text-faint mt-1 block font-mono text-xs">
                    {social.handle}
                  </span>

                  <p className="text-muted border-line-soft mt-4 border-t pt-4 text-[0.8125rem] leading-relaxed">
                    {meta.reason}
                  </p>
                </a>
              </StaggerItem>
            );
          })}
        </StaggerGroup>

        <p className="text-faint mt-6 text-xs leading-relaxed">
          Follower counts are indicative and refreshed monthly. Nothing posted
          on these channels is financial advice, and no Connect Funded team
          member will ever ask you for account credentials or a payment outside
          the client portal.
        </p>
      </Container>
    </Section>
  );
}
