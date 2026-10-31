// Nexus UX/UI — the token layer.
//
// The fluid scale engine supplies ONE number per scope; this module derives
// every standard token family from it, so type, space, radius, borders,
// elevation and motion all move with the same scale and clamp at the same
// hard points. Exported both as a TS object and as `--nexus-*` CSS custom
// properties, ready to spread onto any element.
//
// CRITICAL — this is the *parameter* standard, never a skin (NEXUS.md
// Rule 1): color ships as an ARCHITECTURE — required semantic slot names
// plus a contrast contract — never a palette. Each app fills its own
// identity in; the kit standardizes the slots and the legibility floor.
//
// Two scopes share the derivation exactly: nexusTokens(width) reads the
// viewport scale (scale.ts); containerTokens(w) in container.ts reads a
// container scale. The ramp constants live here, once, so the rhythm can
// never diverge between scopes.

import { nexusScale } from './scale';
import type { ScaleState, ScaleTokens } from './scale';

// ---------------------------------------------------------------- radii ----

export interface RadiusTokens {
  sm: number;
  md: number;
  lg: number;
  full: number;
}

/** Corner hard points × scale — full stays a circle/9999px value. */
export function radiusSet(scale: number): RadiusTokens {
  return {
    sm: r1(4 * scale),
    md: r1(8 * scale),
    lg: r1(14 * scale),
    full: 9999,
  };
}

// --------------------------------------------------------------- borders ----

export interface LineTokens {
  /** Hairline: dividers, table rules, input strokes. */
  thin: number;
  /** Component borders: cards, plates, toolbars. */
  regular: number;
  /** Emphasis strokes: active outlines, danger states. */
  heavy: number;
}

/** Border widths are physical px on purpose — optical truth, not scale. */
export function lineSet(): LineTokens {
  return { thin: 1, regular: 2, heavy: 3 };
}

// ------------------------------------------------------------- elevation ----

export interface ElevationStep {
  /** Shadow stack step index, 1 (rest) – 5 (overlays). */
  level: 1 | 2 | 3 | 4 | 5;
  y: number;
  blur: number;
  spread: number;
  /** Opacity of the app's shadow slot in the recipe. */
  strength: number;
}

export interface ElevationTokens {
  steps: ElevationStep[];
  /** Ready-to-use box-shadow values; the tint is the app's `shadow` slot. */
  values: Record<string, string>;
}

const ELEVATIONS: Omit<ElevationStep, 'level'>[] = [
  { y: 1, blur: 2, spread: 0, strength: 0.07 },
  { y: 2, blur: 4, spread: 0, strength: 0.08 },
  { y: 4, blur: 10, spread: 0, strength: 0.09 },
  { y: 8, blur: 20, spread: -2, strength: 0.1 },
  { y: 16, blur: 40, spread: -4, strength: 0.12 },
];

export function elevationSet(): ElevationTokens {
  const steps: ElevationStep[] = ELEVATIONS.map((e, i) => ({
    ...e,
    level: (i + 1) as ElevationStep['level'],
  }));
  const values: Record<string, string> = {};
  for (const step of steps) {
    values[`elev-${step.level}`] =
      `0 ${step.y}px ${step.blur}px ${step.spread}px var(--nexus-color-shadow, rgba(0, 0, 0, ${step.strength}))`;
  }
  return { steps, values };
}

// ---------------------------------------------------------------- motion ----

export interface MotionTokens {
  /** Durations in ms — under 120ms is invisible, over 400 is lag. */
  dur: { instant: number; fast: number; base: number; slow: number };
  /** Standard measure easings (the motion language, not app identity). */
  ease: { standard: string; entrance: string; exit: string };
}

const MOTION: MotionTokens = {
  dur: { instant: 120, fast: 180, base: 240, slow: 360 },
  ease: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    entrance: 'cubic-bezier(0, 0, 0.2, 1)',
    exit: 'cubic-bezier(0.4, 0, 1, 1)',
  },
};

export function motionSet(): MotionTokens {
  return MOTION;
}

// ------------------------------------------------------- type metadata ----

export interface TypeMeta {
  weight: { body: number; emphasis: number; heading: number; strong: number };
  /** Unitless line-heights matched to the type ramp. */
  lineHeight: { tight: number; base: number; relaxed: number };
  /** Letter-spacing for heads/labels (relative to the font size). */
  tracking: { tight: string; normal: string; wide: string };
}

