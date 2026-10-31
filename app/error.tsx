"use client";

import { useEffect } from "react";

/**
 * A deploy replaces every hashed chunk, so a tab that was already open can ask
 * for a file that no longer exists. That surfaces as a chunk-load failure and
 * leaves the reader on this page even though a reload would fix it.
 *
 * Reload once, at most every ten seconds, so a genuine crash cannot loop.
 */
const CHUNK_FAILURE =
  /Loading chunk|ChunkLoadError|Failed to fetch dynamically imported module|Importing a module script failed/i;
const RELOAD_KEY = "wt-chunk-reload-at";

function reloadOnceForStaleChunk(error: Error): void {
  if (!CHUNK_FAILURE.test(error.message)) return;
  try {
    const last = Number(window.sessionStorage.getItem(RELOAD_KEY) ?? 0);
    if (Number.isFinite(last) && Date.now() - last < 10_000) return;
    window.sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    window.location.reload();
  } catch {
    // Storage can be blocked; a reload is still the right recovery.
    window.location.reload();
  }
}

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
    reloadOnceForStaleChunk(error);
  }, [error]);

  return (
    <div className="page narrow" style={{ paddingBlock: 80 }}>
      <p className="eyebrow">Something broke</p>
      <h1 className="tool-title" style={{ marginTop: 10 }}>
        This page could not finish loading.
      </h1>
      <p className="tool-dek">
        The tool itself may still work after a retry. If it keeps failing, the error is recorded and we can
        reproduce it from the digest.
      </p>
      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        <button type="button" className="btn btn-primary" onClick={reset}>
          Try again
        </button>
        {/* Deliberately a hard navigation: client routing would reuse the build that just failed. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a className="btn" href="/">
          Home
        </a>
      </div>
    </div>
  );
}
