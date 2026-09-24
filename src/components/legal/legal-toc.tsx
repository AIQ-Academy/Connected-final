import { sectionId, type LegalSection } from "@/lib/legal-content";

/** Sticky in-page index. Plain anchors, so it works before hydration. */
export function LegalToc({
  sections,
  lastUpdated,
}: {
  sections: LegalSection[];
  lastUpdated: string;
}) {
  return (
    <nav
      aria-label="On this page"
      className="border-line-soft bg-panel rounded-2xl border p-5 lg:sticky lg:top-28"
    >
      <p className="text-faint font-mono text-[0.625rem] tracking-[0.14em] uppercase">
        On this page
      </p>

      <ol className="mask-fade-y mt-4 max-h-[min(60vh,32rem)] space-y-0.5 overflow-y-auto pr-1">
        {sections.map((section, index) => (
          <li key={section.heading}>
            <a
              href={`#${sectionId(index)}`}
              className="text-muted hover:text-ink hover:bg-sunken flex gap-2.5 rounded-lg px-2.5 py-2 text-[0.8125rem] leading-snug transition-colors"
            >
              <span
                aria-hidden="true"
                className="text-faint tabular shrink-0 font-mono text-[0.6875rem]"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              {section.heading}
            </a>
          </li>
        ))}
      </ol>

      <p className="border-line-soft text-faint mt-4 border-t pt-4 text-[0.75rem]">
        Last updated {lastUpdated}
      </p>
    </nav>
  );
}
