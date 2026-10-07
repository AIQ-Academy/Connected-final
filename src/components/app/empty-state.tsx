import Image from "next/image";
import type { ReactNode } from "react";

import { marketingImages } from "@/lib/images";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  imageSrc,
  imageAlt,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
}) {
  const src = imageSrc ?? marketingImages.emptyState.src;
  const alt = imageAlt ?? marketingImages.emptyState.alt;

  return (
    <div
      className={cn(
        "border-line-soft flex flex-col items-center overflow-hidden rounded-[var(--radius-md)] border border-dashed text-center",
        className,
      )}
    >
      <div className="border-line-soft relative h-28 w-full overflow-hidden border-b">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="400px"
          className="object-cover opacity-80"
        />
        <div className="from-bg absolute inset-0 bg-gradient-to-t to-transparent" />
      </div>

      <div className="px-6 py-10">
        {icon && (
          <span className="bg-sunken text-faint mb-4 grid size-11 place-items-center rounded-full [&_svg]:size-5">
            {icon}
          </span>
        )}
        <p className="font-display text-[0.9375rem] font-semibold">{title}</p>
        <p className="text-muted mx-auto mt-1.5 max-w-sm text-[0.8125rem]">
          {description}
        </p>
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}
