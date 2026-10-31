// Nexus UX/UI — the app-shell standard.
//
// The page catalog (regions.ts) is how documents are cut. This is how
// applications are cut: the same fit contract — designed minimums, hard
// points, hold zones — applied to the shell of an app view. Nothing fills,
// nothing deforms; a region that cannot hold its minimum collapses by the
// collapse ladder, never by squeezing.
//
// Built for ALL views and classes: desktop, tablet and mobile are each
// designed per orientation (landscape ≠ portrait), safe-area insets are
// tokens, and every region here negotiates through the same engine as ads
// and page regions.

import type { DeviceClass, Shape } from './types';
import { detectDeviceClass } from './compat';

export type Orientation = 'landscape' | 'portrait';

/** Device orientation — mirror of the media query, pure and simulatable. */
export function detectOrientation(width?: number, height?: number): Orientation {
  const w = width ?? (typeof window === 'undefined' ? 1280 : window.innerWidth);
  const h = height ?? (typeof window === 'undefined' ? 800 : window.innerHeight);
  return h > w ? 'portrait' : 'landscape';
}

// ------------------------------------------------------- safe area tokens --

/**
 * PWA / notched-device insets as tokens: the shell reads these from CSS env
 * values an app can override for its chrome. The kit standardizes the SLOTS
 * (names, defaults), never the device geometry itself.
 */
export const SAFE_AREA_TOKENS: Record<string, string> = {
  '--nexus-safe-top': 'env(safe-area-inset-top, 0px)',
  '--nexus-safe-bottom': 'env(safe-area-inset-bottom, 0px)',
  '--nexus-safe-left': 'env(safe-area-inset-left, 0px)',
  '--nexus-safe-right': 'env(safe-area-inset-right, 0px)',
};

// -------------------------------------------------------- shell catalog ----

export interface ShellDesign {
  min: number;
  designed: number;
}

export type ShellKind = 'chrome' | 'canvas' | 'inventory' | 'overlay';

export interface ShellSpec {
  id: string;
  label: string;
  kind: ShellKind;
  /** Which dimension the region's design constrains. */
  dim: 'h' | 'w' | null;
  /** Designed min/designed per device × orientation (scale-1 px). */
  design: Partial<Record<DeviceClass, Partial<Record<Orientation, ShellDesign>>>>;
  /** Where the region docks in the shell. */
  side: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'cover';
  /** Collapse order — lower collapses first when the width can't hold all. */
  collapse?: number;
  /** The width the region keeps when collapsed (0 = designed absence). */
  collapseTo?: number;
  /** Pane-ladder hard points (scale 1) for docked rails. */
  ladder?: number[];
  /** Canonical ad format ids this inventory region must accommodate. */
  hosts?: Partial<Record<DeviceClass, string[]>>;
  note: string;
}

