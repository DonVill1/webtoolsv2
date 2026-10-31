// Nexus UX/UI — the interaction-state standard.
//
// Headless parameters for what a control DOES when touched: one state matrix
// every interactive element follows, derived `--nexus-state-*` tokens for
// hover/pressed/selected/disabled, focus tokens from the accent slot, and the
// reduced-motion contract on top of the motion family. Parameters, never a
// skin (Rule 1): every paint reads slots the app already defines.
//
// The matrix is the standard; the tokens are its measurable output. A
// component that cannot honor a state's rule (a chip that can't show focus)
// is not a state slot — say so in its host, render nothing invented.

import { COLOR_SLOTS } from './tokens';
import type { NexusTokens } from './tokens';

// ------------------------------------------------------------ the matrix ----

export type InteractionState =
  | 'rest'
  | 'hover'
  | 'focus-visible'
  | 'active'
  | 'selected'
  | 'disabled'
  | 'loading'
  | 'dragging';

export interface StateRule {
  state: InteractionState;
  /** The parameters of this state — the contract, not a look. */
  rule: string;
  /** The token(s) a host consumes to honor it. */
  tokens: string[];
}

export const STATE_MATRIX: StateRule[] = [
  { state: 'rest', rule: 'The baseline. Paints from the slots only — no invented grays, no elevation drift.', tokens: ['surface/color slots'] },
  { state: 'hover', rule: 'Pointer over a fine-pointer control: an edge/overlay shift expressed with the ink slot at low strength. Hover never changes geometry — no lifts, no resizes, no text reflow.', tokens: ['--nexus-state-hover', '--nexus-state-hover-strong'] },
  { state: 'focus-visible', rule: 'Keyboard focus only (pointer focus stays quiet): a visible ring from `focus-*` tokens at AA non-text contrast. Focus-visible implies legibility, never implies selection.', tokens: ['--nexus-focus-color', '--nexus-focus-width', '--nexus-focus-offset'] },
  { state: 'active', rule: 'Pressed: the pressed tint plus a `pressed-shift` nudge (≤2px). Geometry returns on release; active + focus-visible may stack.', tokens: ['--nexus-state-pressed', '--nexus-state-pressed-shift'] },
  { state: 'selected', rule: 'A standing choice (not pressed): accent-tinted wash or an inner edge. Selected is useful without hover — keyboard-only users must see it.', tokens: ['--nexus-state-selected', '--nexus-state-selected-edge'] },
  { state: 'disabled', rule: 'Fixed opacity ratio and NO pointer transitions (no hover, no focus, no cursor styles). Disabling never hides affordance silently — pair with the muted ink slot for the reason when the layout allows.', tokens: ['--nexus-state-disabled-opacity'] },
  { state: 'loading', rule: 'The original label stays (or its space does); progress is an overlay, never a layout shift. Motion respects the motion-scale contract.', tokens: ['--nexus-motion-scale'] },
  { state: 'dragging', rule: 'Elevated one elevation step and dimmed to the dragging tint; drop affordances live in the destination, not the ghost. Dropping snaps to hard points (see snapPane).', tokens: ['--nexus-state-dragging', 'elev-3'] },
];

// ------------------------------------------------------------- the tokens ----

export interface StateTokens {
  /** Ready-to-spread `--nexus-*` vars. */
  vars: Record<string, string>;
  /** The existing reduced-motion media verdict (null = no preference). */
  motionScale: number;
}

// Strengths chosen once, reasoned: quiet enough for text over it
// (ink at 6–12%), loud enough to read as state without a palette.
export interface StateOptions {
  /** 1 = normal, 0.5 = reduced motion, 0 = none. Hard-clamped. */
  motionScale?: number;
}

/**
 * One derivation: every interactive-state family from the tokens the app
 * already fills. No hex ships here — tints are color-mixed from the ink and
 * accent SLOTS, so identity stays the app's.
 */
export function stateTokens(scaleBase: NexusTokens, options: StateOptions = {}): StateTokens {
  void COLOR_SLOTS; // consumed by contract (see COLOR_CONTRACT) — kept for surface parity
  const scale = Math.max(0, Math.min(1, options.motionScale ?? 1));
  const vars: Record<string, string> = {
    // interactive tints, mixed from the app's own slots
    '--nexus-state-hover': 'color-mix(in srgb, var(--nexus-color-ink) 6%, transparent)',
    '--nexus-state-hover-strong': 'color-mix(in srgb, var(--nexus-color-ink) 10%, transparent)',
    '--nexus-state-pressed': 'color-mix(in srgb, var(--nexus-color-ink) 12%, transparent)',
    '--nexus-state-selected': 'color-mix(in srgb, var(--nexus-color-accent) 14%, transparent)',
    '--nexus-state-selected-edge': 'inset 0 0 0 2px var(--nexus-color-accent)',
    '--nexus-state-dragging': 'color-mix(in srgb, var(--nexus-color-ink) 24%, transparent)',
    // physical parameters of state
    '--nexus-state-pressed-shift': '1px',
    '--nexus-state-disabled-opacity': '0.45',
    // focus (keyboard only; see STATE_MATRIX / keyboard.ts)
    '--nexus-focus-color': 'var(--nexus-color-accent)',
    '--nexus-focus-width': '2px',
    '--nexus-focus-offset': '2px',
    // reduced motion: the quiet durations read the scale; hosts honoring the
    // contract compute `calc(var(--nexus-dur-base) * var(--nexus-motion-scale))`
    '--nexus-motion-scale': `${scale}`,
    '--nexus-dur-instant-quiet': `calc(${scaleBase.motion.dur.instant}ms * var(--nexus-motion-scale, 1))`,
    '--nexus-dur-fast-quiet': `calc(${scaleBase.motion.dur.fast}ms * var(--nexus-motion-scale, 1))`,
    '--nexus-dur-base-quiet': `calc(${scaleBase.motion.dur.base}ms * var(--nexus-motion-scale, 1))`,
    '--nexus-dur-slow-quiet': `calc(${scaleBase.motion.dur.slow}ms * var(--nexus-motion-scale, 1))`,
  };
  return { vars, motionScale: scale };
}

/**
 * Viewport-level state defaults (live when omitted): sets the reduced-motion
 * scale from the media query an app cannot get wrong per component.
 */
export function defaultMotionScale(prefers?: boolean): number {
  const reduced = prefers ?? (typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false);
  return reduced ? 0.5 : 1;
}

/** Non-text UI minimum target for a POINTER (coarse-pointer floor stays 44px in controls). WCAG 2.2 AA. */
export const POINTER_TARGET_MIN = 24;
