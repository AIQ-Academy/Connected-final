import { sectionId, type LegalSection } from "@/lib/legal-content";

/**
 * Typographic renderer for the structured legal documents. Written by hand
 * because @tailwindcss/typography is not installed, and because numbered
 * sections need stable anchors the plugin would not give us.
 */
export function LegalProse({ sections }: { sections: LegalSection[] }) {
  return (
    <div className="flex flex-col gap-12">
      {sections.map((section, index) => (
        <section
          key={section.heading}
          id={sectionId(index)}
          className="scroll-mt-28"
        >
          <h2 className="text-ink font-display flex gap-3 text-xl leading-snug font-semibold sm:text-2xl">
            <span
              aria-hidden="true"
              className="text-brand-light tabular shrink-0 font-mono text-base sm:text-lg"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            {section.heading}
          </h2>

          <div className="mt-4 flex flex-col gap-4 sm:ps-[calc(1rem+0.75rem)]">
            {section.paragraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 48)}
                className="text-muted max-w-[68ch] leading-relaxed"
              >
                {paragraph}
              </p>
            ))}

            {section.bullets && (
              <ul className="border-line-soft bg-panel mt-1 max-w-[68ch] space-y-2.5 rounded-2xl border p-5">
                {section.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="text-muted flex gap-3 text-[0.9375rem] leading-relaxed"
                  >
                    <span
                      aria-hidden="true"
                      className="bg-brand mt-2.5 size-1 shrink-0 rounded-full"
                    />
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
