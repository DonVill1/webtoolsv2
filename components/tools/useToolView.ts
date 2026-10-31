"use client";

import { useCallback, useSyncExternalStore } from "react";
import { toolViewSets, type ToolViewSet } from "@/lib/tools/views";

/**
 * Tabs are links first and state second. The URL is the source of truth, so a
 * shared link opens the right view, the address bar stays honest after a click,
 * and the tab bar can render on the server without JavaScript.
 *
 * The custom event exists because `history.replaceState` does not fire
 * `popstate`; every subscriber hears a tab click through it.
 */
const CHANGE_EVENT = "webtools:view-change";

function isKnownView(set: ToolViewSet, value: string | null): value is string {
  return value !== null && set.views.some((view) => view.id === value);
}

function readView(set: ToolViewSet): string {
  if (typeof window === "undefined") return set.fallback;
  const value = new URLSearchParams(window.location.search).get(set.param);
  return isKnownView(set, value) ? value : set.fallback;
}

export interface ToolViewState {
  set: ToolViewSet;
  view: string;
  select: (next: string) => void;
  hrefFor: (next: string) => string;
}

export function useToolView(slug: string): ToolViewState {
  const set = toolViewSets[slug];
  if (!set) throw new Error(`No view set is registered for ${slug}`);

  const subscribe = useCallback((onChange: () => void) => {
    window.addEventListener("popstate", onChange);
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => {
      window.removeEventListener("popstate", onChange);
      window.removeEventListener(CHANGE_EVENT, onChange);
    };
  }, []);

  const getSnapshot = useCallback(() => readView(set), [set]);
  const view = useSyncExternalStore(subscribe, getSnapshot, () => set.fallback);

  const select = useCallback(
    (next: string) => {
      if (!isKnownView(set, next)) return;
      const url = new URL(window.location.href);
      url.searchParams.set(set.param, next);
      window.history.replaceState(window.history.state, "", url);
      window.dispatchEvent(new Event(CHANGE_EVENT));
    },
    [set],
  );

  const hrefFor = useCallback(
    (next: string) => `?${new URLSearchParams({ [set.param]: next }).toString()}`,
    [set],
  );

  return { set, view, select, hrefFor };
}
