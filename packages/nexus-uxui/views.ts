// Nexus UX/UI — view modes.
//
// The standard gains a dimension: the same engine serves a document view (a
// page that scrolls), an application view (a shell that fills the viewport,
// where the CANVAS scrolls inside it) and an embedded view (a region of
// someone else's layout, container-scoped). The mode selects the catalog and
// the verdicts — the guarantees never change.

import type { DeviceClass } from './types';
import { detectDeviceClass } from './compat';
import { viewportStatus, type ViewportStatus } from './viewport';
import { pageScaffold, type PageScaffold } from './regions';
import { appScaffold, collapseLadder, type AppScaffold, type Orientation, type CollapsePlan } from './shell';

export const VIEW_MODES = ['doc', 'app', 'embed'] as const;
export type ViewMode = (typeof VIEW_MODES)[number];

export interface ViewStatus {
  mode: ViewMode;
  device: DeviceClass;
  orientation: Orientation;
  /** The viewport guard verdict for the matching catalog's semantics. */
  viewport: ViewportStatus;
  /** App views only — which regions the standard collapses at this width. */
  collapse: CollapsePlan | null;
  message: string | null;
}

/** The live view mode of a host (an app may pin it; default = doc). */
export function appViewportStatus(width?: number): ViewportStatus {
  const base = viewportStatus(width);
  if (base.ok) return base;
  const device: DeviceClass = base.device;
  const plan = collapseLadder(device, base.device === 'mobile' ? 'portrait' : 'landscape', width ?? base.bounds.min, 1);
  if (base.issue === 'tooNarrow' && plan.steps.length > 0) {
    return {
      ...base,
      message: `This view is designed for ≥ ${base.bounds.min}px. Widen the window — or collapse the ${plan.steps[0]?.region ?? 'main panel'} (the standard's first move under these bounds).`,
    };
  }
  return base;
}

// The mode entry point: one verdict per mode, one message the consumer can render.
export function viewStatus(
  mode: ViewMode,
  width?: number,
  orientation?: Orientation,
): ViewStatus {
  const device = detectDeviceClass(width);
  const o = orientation ?? detectOrientation(width);
  const base = viewportStatus(width);
  if (mode === 'doc') {
    const v = viewportStatus(width);
    return { mode, device, orientation: o, viewport: v, collapse: null, message: v.message };
  }
  if (mode === 'embed') {
    // The container scope owns embedding; the viewport is not this view's truth.
    return { mode, device, orientation: o, viewport: base, collapse: null, message: 'embed view — container tokens govern this region, not the viewport' };
  }
  const v = appViewportStatus(width);
  const w = width ?? v.bounds.min;
  const plan = collapseLadder(device, o, w, 1);
  return {
    mode,
    device,
    orientation: o,
    viewport: v,
    collapse: plan,
    message: v.message ?? (plan.collapsed.length > 0 ? `collapsed: ${plan.collapsed.join(', ')}` : null),
  };
}

export function detectOrientation(width?: number, height?: number): Orientation {
  const w = width ?? (typeof window === 'undefined' ? 1280 : window.innerWidth);
  const h = height ?? (typeof window === 'undefined' ? 800 : window.innerHeight);
  return h > w ? 'portrait' : 'landscape';
}

// ------------------------------------------------------ scaffold resolver --

export interface ComposedView {
  mode: ViewMode;
  /** The doc catalog on `doc` (rows), the shell catalog on `app`. */
  page: PageScaffold | null;
  shell: AppScaffold | null;
}

/** Compose a view for a host: the catalog of the selected mode. */
export function composeView(
  mode: ViewMode,
  device: DeviceClass,
  scale: number,
  orientation: Orientation = 'landscape',
): ComposedView {
  if (mode === 'doc') return { mode, page: pageScaffold(device, scale), shell: null };
  if (mode === 'app') return { mode, page: null, shell: appScaffold(device, orientation, scale) };
  // embed views are composed by the container against its own box.
  return { mode, page: pageScaffold(device, scale), shell: null };
}
