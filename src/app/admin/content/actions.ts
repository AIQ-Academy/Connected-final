"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getDb, hasDatabase } from "@/db";
import { cmsDocuments, siteSettings } from "@/db/schema";
import { recordAudit } from "@/lib/audit";
import { requireRole } from "@/lib/auth";
import { CMS_KEYS, CMS_KEY_ROUTES, cmsSchemas } from "@/lib/cms/schemas";

// Note: actions used in <form action={...}> are typed to return void.

const toggleInput = z.object({
  fundedEnabled: z
    .union([z.literal("true"), z.literal("false")])
    .transform((v) => v === "true"),
  brokerEnabled: z
    .union([z.literal("true"), z.literal("false")])
    .transform((v) => v === "true"),
});

export async function updateSiteSettings(
  formData: FormData,
): Promise<void> {
  const session = await requireRole("admin");
  if (!hasDatabase()) return;

  const parsed = toggleInput.safeParse({
    fundedEnabled: String(formData.get("fundedEnabled") ?? ""),
    brokerEnabled: String(formData.get("brokerEnabled") ?? ""),
  });
  if (!parsed.success) {
    return;
  }

  const { fundedEnabled, brokerEnabled } = parsed.data;

  try {
    const [row] = await getDb().select().from(siteSettings).limit(1);

    if (row) {
      await getDb()
        .update(siteSettings)
        .set({ fundedEnabled, brokerEnabled, updatedAt: new Date() })
        .where(eq(siteSettings.id, row.id));
    } else {
      await getDb().insert(siteSettings).values({
        fundedEnabled,
        brokerEnabled,
      });
    }

    await recordAudit({
      actorId: session.userId,
      action: "admin.site_settings.updated",
      entityType: "site_settings",
      metadata: { fundedEnabled, brokerEnabled },
    });

    revalidatePath("/admin/content");
  } catch (error) {
    console.error("[admin] updateSiteSettings failed", error);
    return;
  }
}

const cmsDocInput = z.object({
  key: z.enum(CMS_KEYS),
  payloadJson: z.string().min(2),
});

export type SaveState =
  | { status: "idle" }
  /** `at` doubles as the token that forces the preview iframe to reload. */
  | { status: "saved"; message: string; at: number }
  | { status: "error"; message: string };

/**
 * Persist a CMS document.
 *
 * The payload is validated against the same schema the public pages read
 * through, so an invalid document is rejected at the door rather than
 * silently falling back to defaults on the next render — an editor who saves
 * a broken field should be told, not left wondering why nothing changed.
 */
export async function saveCmsDocument(
  _state: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const session = await requireRole("admin");
  if (!hasDatabase()) {
    return { status: "error", message: "No database connection." };
  }

  const parsed = cmsDocInput.safeParse({
    key: String(formData.get("key") ?? ""),
    payloadJson: String(formData.get("payloadJson") ?? ""),
  });
  if (!parsed.success) {
    return { status: "error", message: "Unknown document key." };
  }

  const { key, payloadJson } = parsed.data;

  let payload: unknown;
  try {
    payload = JSON.parse(payloadJson);
  } catch {
    return { status: "error", message: "The document is not valid JSON." };
  }

  const validated = cmsSchemas[key].safeParse(payload);
  if (!validated.success) {
    const [first] = validated.error.issues;
    const where = first?.path.join(".") || "document";
    return {
      status: "error",
      message: `${where}: ${first?.message ?? "invalid value"}`,
    };
  }

  try {
    const existing = await getDb()
      .select({ id: cmsDocuments.id })
      .from(cmsDocuments)
      .where(eq(cmsDocuments.key, key));

    if (existing[0]?.id) {
      await getDb()
        .update(cmsDocuments)
        .set({ payload: validated.data, updatedAt: new Date() })
        .where(eq(cmsDocuments.key, key));
    } else {
      await getDb()
        .insert(cmsDocuments)
        .values({ key, payload: validated.data });
    }

    await recordAudit({
      actorId: session.userId,
      action: "admin.cms_document.upserted",
      entityType: "cms_documents",
      metadata: { key },
    });

    revalidatePath(`/admin/content/${key}`);
    revalidatePath("/admin/content");
    // The public route is the point of the edit. Revalidating only the admin
    // pages left the live page serving the previous document until its own
    // 60-second window expired.
    revalidatePath(CMS_KEY_ROUTES[key]);

    return { status: "saved", message: "Saved and published.", at: Date.now() };
  } catch (error) {
    console.error("[admin] saveCmsDocument failed", error);
    return { status: "error", message: "Save failed. Try again." };
  }
}

