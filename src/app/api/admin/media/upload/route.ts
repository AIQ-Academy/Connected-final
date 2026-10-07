import { z } from "zod";
import sharp from "sharp";
import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getDb, hasDatabase } from "@/db";
import { mediaAssets } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { affectedPaths, getImageSlot } from "@/lib/cms/image-slots";

// `sharp` is a native module, so this handler cannot run on the edge.
export const runtime = "nodejs";

/** Decoded source image ceiling. Roughly a 40-megapixel JPEG. */
const MAX_SOURCE_BYTES = 12 * 1024 * 1024;

/** WebP quality. High enough that a crop is visually lossless at 1× and 2×. */
const OUTPUT_QUALITY = 82;

const uploadInput = z.object({
  slot: z.string().min(1).max(120),
  alt: z.string().trim().min(1).max(300),
  imageBase64: z.string().min(10),
  crop: z.object({
    // Pixel rect inside the *uploaded* image, as reported by the crop UI.
    x: z.number().int().nonnegative(),
    y: z.number().int().nonnegative(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }),
});

function badRequest(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

export async function POST(request: Request) {
  const session = await requireRole("admin");

  if (!hasDatabase()) {
    return badRequest("Media upload is temporarily unavailable.", 503);
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return badRequest(
      "Blob storage is not configured. Set BLOB_READ_WRITE_TOKEN.",
      503,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid request body.");
  }

  const parsed = uploadInput.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid upload payload.");
  }

  const { slot, alt, imageBase64, crop } = parsed.data;

  // The registry decides the output geometry, not the client — otherwise an
  // editor could quietly break a layout by posting a different aspect ratio.
  const registered = getImageSlot(slot);
  if (!registered) {
    return badRequest(`Unknown image slot "${slot}".`);
  }

  const base64 = imageBase64.replace(/^data:.*?;base64,/, "");
  if (base64.length > (MAX_SOURCE_BYTES / 3) * 4) {
    return badRequest("Image is too large. Upload something under 12 MB.", 413);
  }

  const inputBuffer = Buffer.from(base64, "base64");
  if (inputBuffer.byteLength === 0) {
    return badRequest("Image data could not be decoded.");
  }
  if (inputBuffer.byteLength > MAX_SOURCE_BYTES) {
    return badRequest("Image is too large. Upload something under 12 MB.", 413);
  }

  try {
    const source = sharp(inputBuffer, { failOn: "error" });
    const metadata = await source.metadata();

    if (!metadata.width || !metadata.height) {
      return badRequest("Unsupported image format.");
    }

    // Crop UIs round their pixel rect, which can land a pixel outside the
    // source and make `extract` throw. Clamp instead of rejecting the upload.
    const left = Math.min(crop.x, metadata.width - 1);
    const top = Math.min(crop.y, metadata.height - 1);
    const width = Math.max(1, Math.min(crop.width, metadata.width - left));
    const height = Math.max(1, Math.min(crop.height, metadata.height - top));

    const cropped = sharp(inputBuffer, { failOn: "error" })
      .rotate()
      .extract({ left, top, width, height });

    const outputBuffer = await cropped
      .clone()
      .resize(registered.width, registered.height, {
        fit: "cover",
        kernel: sharp.kernel.lanczos3,
      })
      .webp({ quality: OUTPUT_QUALITY, effort: 4 })
      .toBuffer();

    // A 16px-wide render is enough for a blur placeholder and keeps the data
    // URL small enough to inline in the HTML payload without regret.
    const placeholder = await cropped
      .clone()
      .resize(16, Math.max(1, Math.round(16 / registered.ratio)), {
        fit: "cover",
      })
      .webp({ quality: 40 })
      .toBuffer();

    const blurDataUrl = `data:image/webp;base64,${placeholder.toString("base64")}`;

    // A fresh pathname per upload sidesteps both the blob overwrite guard and
    // any CDN copy of the previous image at the old URL.
    const blob = await put(
      `media/${slot}-${Date.now().toString(36)}.webp`,
      outputBuffer,
      {
        access: "public",
        contentType: "image/webp",
        cacheControlMaxAge: 60 * 60 * 24 * 365,
      },
    );

    const db = getDb();
    const [existing] = await db
      .select({ id: mediaAssets.id })
      .from(mediaAssets)
      .where(eq(mediaAssets.slot, slot))
      .limit(1);

    const values = {
      blobUrl: blob.url,
      width: registered.width,
      height: registered.height,
      alt,
      blurDataUrl,
    };

    if (existing?.id) {
      await db
        .update(mediaAssets)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(mediaAssets.id, existing.id));
    } else {
      await db.insert(mediaAssets).values({ slot, ...values });
    }

    await recordAudit({
      actorId: session.userId,
      action: "admin.media.uploaded",
      entityType: "media_asset",
      metadata: {
        slot,
        width: registered.width,
        height: registered.height,
        bytes: outputBuffer.byteLength,
      },
    });

    revalidatePath("/admin/media");
    for (const path of affectedPaths(slot)) {
      revalidatePath(path);
    }

    return NextResponse.json({
      ok: true,
      url: blob.url,
      width: registered.width,
      height: registered.height,
      bytes: outputBuffer.byteLength,
      blurDataUrl,
    });
  } catch (error) {
    console.error("[admin/media/upload] failed", error);
    return badRequest("Upload failed. Try again.", 500);
  }
}
