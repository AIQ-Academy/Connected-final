import { AlertTriangle } from "lucide-react";

import { legalTemplateNotice } from "@/lib/legal-content";

/**
 * Every legal document opens with this. It is deliberately loud: the copy
 * below reads like a finished policy and must not be mistaken for one that
 * has been through counsel.
 */
export function TemplateNotice() {
  return (
    <aside
      role="note"
      aria-labelledby="legal-template-notice"
      className="border-amber/40 bg-amber/10 flex gap-4 rounded-2xl border p-5 sm:p-6"
    >
      <AlertTriangle
        className="text-amber mt-0.5 size-5 shrink-0"
        aria-hidden="true"
      />
      <div>
        <p
          id="legal-template-notice"
          className="text-amber font-mono text-[0.6875rem] font-medium tracking-[0.14em] uppercase"
        >
          {legalTemplateNotice.title}
        </p>
        <p className="text-ink mt-2.5 text-sm leading-relaxed">
          {legalTemplateNotice.body}
        </p>
      </div>
    </aside>
  );
}