export const SHELL: ShellSpec[] = [
  {
    id: 'topbar',
    label: 'Top bar',
    kind: 'chrome',
    dim: 'h',
    side: 'top',
    design: {
      desktop: { landscape: { min: 48, designed: 56 } },
      tablet: { landscape: { min: 44, designed: 52 }, portrait: { min: 44, designed: 52 } },
      mobile: { portrait: { min: 44, designed: 48 }, landscape: { min: 40, designed: 44 } },
    },
    note: 'Identity + primary commands + app-level state. Chips of space-2; never hosts inventory. Mobile landscape stays a slim 44px band to protect work area.',
  },
  {
    id: 'side-dock',
    label: 'Side dock',
    kind: 'chrome',
    dim: 'w',
    side: 'left',
    collapse: 2,
    collapseTo: 48,
    ladder: [48, 224, 280],
    design: {
      desktop: { landscape: { min: 48, designed: 224 } },
      tablet: { landscape: { min: 48, designed: 224 }, portrait: { min: 48, designed: 48 } },
    },
    note: 'Persistent app navigation. Slides between its ladder hard points (48 collapsed / 224 working / 280 roomy) — hold zones in between. Portrait tablets keep the 48px icon rail; phones drop the dock for the bottom tab bar.',
  },
  {
    id: 'canvas',
    label: 'Canvas',
    kind: 'canvas',
    dim: null,
    side: 'center',
    design: {},
    note: 'The work area: fills everything the chrome does not claim, scrolls independently. Content flows and inline inventory (native, rectangles) design into it — canvas is a fitting region, not a band.',
  },
  {
    id: 'inspector',
    label: 'Inspector',
    kind: 'chrome',
    dim: 'w',
    side: 'right',
    collapse: 1,
    collapseTo: 0,
    ladder: [280, 320, 360],
    design: {
      desktop: { landscape: { min: 280, designed: 320 } },
      tablet: { landscape: { min: 280, designed: 280 } },
    },
    note: 'Properties/context rail. First to collapse when the width is short — its absence is a designed view, never a squeezed one. Portrait tablets and phones surface it as a sheet on demand.',
  },
  {
    id: 'statusbar',
    label: 'Status bar',
    kind: 'chrome',
    dim: 'h',
    side: 'bottom',
    collapse: 3,
    design: {
      desktop: { landscape: { min: 24, designed: 28 } },
      tablet: { landscape: { min: 24, designed: 26 } },
      mobile: { portrait: { min: 20, designed: 22 } },
    },
    note: 'Transient app state (progress, connection, counts). One line, space-3 tall. Last chrome to go under pressure.',
  },
  {
    id: 'bottom-tabs',
    label: 'Bottom tab bar',
    kind: 'chrome',
    dim: 'h',
    side: 'bottom',
    design: {
      mobile: { portrait: { min: 52, designed: 56 } },
    },
    note: 'The phone dock: ≤5 tabs, each hit target ≥ the 44px touch floor. Portrait phones only; the 52px minimum already carries the touch rule.',
  },
  {
    id: 'bottom-banner',
    label: 'Bottom banner zone',
    kind: 'inventory',
    dim: 'h',
    side: 'bottom',
    design: {
      mobile: { portrait: { min: 50, designed: 50 } },
    },
    hosts: { mobile: ['320x50', '300x50', '200x50', '120x20'] },
    note: 'The one banner zone apps own: exactly 50px tall, docked BELOW the canvas and ABOVE the tab bar — it never overlaps the tab bar and never appears without one landing exactly.',
  },
  {
    id: 'drawer',
    label: 'Drawer / sheet',
    kind: 'overlay',
    dim: 'w',
    side: 'cover',
    design: {
      mobile: { portrait: { min: 300, designed: 320 } },
      tablet: { portrait: { min: 280, designed: 320 } },
    },
    note: 'On-demand rail over the shell (phones/tablets/portrait — where the dock and inspector do not live permanently). Designed widths, scrim beneath; never a squeezed canvas-side panel.',
  },
  {
    id: 'modal-layer',
    label: 'Modal layer',
    kind: 'overlay',
    dim: null,
    side: 'cover',
    design: {},
    note: 'Focus surface over everything. Plate preset `modal` (tokens: elevation 4, radius-lg); inventor dims the shell; never competes with toast.',
  },
  {
    id: 'toast-layer',
    label: 'Toast layer',
    kind: 'overlay',
    dim: null,
    side: 'cover',
    design: {},
    note: 'Transient notices, bottom start (mobile) / bottom end (desktop), clear of the tab bar and banner zone by the safe tokens.',
  },
];

export function shellRegion(id: string): ShellSpec | undefined {
  return SHELL.find((s) => s.id === id);
}

/** Designed min/designed for a region on device × orientation (scale 1). */
export function shellDesign(spec: ShellSpec, device: DeviceClass, orientation: Orientation): ShellDesign | null {
  const perO = spec.design[device];
  if (!perO) return null;
  return perO[orientation] ?? null;
}

/** The hosted ad hard points of an inventory region on a device. */
export function shellAdHosts(spec: ShellSpec, device: DeviceClass): string[] {
  return spec.hosts?.[device] ?? [];
}

