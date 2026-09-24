"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { groupedImageSlots, type ImageSlot } from "@/lib/cms/image-slots";
import { CropDialog, type UploadResult } from "@/app/admin/media/crop-dialog";

export type SlotState = {
  slot: string;
  blobUrl: string;
  alt: string;
  width: number;
  height: number;
  blurDataUrl: string | null;
};

type Feedback = { slot: string; tone: "ok" | "error"; message: string };

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaGrid({
  assets,
  updateAlt,
  resetSlot,
}: {
  assets: SlotState[];
  updateAlt: (formData: FormData) => Promise<void>;
  resetSlot: (formData: FormData) => Promise<void>;
}) {
  const router = useRouter();
  const groups = groupedImageSlots();
  const assetMap = new Map(assets.map((asset) => [asset.slot, asset]));

  const [pending, setPending] = useState<{ slot: ImageSlot; file: File } | null>(
    null,
  );
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  function onUploaded(slotKey: string, result: UploadResult) {
    setPending(null);
    setFeedback({
      slot: slotKey,
      tone: "ok",
      message: `Uploaded — ${result.width}×${result.height} WebP, ${formatBytes(result.bytes)}.`,
    });
    router.refresh();
  }

  return (
    <div className="space-y-12">
      {groups.map(({ group, slots }) => (
        <section key={group}>
          <h2 className="font-display text-lg font-semibold">{group}</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {slots.map((slot) => (
              <SlotCard
                key={slot.key}
                slot={slot}
                asset={assetMap.get(slot.key) ?? null}
                feedback={feedback?.slot === slot.key ? feedback : null}
                onPick={(file) => {
                  setFeedback(null);
                  setPending({ slot, file });
                }}
                onError={(message) =>
                  setFeedback({ slot: slot.key, tone: "error", message })
                }
                updateAlt={updateAlt}
                resetSlot={resetSlot}
              />
            ))}
          </div>
        </section>
      ))}

      {pending && (
        <CropDialog
          key={`${pending.slot.key}:${pending.file.name}:${pending.file.lastModified}`}
          slot={pending.slot}
          file={pending.file}
          initialAlt={
            assetMap.get(pending.slot.key)?.alt ?? pending.slot.fallback.alt
          }
          onClose={() => setPending(null)}
          onUploaded={(result) => onUploaded(pending.slot.key, result)}
        />
      )}
    </div>
  );
}

function SlotCard({
  slot,
  asset,
  feedback,
  onPick,
  onError,
  updateAlt,
  resetSlot,
}: {
  slot: ImageSlot;
  asset: SlotState | null;
  feedback: Feedback | null;
  onPick: (file: File) => void;
  onError: (message: string) => void;
  updateAlt: (formData: FormData) => Promise<void>;
  resetSlot: (formData: FormData) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const src = asset?.blobUrl ?? slot.fallback.src;
  const alt = asset?.alt ?? slot.fallback.alt;

  return (
    <article className="border-line-soft bg-panel flex flex-col overflow-hidden rounded-2xl border">
      <div
        className="bg-sunken relative w-full"
        style={{ aspectRatio: `${slot.width} / ${slot.height}` }}
      >
        <Image
          src={src}
          alt=""
          fill
          sizes="(min-width: 1280px) 24vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover"
          {...(asset?.blurDataUrl
            ? { placeholder: "blur" as const, blurDataURL: asset.blurDataUrl }
            : {})}
        />
        <Badge
          tone={asset ? "mint" : "neutral"}
          className="absolute top-3 left-3 backdrop-blur-sm"
        >
          {slot.ratioLabel}
        </Badge>
        {!asset && (
          <Badge tone="amber" className="absolute top-3 right-3 backdrop-blur-sm">
            Default
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="font-display text-[0.9375rem] font-semibold">
            {slot.label}
          </h3>
          <p className="text-faint mt-1 text-xs leading-relaxed">{slot.usage}</p>
          <p className="text-faint mt-2 font-mono text-[0.625rem] tracking-[0.08em]">
            {slot.key} · {slot.width}×{slot.height}
          </p>
        </div>

        {asset ? (
          <form action={updateAlt} className="space-y-2">
            <input type="hidden" name="slot" value={slot.key} />
            <label className="block">
              <span className="text-faint font-mono text-[0.625rem] tracking-[0.08em] uppercase">
                Alt text
              </span>
              <input
                name="alt"
                defaultValue={alt}
                maxLength={300}
                className="border-line-soft bg-sunken/60 mt-1.5 w-full rounded-lg border px-3 py-2 text-[0.8125rem] outline-none focus:border-brand-light"
              />
            </label>
            <Button type="submit" variant="ghost" size="sm">
              Save alt text
            </Button>
          </form>
        ) : (
          <p className="text-muted text-[0.8125rem] leading-relaxed">
            <span className="text-faint font-mono text-[0.625rem] tracking-[0.08em] uppercase">
              Alt
            </span>
            <br />
            {alt}
          </p>
        )}

        {feedback && (
          <p
            role="status"
            className={
              feedback.tone === "ok"
                ? "text-mint text-[0.8125rem]"
                : "text-loss text-[0.8125rem]"
            }
          >
            {feedback.message}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              if (!file.type.startsWith("image/")) {
                onError("Pick a PNG, JPEG, WebP or AVIF image.");
                return;
              }
              onPick(file);
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="soft"
            onClick={() => inputRef.current?.click()}
          >
            {asset ? "Replace" : "Upload"}
          </Button>
          {asset && (
            <form action={resetSlot}>
              <input type="hidden" name="slot" value={slot.key} />
              <Button type="submit" size="sm" variant="ghost">
                Reset to default
              </Button>
            </form>
          )}
        </div>
      </div>
    </article>
  );
}
