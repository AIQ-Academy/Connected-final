import Image from "next/image";
import { Check, Cpu, Monitor, Terminal } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import type { Platform } from "@/lib/content";
import { marketingImages } from "@/lib/images";
import { signupUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

const platformIcons: Record<string, typeof Monitor> = {
  mt5: Terminal,
  ctrader: Cpu,
  web: Monitor,
};

export function PlatformPanel({
  platform,
  index,
}: {
  platform: Platform;
  index: number;
}) {
  const Icon = platformIcons[platform.slug] ?? Monitor;
  const flipped = index % 2 === 1;

  return (
    <section
      id={platform.slug}
      aria-labelledby={`${platform.slug}-heading`}
      className="scroll-mt-28"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
        <Reveal className={cn(flipped && "lg:order-2")}>
          <div className="flex items-center gap-3">
            <span className="border-line-soft bg-sunken text-brand-light grid size-10 place-items-center rounded-xl border">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <Badge tone="brand">{platform.tagline}</Badge>
          </div>

          <h2
            id={`${platform.slug}-heading`}
            className="text-h2 mt-6"
          >
            {platform.name}
          </h2>
          <p className="text-lead text-muted mt-4 max-w-xl">{platform.body}</p>

          <div className="border-line-soft mt-7 border-t pt-6">
            <p className="text-faint font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
              Best for
            </p>
            <p className="text-ink mt-2 text-[0.9375rem]">{platform.best}</p>
          </div>

          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {platform.features.map((feature) => (
              <li key={feature} className="flex gap-2.5">
                <Check
                  className="text-mint mt-0.5 size-3.5 shrink-0"
                  aria-hidden="true"
                />
                <span className="text-muted text-[0.8125rem] leading-snug">
                  {feature}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/portal" variant="soft">
              Get access in the portal
            </ButtonLink>
            <ButtonLink href={signupUrl} variant="ghost">
              Create account
            </ButtonLink>
          </div>
        </Reveal>

        <Reveal
          delay={0.08}
          direction={flipped ? "right" : "left"}
          className={cn(flipped && "lg:order-1")}
        >
          <div className="border-line-soft bg-panel scanline relative overflow-hidden rounded-3xl border">
            <div className="relative h-40 overflow-hidden border-b border-line-soft sm:h-48">
              <Image
                src={marketingImages.platforms.src}
                alt={marketingImages.platforms.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="from-bg/30 absolute inset-0 bg-gradient-to-t to-transparent" />
            </div>
            <div className="border-line-soft bg-sunken/70 flex items-center gap-2 border-b px-5 py-3">
              <span className="bg-loss/70 size-2.5 rounded-full" />
              <span className="bg-amber/70 size-2.5 rounded-full" />
              <span className="bg-mint/70 size-2.5 rounded-full" />
              <span className="text-faint ms-2 font-mono text-[0.6875rem] tracking-[0.1em] uppercase">
                {platform.name}
              </span>
            </div>

            <dl className="grid grid-cols-2">
              {platform.spec.map((entry) => (
                <div
                  key={entry.label}
                  className="border-line-soft border-b p-6 odd:border-r"
                >
                  <dt className="text-faint font-mono text-[0.6875rem] tracking-[0.12em] uppercase">
                    {entry.label}
                  </dt>
                  <dd className="text-ink font-display mt-2 text-xl font-semibold">
                    {entry.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="p-6">
              <p className="text-faint font-mono text-[0.6875rem] tracking-[0.12em] uppercase">
                Connects to
              </p>
              <p className="text-muted mt-2 text-sm leading-relaxed">
                The same live account as the other two platforms, on the same
                bridge, with the same risk limits evaluated server-side.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
