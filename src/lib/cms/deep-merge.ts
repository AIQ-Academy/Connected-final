function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" && value !== null && !Array.isArray(value)
  );
}

/**
 * Overlay a partial document on top of the shipped defaults.
 *
 * Objects merge key by key so a document that only overrides `hero.title`
 * keeps every other default. Arrays replace wholesale — merging them
 * positionally would make it impossible to ever shorten a list, and would
 * silently resurrect an item an editor deleted.
 *
 * `null` and `undefined` overrides are ignored rather than blanking a field:
 * clearing copy from the CMS should mean "use the default", not "render
 * nothing".
 */
export function deepMerge<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) return base;

  if (isPlainObject(base) && isPlainObject(override)) {
    const result: Record<string, unknown> = { ...base };
    for (const [key, value] of Object.entries(override)) {
      result[key] = key in base ? deepMerge(base[key], value) : value;
    }
    return result as T;
  }

  return override as T;
}