// ------------------------------------------------------ shell shapes ------

/**
 * Shell regions as negotiable shapes: docked bands become responsive
 * specials with their designed minimums, so chrome routes through the
 * engine's negotiation, holds, and traces exactly like pages and ads.
 */
export function shellShapes(device?: DeviceClass, orientation?: Orientation): Shape[] {
  const d: DeviceClass = device ?? detectDeviceClass(shellWidth());
  const o: Orientation = orientation ?? detectOrientation();
  const shapes: Shape[] = [];
  for (const s of SHELL) {
    const design = shellDesign(s, d, o);
    if (!design) continue;
    if (s.dim === 'h') {
      shapes.push({ id: `shell/${s.id}`, dims: null, min: { w: 120, h: design.min } });
    } else if (s.dim === 'w') {
      shapes.push({ id: `shell/${s.id}`, dims: null, min: { w: design.min, h: 40 } });
    }
  }
  return shapes;
}

/** The live shell width in px (SSR-safe). */
export function shellWidth(): number {
  return typeof window === 'undefined' ? 1280 : window.innerWidth;
}

// ---------------------------------------------------- app scaffold --------

export interface AppRow {
  region: string;
  /** Docked side in the composed view. */
  side: 'top' | 'bottom' | 'left' | 'right' | 'center';
  /** Scaled size in px (0 = fills). */
  size: number;
  kind: ShellKind;
  /** Canonical ad shapes this region is designed to hold. */
  adHosts: string[];
}

export interface AppScaffold {
  device: DeviceClass;
  orientation: Orientation;
  rows: AppRow[];
  gutter: number;
  notes: string[];
}

const GUTTER = 12;

/**
 * Cut an app view from the shell: docked rows with scaled bands, the dock and
 * inspector at their designed ladder points, the canvas filling the rest.
 */
export function appScaffold(device: DeviceClass, orientation: Orientation, scale: number): AppScaffold {
  const rows: AppRow[] = [];
  const row = (id: string, side: AppRow['side']): void => {
    const spec = shellRegion(id);
    if (!spec) return;
    const design = shellDesign(spec, device, orientation);
    if (spec.dim === null) {
      rows.push({ region: id, side, size: 0, kind: spec.kind, adHosts: [] });
      return;
    }
    if (!design) return;
    rows.push({
      region: id,
      side,
      size: Math.round(design.designed * scale),
      kind: spec.kind,
      adHosts: shellAdHosts(spec, device),
    });
  };

  row('topbar', 'top');
  row('side-dock', 'left');
  rows.push({ region: 'canvas', side: 'center', size: 0, kind: 'canvas', adHosts: [] });
  row('inspector', 'right');
  row('bottom-banner', 'bottom');
  row('bottom-tabs', 'bottom');
  row('statusbar', 'bottom');

  return {
    device,
    orientation,
    rows,
    gutter: Math.round(GUTTER * scale),
    notes: [
      'canvas fills everything chrome does not claim — content flows and inline inventory design into it',
      'dock and inspector slide between their ladder hard points; between hard points they hold, never deform',
      'the one banner zone is exactly 50px below the canvas and above the tab bar — never overlapping',
      'safe-area insets are tokens (--nexus-safe-*) the shell reads for notched devices',
    ],
  };
}

// -------------------------------------------------- collapse ladder -------

export interface CollapseStep {
  /** The region to collapse next (in priority order). */
  region: string;
  /** Its collapse priority — 1 collapses first. */
  priority: number;
  /** Canvas width the view keeps after this collapse, in px. */
  canvasAfter: number;
}

export interface CollapsePlan {
  device: DeviceClass;
  orientation: Orientation;
  width: number;
  /** Which regions should already be collapsed at this width, in order. */
  collapsed: string[];
  /** The remaining steps, in the order the standard collapses them. */
  steps: CollapseStep[];
  /** Canvas the view keeps right now, px. */
  canvas: number;
  /** True when no further collapse can save the minimum canvas. */
  tooNarrow: boolean;
}

