// Nexus UX/UI — the fluid scale engine.
//
// One continuous scale: text and spacing grow smoothly with the viewport
// inside a device class's designed bounds — and are CLAMPED at the hard
// points, never squeezed past them. The class boundaries are exactly the
// breakpoints where ads and regions re-negotiate, so sizing and inventory
// move together: a step up in display changes both the type scale and the
// set of shapes that fit.
//
// "A bit extra space but never too little": the scale interpolates between
// a comfortable minimum and a generous maximum; beyond either, it holds
// (clamped) instead of deforming.

import { DEVICE_PRESETS, detectDeviceClass } from './compat';
import type { DeviceClass } from './types';

export interface ScaleState {
  device: DeviceClass;
  /** Continuous, clamped: the number type and spacing are derived from. */
  scale: number;
  /** True when the raw scale hit a hard limit (the display is outside designed bounds). */
  clamped: boolean;
  bounds: { min: number; max: number };
}

/** Per-class scale range: fluid between sMin and sMax across the design bounds. */
const SCALE_RANGE: Record<DeviceClass, { sMin: number; sMax: number }> = {
  mobile: { sMin: 0.92, sMax: 1.04 },
  tablet: { sMin: 1.04, sMax: 1.12 },
  desktop: { sMin: 1.12, sMax: 1.3 },
};

export function nexusScale(width?: number): ScaleState {
  const w = width ?? (typeof window === 'undefined' ? 1280 : window.innerWidth);
  const device = detectDeviceClass(w);
  const bounds = DEVICE_PRESETS[device];
  const { sMin, sMax } = SCALE_RANGE[device];

  const raw = bounds.max > bounds.min
    ? sMin + ((Math.min(w, bounds.max) - bounds.min) / (bounds.max - bounds.min)) * (sMax - sMin)
    : sMin;
  // Below the class minimum (broken display) the floor is the hard limit —
  // the viewport guard names the real problem; the scale never deforms.
  const scale = Math.min(sMax, Math.max(sMin, raw));
  return { device, scale, clamped: scale !== raw, bounds };
}

export interface ScaleTokens {
  /** CSS custom properties, ready to spread onto a style object. */
  vars: Record<string, string>;
  scale: ScaleState;
  /** Sampled type sizes in px, for rulers and readouts. */
  type: { xs: number; sm: number; md: number; lg: number; xl: number };
  /** Sampled spacing steps in px. */
  space: { 1: number; 2: number; 3: number; 4: number };
}

const TYPE_WEIGHTS = { xs: 0.75, sm: 0.88, md: 1, lg: 1.25, xl: 1.6 };
const SPACE_WEIGHTS = { 1: 0.5, 2: 1, 3: 1.75, 4: 3 } as const;

/**
 * The fluid token set for a viewport width (live when omitted). Base sizes
 * read from the 16px base: type md = 16px × scale, xl = 25.6px × scale, etc.
 */
export function scaleTokens(width?: number): ScaleTokens {
  const state = nexusScale(width);
  const s = state.scale;
  const type = Object.fromEntries(
    Object.entries(TYPE_WEIGHTS).map(([k, v]) => [k, Math.round(16 * v * s * 10) / 10]),
  ) as ScaleTokens['type'];
  const space = Object.fromEntries(
    Object.entries(SPACE_WEIGHTS).map(([k, v]) => [k, Math.round(4 * v * s * 10) / 10]),
  ) as ScaleTokens['space'];
  const vars: Record<string, string> = {
    '--nexus-root': `${s}`,
    ...Object.fromEntries(Object.entries(type).map(([k, v]) => [`--nexus-type-${k}`, `${v}px`])),
    ...Object.fromEntries(Object.entries(space).map(([k, v]) => [`--nexus-space-${k}`, `${v}px`])),
  };
  return { vars, scale: state, type, space };
}
