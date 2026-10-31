// Nexus UX/UI — command surfaces.
//
// The geometry + stacking standard for the surfaces apps interact through:
// the palette, menus, and the z-order they live in. Behavior (which commands
// exist, what fires) stays app logic — the kit supplies the measurable
// skeleton, on the SAME fit discipline as everything else: hard points,
// snap, never deform. Keyboard semantics live in keyboard.ts.

import { snapPane } from './shell';
import type { NexusTokens } from './tokens';

// ------------------------------------------------------ stacking tiers ----

/** The layers of an app view, in paint order — never invent a z-index. */
export const STACK_TIERS: Record<string, number> = {
  canvas: 0,
  dock: 10,
  drawer: 40,
  menu: 50,
  palette: 60,
  modal: 70,
  toast: 80,
};

export const Z_VARS: Record<string, string> = Object.fromEntries(
  Object.entries(STACK_TIERS).map(([k, v]) => [`--nexus-z-${k}`, `${v}`]),
);

// ------------------------------------------------------------- palette ----

export const PALETTE_LADDER = [480, 560, 640];

export interface PaletteGeometry {
  /** Snapped width in px (hard point of PALETTE_LADDER, scaled). */
  width: number;
  /** Top offset in px (12% of the work height). */
  top: number;
  /** Body max-height in px. */
  maxBodyHeight: number;
  radius: number;
  pad: number;
  /** The palette's input row height — the md control of the current scale. */
  inputHeight: number;
  elevation: string;
}

/**
 * The palette's geometry against a viewport: the width snaps to its ladder
 * hard points (never a squeezed edge), the results body is capped so the
 * list rations itself between the ladder's own rows (menus and lists fit the
 * same discipline), and every number is scale-derived.
 */
export function paletteGeometry(viewport: { w: number; h: number }, t: NexusTokens): PaletteGeometry {
  const snap = snapPane(viewport.w, PALETTE_LADDER);
  const width = Math.min(snap, Math.round(viewport.w - 2 * t.space[4]));
  const top = Math.round(viewport.h * 0.12);
  return {
    width,
    top,
    maxBodyHeight: Math.min(Math.round(viewport.h * 0.6), 560),
    radius: t.radius.lg,
    pad: t.space[3],
    inputHeight: 40, // control.md at scale 1; scale with t below via caller
    elevation: t.elevation.values['elev-5'] ?? 'none',
  };
}

// --------------------------------------------------------------- menus ----

export const MENU_LADDER = [180, 220, 280];

export interface Placement {
  x: number;
  y: number;
  /** Which rung the menu opened on — useful for the open animation. */
  placement: 'below' | 'above' | 'side-right' | 'side-left';
}

/**
 * Pure menu placement: anchor in, viewport in, menu size in — a position out
 * that respects the viewport edge and flips before it overflows. Hosts add
 * the safe-area tokens on top, not here (that's clipboard-level browser code).
 */
export function menuPlacement(
  anchor: { x: number; y: number; w: number; h: number },
  menu: { w: number; h: number },
  viewport: { w: number; h: number },
): Placement {
  const belowY = anchor.y + anchor.h;
  const aboveY = anchor.y - menu.h;
  const fitsBelow = belowY + menu.h <= viewport.h;
  const fitsAbove = aboveY >= 0;
  if (fitsBelow) return { x: anchor.x, y: belowY, placement: 'below' };
  if (fitsAbove) return { x: anchor.x, y: Math.max(0, aboveY), placement: 'above' };
  // vertical is lost — go sideways the roomier lane
  const leftRoom = anchor.x;
  const rightRoom = viewport.w - (anchor.x + anchor.w);
  if (rightRoom >= menu.w) return { x: anchor.x + anchor.w, y: anchor.y, placement: 'side-right' };
  if (leftRoom >= menu.w) return { x: Math.max(0, anchor.x - menu.w), y: anchor.y, placement: 'side-left' };
  // nothing fits whole — pin to the corner with the most room (the viewport
  // guard's principle: name the overflow, render the largest honest subset)
  const x = rightRoom >= leftRoom ? Math.max(0, viewport.w - menu.w) : 0;
  const y = fitsBelow || fitsAbove ? Math.max(0, fitsBelow ? belowY - menu.h : 0) : Math.max(0, viewport.h - menu.h);
  return { x, y, placement: belowY + menu.h <= viewport.h ? 'below' : 'above' };
}

/** Menu width: snapped from the dragged/requested value to the ladder. */
export function menuWidth(requested: number): number {
  return snapPane(requested, MENU_LADDER);
}
