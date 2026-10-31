"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * A ticking clock that is stable across hydration: the server snapshot is 0,
 * so components can render a placeholder and only show time-dependent state
 * once the browser has mounted. The snapshot is quantised to the interval so
 * repeated reads within one tick return the same number.
 */
export function useNow(intervalMs = 1000): number {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const timer = window.setInterval(onChange, intervalMs);
      return () => window.clearInterval(timer);
    },
    [intervalMs],
  );

  return useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / intervalMs) * intervalMs,
    () => 0,
  );
}
