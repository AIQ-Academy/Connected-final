"use client";

import { useActionState, useMemo, useState } from "react";
import { Monitor, RotateCcw, Smartphone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cmsFormSections, type FormField } from "@/lib/cms/form-schema";
import { CMS_KEY_ROUTES, type CmsKey } from "@/lib/cms/schemas";
import { cn } from "@/lib/utils";
import type { SaveState } from "@/app/admin/content/actions";

type Doc = Record<string, unknown>;

function readPath(doc: Doc, path: string): unknown {
  return path.split(".").reduce<unknown>((node, segment) => {
    if (node && typeof node === "object" && segment in node) {
      return (node as Record<string, unknown>)[segment];
    }
    return undefined;
  }, doc);
}

/** Immutable set-at-path so React sees a new object for every keystroke. */
function writePath(doc: Doc, path: string, value: unknown): Doc {
  const [head, ...rest] = path.split(".");
  if (rest.length === 0) return { ...doc, [head]: value };

  const child = doc[head];
  const base = child && typeof child === "object" && !Array.isArray(child)
    ? (child as Doc)
    : {};

  return { ...doc, [head]: writePath(base, rest.join("."), value) };
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asRows(value: unknown): Doc[] {
  return Array.isArray(value)
    ? value.map((row) =>
        row && typeof row === "object" ? (row as Doc) : ({} as Doc),
      )
    : [];
}

const inputClass =
  "border-line-soft bg-sunken/60 w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-brand-light";

function FieldLabel({ label, help }: { label: string; help?: string }) {
  return (
    <>
      <span className="text-faint font-mono text-[0.625rem] tracking-[0.1em] uppercase">
        {label}
      </span>
      {help && <span className="text-faint mt-1 block text-xs">{help}</span>}
    </>
  );
}

function Field({
  field,
  doc,
  onChange,
}: {
  field: FormField;
  doc: Doc;
  onChange: (path: string, value: unknown) => void;
}) {
  if (field.kind === "text") {
    return (
      <label className="block">
        <FieldLabel label={field.label} help={field.help} />
        <input
          className={cn(inputClass, "mt-1.5")}
          value={asString(readPath(doc, field.path))}
          onChange={(event) => onChange(field.path, event.target.value)}
        />
      </label>
    );
  }

  if (field.kind === "textarea") {
    return (
      <label className="block">
        <FieldLabel label={field.label} help={field.help} />
        <textarea
          rows={3}
          className={cn(inputClass, "mt-1.5 leading-relaxed")}
          value={asString(readPath(doc, field.path))}
          onChange={(event) => onChange(field.path, event.target.value)}
        />
      </label>
    );
  }

  if (field.kind === "lines") {
    const value = readPath(doc, field.path);
    const lines = Array.isArray(value) ? value.map(asString) : [];
    return (
      <label className="block">
        <FieldLabel label={field.label} help={field.help} />
        <textarea
          rows={Math.max(2, lines.length)}
          className={cn(inputClass, "mt-1.5 leading-relaxed")}
          value={lines.join("\n")}
          onChange={(event) =>
            onChange(
              field.path,
              event.target.value.split("\n").map((line) => line.trim()),
            )
          }
        />
      </label>
    );
  }

  if (field.kind === "link") {
    return (
      <fieldset className="border-line-soft rounded-xl border p-3">
        <legend className="text-faint px-1 font-mono text-[0.625rem] tracking-[0.1em] uppercase">
          {field.label}
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            className={inputClass}
            placeholder="Label"
            value={asString(readPath(doc, `${field.path}.label`))}
            onChange={(event) =>
              onChange(`${field.path}.label`, event.target.value)
            }
          />
          <input
            className={cn(inputClass, "font-mono text-[0.8125rem]")}
            placeholder="/href"
            value={asString(readPath(doc, `${field.path}.href`))}
            onChange={(event) =>
              onChange(`${field.path}.href`, event.target.value)
            }
          />
        </div>
      </fieldset>
    );
  }

  const rows = asRows(readPath(doc, field.path));

  return (
    <fieldset className="border-line-soft rounded-xl border p-3">
      <legend className="text-faint px-1 font-mono text-[0.625rem] tracking-[0.1em] uppercase">
        {field.label}
      </legend>
      {field.help && <p className="text-faint mb-2 text-xs">{field.help}</p>}

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div
            key={index}
            className="border-line-soft bg-sunken/30 rounded-lg border p-3"
          >
            <div className="grid gap-2">
              {field.itemFields.map((item) =>
                item.kind === "textarea" ? (
                  <textarea
                    key={item.key}
                    rows={2}
                    className={inputClass}
                    placeholder={item.label}
                    value={asString(row[item.key])}
                    onChange={(event) => {
                      const next = rows.map((entry, i) =>
                        i === index
                          ? { ...entry, [item.key]: event.target.value }
                          : entry,
                      );
                      onChange(field.path, next);
                    }}
                  />
                ) : (
                  <input
                    key={item.key}
                    className={inputClass}
                    placeholder={item.label}
                    value={asString(row[item.key])}
                    onChange={(event) => {
                      const next = rows.map((entry, i) =>
                        i === index
                          ? { ...entry, [item.key]: event.target.value }
                          : entry,
                      );
                      onChange(field.path, next);
                    }}
                  />
                ),
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() =>
                onChange(
                  field.path,
                  rows.filter((_, i) => i !== index),
                )
              }
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={() =>
          onChange(field.path, [
            ...rows,
            Object.fromEntries(field.itemFields.map((item) => [item.key, ""])),
          ])
        }
      >
        {field.addLabel}
      </Button>
    </fieldset>
  );
}

export function ContentEditor({
  cmsKey,
  document: initialDocument,
  defaults,
  save,
}: {
  cmsKey: CmsKey;
  document: Doc;
  defaults: Doc;
  save: (state: SaveState, formData: FormData) => Promise<SaveState>;
}) {
  const sections = cmsFormSections[cmsKey];
  const route = CMS_KEY_ROUTES[cmsKey];

  const [doc, setDoc] = useState<Doc>(initialDocument);
  const [mode, setMode] = useState<"form" | "json">("form");
  const [jsonDraft, setJsonDraft] = useState(() =>
    JSON.stringify(initialDocument, null, 2),
  );
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState(sections[0]?.id ?? "");
  const [manualRefresh, setManualRefresh] = useState(0);
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");

  const [state, formAction, saving] = useActionState<SaveState, FormData>(save, {
    status: "idle",
  });

  // The iframe holds a rendered copy of the page, so it only tells the truth
  // again once the server has the new document and has revalidated the route.
  // Deriving the token from the save timestamp reloads it on save without an
  // effect, and the manual counter covers a refresh with nothing to save.
  const previewToken = `${state.status === "saved" ? state.at : 0}-${manualRefresh}`;

  const payload = useMemo(() => JSON.stringify(doc), [doc]);

  function onChange(path: string, value: unknown) {
    setDoc((current) => writePath(current, path, value));
  }

  function applyJson() {
    try {
      const parsed = JSON.parse(jsonDraft) as Doc;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        setJsonError("The document must be a JSON object.");
        return;
      }
      setDoc(parsed);
      setJsonError(null);
      setMode("form");
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : "Invalid JSON.");
    }
  }

  function switchToJson() {
    setJsonDraft(JSON.stringify(doc, null, 2));
    setJsonError(null);
    setMode("json");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:items-start">
      <form action={formAction} className="min-w-0">
        <input type="hidden" name="key" value={cmsKey} />
        <input type="hidden" name="payloadJson" value={payload} />

        <div className="border-line-soft bg-panel sticky top-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3">
          <div className="flex gap-1">
            <Button
              type="button"
              size="sm"
              variant={mode === "form" ? "soft" : "ghost"}
              onClick={() => setMode("form")}
            >
              Sections
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === "json" ? "soft" : "ghost"}
              onClick={switchToJson}
            >
              Advanced JSON
            </Button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setDoc(defaults)}
              title="Replace the editor contents with the shipped defaults"
            >
              <RotateCcw />
              Defaults
            </Button>
            <Button type="submit" size="sm" disabled={saving || mode === "json"}>
              {saving ? "Saving…" : "Save document"}
            </Button>
          </div>

          {state.status !== "idle" && (
            <p
              role="status"
              className={cn(
                "w-full text-[0.8125rem]",
                state.status === "saved" ? "text-mint" : "text-loss",
              )}
            >
              {state.message}
            </p>
          )}

          {mode === "json" && (
            <p className="text-faint w-full text-xs">
              Apply your JSON to return to the section editor before saving.
            </p>
          )}
        </div>

        {mode === "form" ? (
          <div className="mt-5 space-y-3">
            {sections.map((section) => {
              const open = openSection === section.id;
              return (
                <div
                  key={section.id}
                  className="border-line-soft bg-panel overflow-hidden rounded-2xl border"
                >
                  <button
                    type="button"
                    onClick={() => setOpenSection(open ? "" : section.id)}
                    aria-expanded={open}
                    className="hover:bg-sunken/40 flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors"
                  >
                    <span>
                      <span className="font-display text-[0.9375rem] font-semibold">
                        {section.label}
                      </span>
                      {section.description && (
                        <span className="text-faint mt-0.5 block text-xs">
                          {section.description}
                        </span>
                      )}
                    </span>
                    <Badge tone={open ? "brand" : "neutral"}>
                      {open ? "Open" : "Edit"}
                    </Badge>
                  </button>

                  {open && (
                    <div className="border-line-soft space-y-4 border-t px-4 py-4">
                      {section.fields.map((field) => (
                        <Field
                          key={field.path}
                          field={field}
                          doc={doc}
                          onChange={onChange}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-5">
            <textarea
              value={jsonDraft}
              spellCheck={false}
              onChange={(event) => setJsonDraft(event.target.value)}
              className="border-line-soft bg-panel h-[520px] w-full rounded-2xl border px-4 py-3 font-mono text-sm leading-relaxed outline-none"
            />
            {jsonError && (
              <p className="text-loss mt-2 text-sm" role="alert">
                {jsonError}
              </p>
            )}
            <div className="mt-3 flex gap-2">
              <Button type="button" onClick={applyJson}>
                Apply JSON
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setJsonDraft(JSON.stringify(doc, null, 2))}
              >
                Reset to editor state
              </Button>
            </div>
          </div>
        )}
      </form>

      <div className="min-w-0 xl:sticky xl:top-4">
        <div className="border-line-soft bg-panel flex items-center gap-3 rounded-t-2xl border border-b-0 px-4 py-2.5">
          <span className="text-faint font-mono text-[0.625rem] tracking-[0.1em] uppercase">
            Preview · {route}
          </span>
          <div className="ml-auto flex gap-1">
            <Button
              type="button"
              size="icon-sm"
              variant={viewport === "desktop" ? "soft" : "ghost"}
              onClick={() => setViewport("desktop")}
              aria-label="Desktop preview"
            >
              <Monitor />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant={viewport === "mobile" ? "soft" : "ghost"}
              onClick={() => setViewport("mobile")}
              aria-label="Mobile preview"
            >
              <Smartphone />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setManualRefresh((n) => n + 1)}
            >
              Refresh
            </Button>
          </div>
        </div>

        <div className="border-line-soft bg-sunken/40 grid place-items-center overflow-hidden rounded-b-2xl border p-3">
          <iframe
            key={previewToken}
            title={`${cmsKey} preview`}
            src={`${route}?cmsPreview=${previewToken}`}
            className={cn(
              "bg-bg h-[70vh] rounded-xl border-0",
              viewport === "desktop" ? "w-full" : "w-[390px] max-w-full",
            )}
          />
        </div>
        <p className="text-faint mt-2 text-xs">
          The preview renders the published page. Save to see your edits.
        </p>
      </div>
    </div>
  );
}