const TYPE_META: TypeMeta = {
  weight: { body: 400, emphasis: 500, heading: 600, strong: 700 },
  lineHeight: { tight: 1.2, base: 1.5, relaxed: 1.7 },
  tracking: { tight: '-0.01em', normal: '0', wide: '0.06em' },
};

export function typeMetaSet(): TypeMeta {
  return TYPE_META;
}

// ------------------------------------------------- color architecture ------
//
// Slots are NAMES + ROLES + required PAIRS. Values are every app's own
// identity — the kit never ships hex. The contract is the standard:
// paired slots must clear WCAG where text/controls meet surfaces.

export interface ColorSlot {
  id: string;
  /** CSS custom property the app must define for this slot. */
  varName: string;
  role: string;
  /** Slots this one must stay legible against (see COLOR_CONTRACT). */
  pairs: string[];
}

export const COLOR_SLOTS: ColorSlot[] = [
  { id: 'surface', varName: '--nexus-color-surface', role: 'page / app background', pairs: ['ink', 'ink-muted', 'line'] },
  { id: 'surface-raised', varName: '--nexus-color-surface-raised', role: 'cards, plates, menus, popovers', pairs: ['ink', 'ink-muted', 'line'] },
  { id: 'surface-sunken', varName: '--nexus-color-surface-sunken', role: 'wells, inset panels, code surfaces', pairs: ['ink', 'ink-muted', 'line'] },
  { id: 'ink', varName: '--nexus-color-ink', role: 'primary text', pairs: ['surface', 'surface-raised'] },
  { id: 'ink-muted', varName: '--nexus-color-ink-muted', role: 'secondary text, captions', pairs: ['surface', 'surface-raised'] },
  { id: 'ink-faint', varName: '--nexus-color-ink-faint', role: 'tertiary / placeholder — large text only', pairs: ['surface'] },
  { id: 'accent', varName: '--nexus-color-accent', role: 'primary actions, focus rings, active states', pairs: ['on-accent', 'surface'] },
  { id: 'on-accent', varName: '--nexus-color-on-accent', role: 'text/ink on accent fills', pairs: ['accent'] },
  { id: 'line', varName: '--nexus-color-line', role: 'hairline borders and dividers', pairs: ['surface', 'surface-raised'] },
  { id: 'line-strong', varName: '--nexus-color-line-strong', role: 'emphasized borders, input strokes at rest', pairs: ['surface', 'surface-raised'] },
  { id: 'shadow', varName: '--nexus-color-shadow', role: 'elevation tint consumed by --nexus-elev-*', pairs: [] },
  { id: 'overlay', varName: '--nexus-color-overlay', role: 'scrims and modal backdrops', pairs: [] },
  { id: 'danger', varName: '--nexus-color-danger', role: 'destructive actions, errors, invalid fields', pairs: ['surface', 'surface-raised', 'on-danger'] },
  { id: 'on-danger', varName: '--nexus-color-on-danger', role: 'text on danger fills', pairs: ['danger'] },
  { id: 'warning', varName: '--nexus-color-warning', role: 'caution states, degraded flows, expiring things', pairs: ['surface', 'surface-raised', 'on-warning'] },
  { id: 'on-warning', varName: '--nexus-color-on-warning', role: 'text on warning fills', pairs: ['warning'] },
  { id: 'success', varName: '--nexus-color-success', role: 'confirmations, completed operations, healthy state', pairs: ['surface', 'surface-raised', 'on-success'] },
  { id: 'on-success', varName: '--nexus-color-on-success', role: 'text on success fills', pairs: ['success'] },
  { id: 'info', varName: '--nexus-color-info', role: 'neutral notices, hints, onboarding flags', pairs: ['surface', 'surface-raised'] },
];

export interface ColorContract {
  /** Ordered slot pair: first (foreground-ish) against second (surface-ish). */
  pair: [string, string];
  /** Minimum required contrast ratio (WCAG). */
  ratio: 3 | 4.5;
  scope: string;
}

