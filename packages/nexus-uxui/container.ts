// Nexus UX/UI — the container scope.
//
// Same families, different truth. A section embedded in an arbitrary layout
// (dashboards, plugins, embeds, portals) does not know where the viewport
// starts — but it knows its own box. containerScale(w) mirrors nexusScale's
// contract at element scope: one continuous scale between a comfortable
// minimum and a generous maximum, clamped at the hard limits, with tiers
// standing in for device classes.
//
// The derivation is the SAME tokensForScale the viewport scope lands in, so
// the rhythm can never diverge — only the scale number's source changes.

import { tokensForScale } from './tokens';
import type { NexusTokens } from './tokens';
import type { DeviceClass } from './types';

export type ContainerTier = 'compact' | 'cozy' | 'roomy' | 'wide';

export interface ContainerScaleState {
  w: number;
  tier: ContainerTier;
  scale: number;
  /** True when a raw scale hit a hard limit. */
  clamped: boolean;
  bounds: { min: number; max: number };
}

/** Designed container width bounds — below 280 those are mock/pill embeds. */
export const CONTAINER_BOUNDS = { min: 280, max: 1600 };

/** Scale range inside the bounds: cozy minimum to a generous wide maximum. */
const S_MIN = 0.88;
const S_MAX = 1.28;

/** Tier boundaries — the same widths where audiences change shape choices. */
export const TIERS: Array<{ tier: ContainerTier; upTo: number }> = [
  { tier: 'compact', upTo: 419 },
  { tier: 'cozy', upTo: 719 },
  { tier: 'roomy', upTo: 1279 },
  { tier: 'wide', upTo: Number.POSITIVE_INFINITY },
];

/** Which tier a container width occupies. */
export function containerTier(w: number): ContainerTier {
  for (const t of TIERS) if (w < t.upTo) return t.tier;
  return 'wide';
}

/**
 * The container scale: continuous between a comfortable minimum and a
 * generous maximum across the designed bounds — clamped at the hard points,
 * never squeezed past them. Pure (width in, scale out), so hosts can
 * simulate and test it.
 */
export function containerScale(w: number): ContainerScaleState {
  const { min, max } = CONTAINER_BOUNDS;
  const clampedW = Math.min(Math.max(w, min), max);
  const raw =
    max > min ? S_MIN + ((clampedW - min) / (max - min)) * (S_MAX - S_MIN) : S_MIN;
  const scale = Math.min(S_MAX, Math.max(S_MIN, raw));
  return { w: clampedW, tier: containerTier(clampedW), scale, clamped: scale !== raw, bounds: { min, max } };
}

/**
 * The full token set for a container width — the same families the viewport
 * scope produces, derived from the container's own scale. Pass a computed
 * ContainerScaleState straight through for zero surprises.
 */
export function containerTokens(w: number | ContainerScaleState): NexusTokens {
  const state = typeof w === 'number' ? containerScale(w) : w;
  // The device field exists only for the viewport scope's presets; a
  // container carries its tier instead. Map the tier onto the closest
  // viewport equivalent so every family (radius, controls, regions) reads
  // the same numbers a same-sized viewport would.
  const device: DeviceClass = state.tier === 'compact' || state.tier === 'cozy' ? 'mobile' : state.tier === 'roomy' ? 'tablet' : 'desktop';
  return tokensForScale({ device, scale: state.scale, clamped: state.clamped, bounds: { ...state.bounds } });
}