const MIN_CANVAS: Record<DeviceClass, number> = { desktop: 480, tablet: 360, mobile: 240 };

/**
 * Hold zones applied to the shell: when the viewport cannot hold every
 * region at its minimum, the standard names which region collapses first —
 * a designed absence, never a squeezed one. Pure and simulatable.
 */
export function collapseLadder(device: DeviceClass, orientation: Orientation, viewport: number, scale: number): CollapsePlan {
  const sized = (id: string): number => {
    const spec = shellRegion(id);
    if (!spec) return 0;
    const design = shellDesign(spec, device, orientation);
    return design && spec.dim === 'h' ? Math.round(design.designed * scale) : 0;
  };

  const fixed = sized('topbar') + sized('bottom-tabs') + sized('bottom-banner') + sized('statusbar');
  const collapsible = ['inspector', 'side-dock'].filter((id) => {
    const spec = shellRegion(id);
    return spec ? shellDesign(spec, device, orientation) != null : false;
  });

  // A region occupies its designed width while standing, and its collapseTo
  // (a dock keeps its 48px rail; an inspector dissolves to a designed absence
  // — 0) once collapsed. The canvas keeps whatever the other regions spare.
  const standing = (id: string, collapsed: string[]): number => {
    if (collapsed.includes(id)) {
      const spec = shellRegion(id);
      return Math.round((spec?.collapseTo ?? 0) * scale);
    }
    const spec = shellRegion(id);
    if (!spec) return 0;
    const design = shellDesign(spec, device, orientation);
    return design && spec.dim === 'w' ? Math.round(design.designed * scale) : 0;
  };

  const canvasAt = (collapsed: string[]): number =>
    viewport - fixed - collapsible.reduce((acc, id) => acc + standing(id, collapsed), 0);

  const priorityOf = collapsible.map((id) => ({ id, priority: shellRegion(id)?.collapse ?? 9 }));
  const ordered = [...priorityOf].sort((a, b) => a.priority - b.priority);

  const collapsed: string[] = [];
  let canvas = canvasAt(collapsed);
  const minCanvas = MIN_CANVAS[device];
  while (canvas < minCanvas && ordered.length > 0) {
    const next = ordered.shift()!;
    collapsed.push(next.id);
    canvas = canvasAt(collapsed);
  }

  const steps: CollapseStep[] = ordered.map((r) => ({
    region: r.id,
    priority: r.priority,
    canvasAfter: canvasAt([...collapsed, r.id]),
  }));

  return {
    device,
    orientation,
    width: Math.round(viewport),
    collapsed,
    steps,
    canvas: Math.round(canvas),
    tooNarrow: canvas < minCanvas,
  };
}

// ------------------------------------------------------- pane snapping ----

/**
 * Snap a dragged pane width to its ladder hard points: "a bit extra space,
 * never too little" — below the floor it holds the floor, inside a stretch
 * it takes the nearest hard point (ties snap UP, to the larger), past the
 * top of the ladder it holds the top. Panes never rest in a hold zone.
 */
export function snapPane(value: number, ladderPoints: number[]): number {
  const points = [...ladderPoints].sort((a, b) => a - b);
  if (points.length === 0) return Math.max(0, value);
  const floor = points[0]!;
  if (value <= floor) return floor;
  const top = points[points.length - 1]!;
  if (value >= top) return top;
  let best = points[0]!;
  for (const p of points) {
    const d = Math.abs(p - value);
    const bd = Math.abs(best - value);
    if (d < bd || (d === bd && p > best)) best = p;
  }
  return best;
}

/**
 * The pane ladder of a shell region (sorted), or null when the region has no
 * ladder on this device × orientation (the dock doesn't exist on phones).
 */
export function paneLadder(id: string, device: DeviceClass, orientation: Orientation): number[] | null {
  const spec = shellRegion(id);
  if (!spec?.ladder || !spec.ladder.length || !shellDesign(spec, device, orientation)) return null;
  return [...spec.ladder].sort((a, b) => a - b);
}