export const COLOR_CONTRACT: ColorContract[] = [
  { pair: ['ink', 'surface'], ratio: 4.5, scope: 'body text on the page' },
  { pair: ['ink', 'surface-raised'], ratio: 4.5, scope: 'body text on cards/plates' },
  { pair: ['ink-muted', 'surface'], ratio: 4.5, scope: 'captions on the page' },
  { pair: ['ink-muted', 'surface-raised'], ratio: 4.5, scope: 'captions on cards' },
  { pair: ['ink-faint', 'surface'], ratio: 3, scope: 'placeholder / large text only' },
  { pair: ['on-accent', 'accent'], ratio: 4.5, scope: 'labels on filled buttons' },
  { pair: ['accent', 'surface'], ratio: 3, scope: 'filled actions / focus rings — non-text UI contrast' },
  { pair: ['line', 'surface'], ratio: 3, scope: 'visible hairlines — non-text contrast' },
  { pair: ['danger', 'surface'], ratio: 3, scope: 'error strokes / destructive buttons — non-text contrast' },
  { pair: ['on-danger', 'danger'], ratio: 4.5, scope: 'labels on filled destructive actions' },
  { pair: ['warning', 'surface'], ratio: 3, scope: 'caution strokes / filled warnings — non-text contrast' },
  { pair: ['on-warning', 'warning'], ratio: 4.5, scope: 'labels on filled warning plates' },
  { pair: ['success', 'surface'], ratio: 3, scope: 'confirmations — non-text contrast' },
  { pair: ['on-success', 'success'], ratio: 4.5, scope: 'labels on filled success plates' },
  { pair: ['info', 'surface'], ratio: 3, scope: 'neutral notice accents — non-text contrast' },
];

// ------------------------------------------------------------ assembly ----

export interface NexusTokens extends Omit<ScaleTokens, 'vars' | 'scale'> {
  /** The scale this token set was derived from (viewport or container). */
  scale: ScaleState;
  /** Full family set: type/space vars + radius/line/elev/motion. */
  vars: Record<string, string>;
  radius: RadiusTokens;
  line: LineTokens;
  elevation: ElevationTokens;
  motion: MotionTokens;
  typeMeta: TypeMeta;
  color: { slots: ColorSlot[]; contract: ColorContract[] };
}

/** Round to 0.1px like the rest of the scale. */
function r1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * THE single derivation: every family from one scale number. Viewport and
 * container scopes both land here so the rhythm can never diverge.
 */
export function tokensForScale(scale: ScaleState): NexusTokens {
  const s = scale.scale;
  const type = Object.fromEntries(
    Object.entries({ xs: 0.75, sm: 0.88, md: 1, lg: 1.25, xl: 1.6 }).map(([k, v]) => [k, r1(16 * v * s)]),
  ) as ScaleTokens['type'];
  const space = Object.fromEntries(
    Object.entries({ 1: 0.5, 2: 1, 3: 1.75, 4: 3 }).map(([k, v]) => [k, r1(4 * v * s)]),
  ) as ScaleTokens['space'];
  const radius = radiusSet(s);
  const line = lineSet();
  const elevation = elevationSet();
  const motion = motionSet();
  const vars: Record<string, string> = {
    '--nexus-root': `${s}`,
    ...Object.fromEntries(Object.entries(type).map(([k, v]) => [`--nexus-type-${k}`, `${v}px`])),
    ...Object.fromEntries(Object.entries(space).map(([k, v]) => [`--nexus-space-${k}`, `${v}px`])),
    ...Object.fromEntries(Object.entries(radius).map(([k, v]) => [`--nexus-radius-${k}`, `${v}px`])),
    '--nexus-line-thin': `${line.thin}px`,
    '--nexus-line-regular': `${line.regular}px`,
    '--nexus-line-heavy': `${line.heavy}px`,
    ...elevation.values,
    '--nexus-dur-instant': `${motion.dur.instant}ms`,
    '--nexus-dur-fast': `${motion.dur.fast}ms`,
    '--nexus-dur-base': `${motion.dur.base}ms`,
    '--nexus-dur-slow': `${motion.dur.slow}ms`,
    '--nexus-ease-standard': motion.ease.standard,
    '--nexus-ease-entrance': motion.ease.entrance,
    '--nexus-ease-exit': motion.ease.exit,
  };
  return {
    vars,
    scale,
    type,
    space,
    radius,
    line,
    elevation,
    motion,
    typeMeta: TYPE_META,
    color: { slots: COLOR_SLOTS, contract: COLOR_CONTRACT },
  };
}

/** The token set for a viewport width (live when omitted). */
export function nexusTokens(width?: number): NexusTokens {
  return tokensForScale(nexusScale(width));
}
