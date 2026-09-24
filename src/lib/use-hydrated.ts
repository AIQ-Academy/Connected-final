"use client";

import { useSyncExternalStore } from "react";

/** No external store to watch — the subscription exists only to satisfy the API. */
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * False during SSR and the first client render, true from the commit after
 * hydration. Preferred over a `useEffect(() => setMounted(true))` pair, which
 * the React Compiler lint rules reject as a cascading render.
 */
export function useHydrated() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
