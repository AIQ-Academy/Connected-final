import { ArrowUpRight, FileText } from "lucide-react";
import Link from "next/link";

import { legalDocuments, type LegalSlug } from "@/lib/legal-content";

/** The other four documents, so a reader never has to go back to the footer. */
export function LegalCrossLinks({ current }: { current: LegalSlug }) {
  const others = legalDocuments.filter((doc) => doc.slug !== current);

  return (
    <nav aria-label="Other legal documents">
      <h2 className="text-h3">The rest of the agreement</h2>
      <p className="text-muted mt-3 max-w-2xl text-sm leading-relaxed">
        These five documents are read together. Where one deals with a subject
        in more detail than another, the more specific one governs it.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {others.map((doc) => (
          <li key={doc.slug}>
            <Link
              href={`/legal/${doc.slug}`}
              className="border-line-soft bg-panel hover:border-brand/45 group flex h-full gap-4 rounded-2xl border p-5 transition-colors"
            >
              <span className="border-line-soft bg-raised text-brand-light grid size-10 shrink-0 place-items-center rounded-xl border">
                <FileText className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="text-ink font-display flex items-center gap-1.5 text-[0.9375rem] font-semibold">
                  {doc.title}
                  <ArrowUpRight
                    aria-hidden="true"
                    className="text-faint group-hover:text-brand-light size-3.5 transition-colors"
                  />
                </span>
                <span className="text-muted mt-1.5 block text-[0.8125rem] leading-relaxed">
                  {doc.description}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
