"use client";

import { useState, useTransition } from "react";
import { testKnowledgeSearch } from "@/app/admin/knowledge/actions";

type Result = Awaited<ReturnType<typeof testKnowledgeSearch>>;

export function KnowledgeSearchTest() {
  const [result, setResult] = useState<Result | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    const query = String(formData.get("query") ?? "");
    const language = String(formData.get("language") ?? "auto");
    startTransition(async () => setResult(await testKnowledgeSearch({ query, language })));
  }

  return <section className="rounded-xl border border-border bg-card p-5">
    <h2 className="text-lg font-semibold">Test website search</h2>
    <p className="mt-1 text-sm text-muted-foreground">Admin-only preview of retrieved public records and the grounded answer.</p>
    <form action={submit} className="mt-4 flex flex-col gap-3 sm:flex-row">
      <input name="query" required maxLength={500} placeholder="Ask a question, for example: What account types are available?" className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm" />
      <select name="language" aria-label="Answer language" className="rounded-md border border-border bg-background px-3 py-2 text-sm">
        <option value="auto">Detect language</option><option value="en">English</option><option value="fr">French</option><option value="ar">Arabic</option>
      </select>
      <button disabled={pending} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60" type="submit">{pending ? "Searching…" : "Test search"}</button>
    </form>
    {result ? <div className="mt-5 space-y-4" aria-live="polite">
      <div className="rounded-lg bg-muted/50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Generated answer</p><p className="mt-2 whitespace-pre-wrap text-sm">{result.answer}</p></div>
      <div><h3 className="text-sm font-semibold">Retrieved records ({result.records.length})</h3>
        {result.records.length ? <ul className="mt-2 space-y-2">{result.records.map((record, index) => <li key={`${record.route}-${index}`} className="rounded-lg border border-border p-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium"><span>{record.title}</span><span className="text-xs text-muted-foreground">{record.language.toUpperCase()} · {record.category} · {record.route}{record.score !== null ? ` · relevance ${record.score.toFixed(2)}` : ""}</span></div>
          <p className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">{record.excerpt}{record.excerpt.length >= 900 ? "…" : ""}</p>
        </li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">No records met the relevance threshold.</p>}
      </div>
    </div> : null}
  </section>;
}
