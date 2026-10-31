// Nexus UX/UI — the control parameter kit.
//
// Headless parameter objects for the components every app rebuilds:
// controls, cards/plates, badges, toolbars, tables. Parameters only — every
// app paints them with its own identity (NEXUS.md Rule 1); the standard is
// the measurable skeleton, derived from the fluid scale so nothing drifts.
//
// Every number is a function of the viewport scale (controlParams) or a
// container scale (containerControlParams, container.ts), so controls and
// tokens move together on the same breakpoints.

import { nexusTokens, type NexusTokens } from './tokens';
import type { ScaleState } from './scale';

export interface ControlParams {
  scale: ScaleState;
  /** Interactive control heights (px, scaled). */
  control: { sm: number; md: number; lg: number };
  /** Minimum touch/hit target — hard point, never scaled below (WCAG 2.1). */
  touchMin: number;
  /** Control internals, scaled. */
  pad: { touchPadX: number; fieldGap: number; labelGap: number };
  /** Single-row command surfaces. */
  toolbar: number;
  chip: { h: number; padX: number };
  /** Data rows — the density ladder. */
  table: { compact: number; regular: number; comfortable: number; cellX: number };
  /** Card/plate geometry at this scale, resolved to px. */
  card: { padSm: number; padMd: number; padLg: number; gap: number };
}

const CONTROL_BASE = { sm: 32, md: 40, lg: 48 };
const TOUCH_MIN = 44;

/** One derivation of control geometry from a tokens object. */
export function controlParamsFromTokens(t: NexusTokens): ControlParams {
  const s = t.scale.scale;
  const lift = (n: number, min: number): number => Math.max(min, Math.round(n * s));
  return {
    scale: t.scale,
    control: {
      sm: lift(CONTROL_BASE.sm, 28),
      md: lift(CONTROL_BASE.md, 36),
      lg: lift(CONTROL_BASE.lg, 44),
    },
    touchMin: TOUCH_MIN,
    pad: {
      touchPadX: lift(16, 12),
      fieldGap: t.space[2],
      labelGap: t.space[1],
    },
    toolbar: lift(48, 44),
    chip: { h: lift(28, 24), padX: lift(10, 8) },
    table: {
      compact: lift(32, 28),
      regular: lift(40, 36),
      comfortable: lift(48, 44),
      cellX: t.space[2],
    },
    card: { padSm: t.space[2], padMd: t.space[3], padLg: t.space[4], gap: t.space[2] },
  };
}

/** Live-control parameters for a viewport width (live when omitted). */
export function controlParams(width?: number): ControlParams {
  return controlParamsFromTokens(nexusTokens(width));
}

// ---------------------------------------------------------- card presets ----

export type BorderRadiusKey = 'sm' | 'md' | 'lg' | 'full';
export type ElevationKey = 'none' | 1 | 2 | 3 | 4 | 5;

export interface CardPreset {
  /** Named intent on the reserved card roles. */
  id: string;
  pad: 'padSm' | 'padMd' | 'padLg';
  gap: 'gap';
  radius: BorderRadiusKey;
  border: 'thin' | 'regular' | 'none';
  elevation: ElevationKey;
  note: string;
}

/**
 * The four standard card intents. Parameters only — the app supplies color,
* typography identity and hover behavior; the kit guarantees the skeleton
* reads consistently across every app built on it.
 */
export const CARD_PRESETS: CardPreset[] = [
  { id: 'flat', pad: 'padMd', gap: 'gap', radius: 'md', border: 'thin', elevation: 'none', note: 'Stat tiles, list rows raised from the page — border carries separation.' },
  { id: 'quiet', pad: 'padMd', gap: 'gap', radius: 'md', border: 'none', elevation: 'none', note: 'Inline groupings — the tone difference alone separates it from the page.' },
  { id: 'raised', pad: 'padMd', gap: 'gap', radius: 'lg', border: 'thin', elevation: 2, note: 'The standard content card — border + one visible elevation step.' },
  { id: 'modal', pad: 'padLg', gap: 'gap', radius: 'lg', border: 'regular', elevation: 4, note: 'Dialogs, command plates — the strongest separation the kit offers.' },
];

export function cardPreset(id: string): CardPreset | undefined {
  return CARD_PRESETS.find((p) => p.id === id);
}

/**
 * Resolve a card preset against the current tokens: px paddings, radius,
 * border width and a ready box-shadow value (`elev-none` = no shadow).
 */
export function resolveCard(
  preset: CardPreset,
  t: NexusTokens,
): { pad: number; gap: number; radius: number; borderWidth: number; shadow: string } {
  const padKey = { padSm: 2, padMd: 3, padLg: 4 } as const;
  return {
    pad: t.space[padKey[preset.pad] as 2 | 3 | 4],
    gap: t.space[2],
    radius: t.radius[preset.radius],
    borderWidth: preset.border === 'none' ? 0 : t.line[preset.border],
    shadow: preset.elevation === 'none' ? 'none' : (t.elevation.values[`elev-${preset.elevation}`] ?? 'none'),
  };
}
