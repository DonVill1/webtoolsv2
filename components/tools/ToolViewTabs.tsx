"use client";

import { useRef } from "react";
import { toolViewSets, type ToolViewSet } from "@/lib/tools/views";
import { useToolView } from "./useToolView";

function Tabs({ slug, set }: { slug: string; set: ToolViewSet }) {
  const { view, select, hrefFor } = useToolView(slug);
  const listRef = useRef<HTMLDivElement>(null);

  function moveFocus(event: React.KeyboardEvent<HTMLAnchorElement>, index: number) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "Home" && event.key !== "End") {
      return;
    }
    event.preventDefault();
    const last = set.views.length - 1;
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? last
          : event.key === "ArrowRight"
            ? (index + 1) % set.views.length
            : (index - 1 + set.views.length) % set.views.length;
    const target = listRef.current?.querySelectorAll<HTMLAnchorElement>("[role='tab']")[nextIndex];
    target?.focus();
  }

  return (
    <div ref={listRef} className="tool-tabs" role="tablist" aria-label={set.label}>
      {set.views.map((entry, index) => {
        const active = entry.id === view;
        return (
          <a
            key={entry.id}
            id={`tool-tab-${entry.id}`}
            className="tab"
            role="tab"
            aria-selected={active}
            aria-controls="tool-view-panel"
            tabIndex={active ? 0 : -1}
            href={hrefFor(entry.id)}
            title={entry.hint}
            onClick={(event) => {
              if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              event.preventDefault();
              select(entry.id);
            }}
            onKeyDown={(event) => moveFocus(event, index)}
          >
            {entry.label}
          </a>
        );
      })}
    </div>
  );
}

/**
 * Rendered by the server page, so the tab links and their labels are in the
 * HTML even before the tool's JavaScript loads.
 */
export function ToolViewTabs({ slug }: { slug: string }) {
  const set = toolViewSets[slug];
  if (!set) return null;
  return <Tabs slug={slug} set={set} />;
}
