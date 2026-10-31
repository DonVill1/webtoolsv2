// Nexus UX/UI — fitting (the deliberate core).
//
// Rule: what a space serves must FIT the space itself. We rank every canonical
// shape that fits WITHIN the measured box — containment, never stretch, never
// crop, never scale-up. Exact matches win first, then largest area, then the
// closest aspect ratio. Responsive specials are eligible only in genuinely
// content-sized boxes; a box nothing fits into holds — empty beats deformed.
//
// The fitting guarantee for content (ads above all): a serve always paints at
// the shape's exact canonical pixels. The engine stamps `renderedBox` on every
// decision and rejects any link response whose served shape does not fit the
// measured box — a host transport can never smuggle a transform past the fit
// ruling.

import type { Box, Shape } from './types';

export interface FitResult {
  /** Shape id (an ad format id with the nexus-ads catalog). */
  shape: string;
  /** The shape's canonical box; responsive specials render the measured box. */
  dims: Box;
  /** How much of the box the shape covers (≤ 1, containment). */
  coverage: number;
  /** True when the shape fills the box edge-to-edge. */
  exact: boolean;
  score: number;
}

export function shapeDims(shapeId: string, shapes: Shape[], box: Box): Box | null {
  const shape = shapes.find((s) => s.id === shapeId);
  if (!shape) return null;
  if (shape.dims) return shape.dims;
  return shape.min && box.w >= shape.min.w && box.h >= shape.min.h ? { w: box.w, h: box.h } : null;
}

/**
 * Rank shapes that fit within the box. Descending fit quality: exact first,
 * then area, then aspect closeness. Responsive specials rank below decent
 * physical fits. Empty when nothing fits — the slot holds, never deforms.
 */
export function rankShapes(box: Box, shapes: Shape[]): FitResult[] {
  const results: FitResult[] = [];
  for (const shape of shapes) {
    const dims = shapeDims(shape.id, shapes, box);
    if (!dims) continue;
    if (dims.w <= box.w + 0.01 && dims.h <= box.h + 0.01) {
      const coverage = (dims.w * dims.h) / (box.w * box.h);
      const aspectBox = box.w / box.h;
      const aspectFmt = dims.w / dims.h;
      const aspectFit = Math.min(aspectBox, aspectFmt) / Math.max(aspectBox, aspectFmt);
      const special = !shape.dims;
      const exact = !special && Math.abs(dims.w - box.w) < 1.5 && Math.abs(dims.h - box.h) < 1.5;
      // Exact fills win outright; otherwise area dominates, aspect tiebreaks,
      // and responsive specials are a ranked fallback (they always "fill" the
      // box by definition, so flat score — never treat them as exacts).
      const score = exact ? 1000 : special ? 50 + aspectFit * 10 : coverage * 100 + aspectFit * 40;
      results.push({ shape: shape.id, dims, coverage, exact, score });
    }
  }
  return results.sort((a, b) => b.score - a.score);
}
