"use client";

import { useSyncExternalStore } from "react";

/**
 * Where the home page is in its opening sequence.
 *
 * `waiting` means the intro clip still covers the page; `settled` means the
 * page owns the viewport. The clip runs to its own last frame and is then taken
 * down in one step, so there is no blended hand-over stage in between.
 *
 * The stage lives in a module store rather than a DOM event because the
 * listeners do not all mount before the intro decides: on a route where the
 * intro never plays, an event fired on mount would be missed by anything
 * further down the tree and would strand it hidden.
 */
export type IntroStage = "waiting" | "settled";

let stage: IntroStage = "waiting";
const listeners = new Set<() => void>();

export function setIntroStage(next: IntroStage) {
  if (stage === next) return;
  stage = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => stage;
const getServerSnapshot = (): IntroStage => "waiting";

/**
 * Surfaces that never sit behind the intro — every route except `/` —
 * pass `enabled: false` and read as settled from the first paint. The
 * cinematic clip is homepage-only.
 */
export function useIntroStage(enabled: boolean): IntroStage {
  const current = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return enabled ? current : "settled";
}
