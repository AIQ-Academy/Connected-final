import Image from "next/image";
import {
  Clock,
  Globe,
  GraduationCap,
  LayoutDashboard,
  Monitor,
  Rocket,
  Scale,
  ShieldCheck,
  Zap,
} from "lucide-react";

import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { differentiators, type Differentiator } from "@/lib/content";
import type { ResolvedImage } from "@/lib/cms/media";
import { marketingImages } from "@/lib/images";

/** The shared content file stores icon names as strings; resolve them here. */
const iconMap: Record<Differentiator["icon"], typeof ShieldCheck> = {
  ShieldCheck,
  Zap,
  Clock,
  LayoutDashboard,
  Monitor,
  GraduationCap,
  Scale,
  Globe,
  Rocket,
};

export function DifferentiatorGrid({ image }: { image?: ResolvedImage } = {}) {
  const panel = image ?? marketingImages.whyUs;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="relative hidden overflow-hidden rounded-2xl border border-line-soft lg:block">
        <Image
          src={panel.src}
          alt={panel.alt}
          width={520}
          height={640}
          className="h-full min-h-[28rem] w-full object-cover"
          {...("blurDataURL" in panel && panel.blurDataURL
            ? { placeholder: "blur" as const, blurDataURL: panel.blurDataURL }
            : {})}
        />
      </div>
      <StaggerGroup className="grid gap-5 sm:grid-cols-2">
      {differentiators.map((item) => {
        const Icon = iconMap[item.icon];
        return (
          <StaggerItem
            key={item.title}
            className="border-line-soft bg-panel hover:border-brand/40 group relative overflow-hidden rounded-2xl border p-6 transition-colors duration-300"
          >
            <span
              aria-hidden="true"
              className="bg-brand/12 group-hover:bg-brand/25 absolute -top-16 -right-16 size-32 rounded-full blur-2xl transition-colors duration-500"
            />
            <span className="border-line-soft bg-raised text-brand-light relative grid size-11 place-items-center rounded-xl border">
              <Icon className="size-[18px]" aria-hidden="true" />
            </span>
            <h3 className="text-ink font-display relative mt-5 text-base leading-snug font-semibold">
              {item.title}
            </h3>
            <p className="text-muted relative mt-2.5 text-sm leading-relaxed">
              {item.body}
            </p>
          </StaggerItem>
        );
      })}
      </StaggerGroup>
    </div>
  );
}
