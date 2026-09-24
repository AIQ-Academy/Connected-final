"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

import { Button } from "@/components/ui/button";
import type { ImageSlot } from "@/lib/cms/image-slots";

/**
 * Anything larger than this is downscaled in the browser before upload. The
 * server still does the authoritative crop and resize, but a 40-megapixel
 * phone photo base64-encoded is far past what a serverless request body will
 * carry, and 2400px is comfortably above every slot's target width.
 */
const MAX_UPLOAD_EDGE = 2400;

export type UploadResult = {
  url: string;
  bytes: number;
  width: number;
  height: number;
};

type LoadedImage = {
  dataUrl: string;
  width: number;
  height: number;
};

async function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("That file is not a valid image."));
    image.src = src;
  });
}

/** Re-encode through a canvas so the upload body stays a sane size. */
async function prepareSource(file: File): Promise<LoadedImage> {
  const dataUrl = await readFile(file);
  const image = await loadImage(dataUrl);
  const longest = Math.max(image.naturalWidth, image.naturalHeight);

  if (longest <= MAX_UPLOAD_EDGE) {
    return {
      dataUrl,
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
  }

  const scale = MAX_UPLOAD_EDGE / longest;
  const width = Math.round(image.naturalWidth * scale);
  const height = Math.round(image.naturalHeight * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not process that image.");
  context.drawImage(image, 0, 0, width, height);

  return { dataUrl: canvas.toDataURL("image/jpeg", 0.92), width, height };
}

export function CropDialog({
  slot,
  file,
  initialAlt,
  onClose,
  onUploaded,
}: {
  slot: ImageSlot;
  file: File;
  initialAlt: string;
  onClose: () => void;
  onUploaded: (result: UploadResult) => void;
}) {
  const [source, setSource] = useState<LoadedImage | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [alt, setAlt] = useState(initialAlt);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const altRef = useRef<HTMLInputElement>(null);

  // The dialog is keyed on the picked file, so a new file remounts it and
  // this only ever runs against a fresh, empty state.
  useEffect(() => {
    let cancelled = false;

    prepareSource(file)
      .then((loaded) => {
        if (!cancelled) setSource(loaded);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [file]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setArea(pixels);
  }, []);

  async function submit() {
    if (!source || !area) return;

    const trimmed = alt.trim();
    if (!trimmed) {
      setError("Alt text is required — it is what screen readers announce.");
      altRef.current?.focus();
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slot: slot.key,
          alt: trimmed,
          imageBase64: source.dataUrl,
          crop: {
            x: Math.max(0, Math.round(area.x)),
            y: Math.max(0, Math.round(area.y)),
            width: Math.max(1, Math.round(area.width)),
            height: Math.max(1, Math.round(area.height)),
          },
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | (UploadResult & { message?: string })
        | null;

      if (!response.ok || !payload?.url) {
        setError(payload?.message ?? "Upload failed. Try again.");
        return;
      }

      onUploaded(payload);
    } catch {
      setError("Upload failed — check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Crop ${slot.label}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
    >
      <div className="border-line bg-bg flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border">
        <div className="border-line-soft flex items-start justify-between gap-4 border-b px-5 py-4">
          <div>
            <h2 className="font-display text-lg font-semibold">{slot.label}</h2>
            <p className="text-faint mt-1 font-mono text-[0.6875rem] tracking-[0.08em] uppercase">
              {slot.ratioLabel} · {slot.width}×{slot.height}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="bg-sunken relative h-[46vh] min-h-[18rem] w-full">
            {source ? (
              <Cropper
                image={source.dataUrl}
                crop={crop}
                zoom={zoom}
                aspect={slot.ratio}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                objectFit="contain"
                restrictPosition
              />
            ) : (
              <p className="text-faint absolute inset-0 grid place-items-center text-sm">
                {error ?? "Preparing image…"}
              </p>
            )}
          </div>

          <div className="space-y-5 px-5 py-5">
            <label className="block">
              <span className="text-faint font-mono text-[0.6875rem] tracking-[0.08em] uppercase">
                Zoom
              </span>
              <input
                type="range"
                min={1}
                max={4}
                step={0.01}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="accent-brand mt-2 w-full"
                aria-label="Zoom"
              />
            </label>

            <label className="block">
              <span className="text-faint font-mono text-[0.6875rem] tracking-[0.08em] uppercase">
                Alt text
              </span>
              <input
                ref={altRef}
                value={alt}
                onChange={(event) => setAlt(event.target.value)}
                maxLength={300}
                placeholder="Describe what the image shows"
                className="border-line-soft bg-panel mt-2 w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:border-brand-light"
              />
            </label>

            {error && source && (
              <p className="text-loss text-sm" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>

        <div className="border-line-soft flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={busy}
          >
            Discard
          </Button>
          <Button
            type="button"
            onClick={submit}
            disabled={busy || !source || !area}
          >
            {busy ? "Uploading…" : "Crop and upload"}
          </Button>
        </div>
      </div>
    </div>
  );
}
