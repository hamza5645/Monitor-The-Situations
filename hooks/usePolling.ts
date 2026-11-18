"use client";

import { useEffect } from "react";

/**
 * Calls `fn` immediately, then every `intervalMs`. Pauses while the tab is
 * hidden; on return it runs `fn` right away if a full interval has passed,
 * otherwise waits out the remainder. Restarts (with an immediate call)
 * whenever `fn` or `intervalMs` changes.
 */
export function usePolling(fn: () => void, intervalMs: number, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let lastRun = 0;

    const tick = () => {
      lastRun = Date.now();
      fn();
      timer = setTimeout(tick, intervalMs);
    };
    const start = () => {
      if (timer !== undefined) return;
      timer = setTimeout(tick, Math.max(0, lastRun + intervalMs - Date.now()));
    };
    const stop = () => {
      clearTimeout(timer);
      timer = undefined;
    };
    const onVisibilityChange = () => (document.hidden ? stop() : start());

    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [fn, intervalMs, enabled]);
}
