import type { Metadata } from "next";
import { createHash } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { AppMain, PageHeader, Panel, PanelHeader } from "@/components/app/panel";
import { getDb, hasDatabase } from "@/db";
import { knowledgeChunks, knowledgeDocuments, knowledgeGaps, knowledgeSyncRuns } from "@/db/schema";
import { allKnowledgeDocuments } from "@/lib/chat/knowledge-retrieval";
import { reviewKnowledgeGap, syncKnowledgeNow } from "@/app/admin/knowledge/actions";
import { KnowledgeSearchTest } from "@/app/admin/knowledge/knowledge-search-test";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Website knowledge", robots: { index: false, follow: false } };

export default async function AdminKnowledgePage() {
  const manifest = await readFile(join(process.cwd(), "knowledge", "manifest.json"), "utf8")
    .then((raw) => JSON.parse(raw) as { generatedAt: string; sourceCount: number; pageCount: number; documentCount: number; hashes?: Record<string, string> })
    .catch(() => null);
  const [staticDocuments, gaps, dbState] = await Promise.all([
    allKnowledgeDocuments().catch(() => []),
    hasDatabase() ? getDb().select().from(knowledgeGaps).where(eq(knowledgeGaps.status, "pending_review")).orderBy(desc(knowledgeGaps.occurrences), desc(knowledgeGaps.lastSeenAt)).limit(200).catch(() => null) : Promise.resolve(null),
    hasDatabase() ? Promise.all([
      getDb().select().from(knowledgeDocuments).catch(() => null),
      getDb().select({ id: knowledgeChunks.id }).from(knowledgeChunks).catch(() => null),
      getDb().select().from(knowledgeSyncRuns).orderBy(desc(knowledgeSyncRuns.startedAt)).limit(10).catch(() => null),
    ]) : Promise.resolve([null, null, null] as const),
  ]);
  const docs = dbState[0]; const chunks = dbState[1]; const runs = dbState[2] ?? [];
  const languageCounts = { en: 0, fr: 0, ar: 0 };
  if (docs?.length) {
    for (const doc of docs) if (doc.language in languageCounts) languageCounts[doc.language as keyof typeof languageCounts]++;
  } else {
    for (const doc of staticDocuments) for (const language of Object.keys(doc.contentByLocale ?? {})) {
      if (language in languageCounts) languageCounts[language as keyof typeof languageCounts]++;
    }
  }
  const latestSync = runs[0];
  const failedCount = runs.filter((run) => run.status === "failed").length;
  const pendingChanges = latestSync ? latestSync.documentsAdded + latestSync.documentsChanged + latestSync.documentsRemoved : 0;
  const pendingSourceFiles = await countChangedSources(manifest?.hashes);
  const semanticReady = Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);

  return <AppMain>
    <PageHeader eyebrow="Website assistant" title="Knowledge & unanswered questions" description="The assistant is grounded in published public website content. Private portal and admin data are excluded; unanswered visitor questions remain review candidates and never become facts automatically." />
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label="Public pages indexed" value={manifest?.pageCount ?? "—"} />
      <Stat label="Knowledge records" value={docs?.length ?? manifest?.documentCount ?? "—"} />
      <Stat label="English · Français · العربية" value={`${languageCounts.en} · ${languageCounts.fr} · ${languageCounts.ar}`} />
      <Stat label="Knowledge chunks" value={chunks?.length ?? "—"} />
    </div>
    <p className="text-sm text-muted-foreground">Source scan: {manifest ? new Date(manifest.generatedAt).toLocaleString() : "No source manifest yet"} · {manifest?.sourceCount ?? "—"} source files. Static source changes are picked up during indexing/build; published CMS, FAQ, market, and news content is checked during chat and admin sync.</p>

    <Panel>
      <PanelHeader title="Knowledge synchronization" description="Localized source hashes drive incremental updates. Removed public content is removed from the active knowledge index; each run records additions, edits, removals, warnings, and failures." />
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 pb-6">
        <div className="text-sm text-muted-foreground">
          <p>{docs ? `${docs.length} documents · ${chunks?.length ?? 0} chunks · ${languageCounts.en} EN / ${languageCounts.fr} FR / ${languageCounts.ar} AR` : "Database index unavailable. Configure and migrate the database for persisted sync."}</p>
          <p className="mt-1">Last sync: {latestSync?.completedAt ? new Date(latestSync.completedAt).toLocaleString() : latestSync ? "In progress" : "No database sync recorded"} · search: lexical {staticDocuments.length ? "ready" : "index missing"}, semantic {semanticReady ? "configured" : "optional / not configured"}</p>
          <p className="mt-1">Pending source files since last scan: {pendingSourceFiles ?? "not available"} · changes in last sync: {pendingChanges} · failed runs in recent history: {failedCount}</p>
        </div>
        <form action={syncKnowledgeNow}><button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90" type="submit">Sync website now</button></form>
      </div>
      {latestSync?.error ? <p className="px-6 pb-5 text-sm text-destructive">Latest sync warning: {latestSync.error}</p> : null}
      <div className="border-t border-border px-6 py-4">
        <h3 className="text-sm font-semibold">Recent changes and indexing runs</h3>
        {!runs.length ? <p className="mt-2 text-sm text-muted-foreground">No persisted runs yet. Use Sync website now after database setup.</p> : <ul className="mt-2 divide-y divide-border">{runs.map((run) => <li key={run.id} className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-2 text-sm"><span>{new Date(run.startedAt).toLocaleString()} · {run.status}{run.error ? ` · ${run.error}` : ""}</span><span className="text-muted-foreground">checked {run.documentsChecked} · +{run.documentsAdded} · changed {run.documentsChanged} · removed {run.documentsRemoved} · chunks {run.chunksUpdated}</span></li>)}</ul>}
      </div>
    </Panel>

    <KnowledgeSearchTest />

    <Panel>
      <PanelHeader title="Unanswered questions" description="Repeated identical questions are grouped. Email addresses and phone numbers are redacted before storage." />
      {!gaps ? <p className="p-6 text-sm text-muted-foreground">Knowledge gap storage is unavailable. Configure and migrate the database to enable this queue.</p>
        : gaps.length === 0 ? <p className="p-6 text-sm text-muted-foreground">No pending knowledge gaps.</p>
          : <ul className="divide-y divide-border">{gaps.map((gap) => <li key={gap.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0"><p className="font-medium">{gap.question}</p><p className="mt-1 text-xs text-muted-foreground">{gap.language.toUpperCase()} · {gap.route ?? "Route unavailable"} · asked {gap.occurrences} {gap.occurrences === 1 ? "time" : "times"} · last {new Date(gap.lastSeenAt).toLocaleString()}</p></div>
            <div className="flex gap-2"><ReviewForm id={gap.id} status="reviewed" label="Reviewed" /><ReviewForm id={gap.id} status="dismissed" label="Dismiss" /></div>
          </li>)}</ul>}
    </Panel>
  </AppMain>;
}

async function countChangedSources(hashes?: Record<string, string>) {
  if (!hashes) return null;
  const checks = await Promise.all(Object.entries(hashes).map(async ([relativePath, expected]) => {
    try {
      const content = await readFile(join(process.cwd(), relativePath));
      return createHash("sha256").update(content).digest("hex") !== expected;
    } catch {
      return true;
    }
  }));
  return checks.filter(Boolean).length;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-xl border border-border bg-card p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div>;
}
function ReviewForm({ id, status, label }: { id: string; status: "reviewed" | "dismissed"; label: string }) {
  return <form action={reviewKnowledgeGap}><input type="hidden" name="id" value={id} /><input type="hidden" name="status" value={status} /><button className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted" type="submit">{label}</button></form>;
}
