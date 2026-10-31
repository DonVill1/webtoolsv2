// Nexus UX/UI — the fit ladder.
//
// Hard points are the whole idea behind "always a bit extra space, but never
// too little": a designed space moves between canonical sizes — snap points —
// and the stretches between them are fluid zones where the negotiation picks
// the largest fitting shape. This module turns the catalog into that ladder:
// which hard points a box can become, the honest intervals where nothing
// fits (hold zones), and the nearest snap from any fluid size.
//
// The demo slider is one consumer; region fitting and responsive layouts are
// the real ones.

import type { Box, Shape } from './types';
import { rankShapes, shapeDims, type FitResult } from './fit';

export interface LadderPoint {
  shape: string;
  box: Box;
}

export interface HoldZone {
  /** Width interval [fromW, toW) with no fitting shape at this height. */
  fromW: number;
  toW: number;
  height: number;
}

export interface Ladder {
  /** Reachable hard points, narrowest last. */
  points: LadderPoint[];
  /** Intervals of width where nothing fits at the given height. */
  holdZones: HoldZone[];
  /** The nearest reachable hard point at or below the given width. */
  nearest(width: number): LadderPoint | null;
}

/** The canonical hard points of the catalog itself (sorted by area, largest first). */
export function hardPoints(shapes: Shape[]): Box[] {
  return shapes
    .filter((s) => s.dims)
    .map((s) => s.dims as Box)
    .sort((a, b) => b.w * b.h - a.w * a.h);
}

/**
 * Which hard points the measured box can become: every canonical shape that
 * fits inside it fully. These are the snap targets for a designed space.
 */
export function reachable(box: Box, shapes: Shape[]): LadderPoint[] {
  return shapes
    .filter((s) => s.dims)
    .map((s) => ({ shape: s.id, dims: s.dims as Box }))
    .filter((p) => p.dims.w <= box.w + 0.01 && p.dims.h <= box.h + 0.01)
    .sort((a, b) => a.dims.w - b.dims.w)
    .map((p) => ({ shape: p.shape, box: p.dims }));
}

/**
 * The ladder of a measured box: reachable hard points, the width intervals
 * in between where nothing fits at this height (hold zones — the fluid zones
 * are the NEGATION of these), and nearest-point snapping.
 */
export function ladder(box: Box, shapes: Shape[]): Ladder {
  const points = reachable(box, shapes);
  const holdZones: HoldZone[] = [];
  const widths = points.map((p) => p.box.w);
  // A hold zone is any width interval where no reachable point spans the
  // height: walk the gaps between consecutive reachable widths and test the
  // midpoint against the catalog.
  const span = Math.max(0, ...widths);
  let cursor = 0;
  for (const w of widths) {
    if (w > cursor) {
      const mid = (cursor + w) / 2;
      const midBox: Box = { w: mid, h: box.h };
      if (rankShapes(midBox, shapes).length === 0) {
        holdZones.push({ fromW: cursor, toW: w, height: box.h });
      }
    }
    cursor = w;
  }
  if (span < box.w) {
    // Above the tallest reachable point everything is fluid; only flag it as
    // a hold zone when truly nothing fits there (e.g. height taller than every shape).
    const probe: Box = { w: Math.min(box.w, span + (box.w - span) / 2), h: box.h };
    if (rankShapes(probe, shapes).length === 0) {
      holdZones.push({ fromW: span, toW: box.w, height: box.h });
    }
  }
  const nearest = (width: number): LadderPoint | null => {
    const below = points.filter((p) => p.box.w <= width + 0.01);
    return below.length ? (below[below.length - 1] ?? null) : null;
  };
  return { points, holdZones, nearest };
}

/** Fit details for a ladder's points (shared evaluation wrapper). */
export function ladderFits(box: Box, shapes: Shape[]): FitResult[] {
  return rankShapes(box, shapes).filter((f) => {
    const dims = shapeDims(f.shape, shapes, box);
    return Boolean(dims);
  });
}
