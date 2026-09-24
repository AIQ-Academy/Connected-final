import "server-only";

import { getDb, hasDatabase } from "@/db";
import { auditLogs } from "@/db/schema";

type AuditEntry = {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
};

/**
 * Accountability trail for anything that mutates trader-visible state.
 * Never throws: a failed audit write must not roll back the action the
 * trader or admin just took, but it does get surfaced in the server log.
 */
export async function recordAudit(entry: AuditEntry): Promise<void> {
  if (!hasDatabase()) return;
  try {
    await getDb()
      .insert(auditLogs)
      .values({
        actorId: entry.actorId ?? null,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId ?? null,
        metadata: entry.metadata ?? null,
      });
  } catch (error) {
    console.error(`[audit] failed to record ${entry.action}`, error);
  }
}
