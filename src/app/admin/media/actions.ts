"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getDb, hasDatabase } from "@/db";
import { mediaAssets } from "@/db/schema";
import { recordAudit } from "@/lib/audit";
import { requireRole } from "@/lib/auth";
import { affectedPaths, isImageSlotKey } from "@/lib/cms/image-slots";

const altInput = z.object({
  slot: z.string().min(1),
  alt: z.string().trim().min(1).max(300),
});

/**
 * Alt text is the one field worth editing without re-uploading — a caption can
 * be wrong while the crop is fine.
 */
export async function updateMediaAlt(formData: FormData): Promise<void> {
  const session = await requireRole("admin");
  if (!hasDatabase()) return;

  const parsed = altInput.safeParse({
    slot: String(formData.get("slot") ?? ""),
    alt: String(formData.get("alt") ?? ""),
  });
  if (!parsed.success || !isImageSlotKey(parsed.data.slot)) return;

  const { slot, alt } = parsed.data;

  try {
    await getDb()
      .update(mediaAssets)
      .set({ alt, updatedAt: new Date() })
      .where(eq(mediaAssets.slot, slot));

    await recordAudit({
      actorId: session.userId,
      action: "admin.media.alt_updated",
      entityType: "media_asset",
      metadata: { slot, alt },
    });

    revalidatePath("/admin/media");
    for (const path of affectedPaths(slot)) revalidatePath(path);
  } catch (error) {
    console.error("[admin] updateMediaAlt failed", error);
  }
}

/**
 * Drop an uploaded asset so the slot falls back to its shipped default. The
 * blob itself is left in storage — cheap, and it keeps the action reversible
 * by hand if someone deletes the wrong slot.
 */
export async function resetMediaSlot(formData: FormData): Promise<void> {
  const session = await requireRole("admin");
  if (!hasDatabase()) return;

  const slot = String(formData.get("slot") ?? "");
  if (!isImageSlotKey(slot)) return;

  try {
    await getDb().delete(mediaAssets).where(eq(mediaAssets.slot, slot));

    await recordAudit({
      actorId: session.userId,
      action: "admin.media.reset",
      entityType: "media_asset",
      metadata: { slot },
    });

    revalidatePath("/admin/media");
    for (const path of affectedPaths(slot)) revalidatePath(path);
  } catch (error) {
    console.error("[admin] resetMediaSlot failed", error);
  }
}
