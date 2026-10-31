"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";

type ShareState = "idle" | "copied" | "shared";

export function ShareButton({
  url,
  title,
  className = "btn btn-sm",
}: {
  url: string;
  title: string;
  className?: string;
}) {
  const [state, setState] = useState<ShareState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const settle = useCallback((next: ShareState) => {
    setState(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 1800);
  }, []);

  const share = useCallback(async () => {
    if (!url) return;

    // Prefer the operating system sheet when the browser exposes it. A
    // cancelled sheet is not a failure and must not overwrite the button label.
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: title, url });
        settle("shared");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      settle("copied");
    } catch {
      setState("idle");
    }
  }, [settle, title, url]);

  const label = state === "copied" ? "Link copied" : state === "shared" ? "Shared" : "Share";

  return (
    <button
      type="button"
      className={className}
      onClick={() => void share()}
      disabled={!url}
      aria-live="polite"
    >
      <Icon name={state === "shared" ? "check" : state === "copied" ? "copy" : "share"} size={14} />
      {label}
    </button>
  );
}
