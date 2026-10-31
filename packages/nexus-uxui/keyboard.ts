// Nexus UX/UI — the keyboard grammar.
//
// The SEMANTICS of keys in an app view — not the bindings. Apps map this
// grammar onto their own commands; the standard guarantees two keys behave
// the same in every view we ship: Enter commits, Escape unwinds, arrows
// traverse, and nothing is invented on top of the user's own typing.
//
// Deliberately binding-free per app feature: the register of WHAT a key
// means (commit / cancel / unwind / traverse) is the standard; WHICH command
// fires is the host's (Rule 1 — the kit standardizes parameters, not skins).

import type { NexusTokens } from './tokens';

export type KeyAction =
  | 'commit'            // Enter — trigger the focused control
  | 'cancel'            // Escape in an editable surface — back out of the edit, keep the view
  | 'unwind-layer'      // Escape over a stack (drawer → menu → palette → modal) — close the top layer
  | 'traverse-next'     // ArrowDown / ArrowRight within a roving list (direction by layout)
  | 'traverse-prev'     // ArrowUp / ArrowLeft
  | 'jump-start'        // Home — first item
  | 'jump-end'          // End — last item
  | 'page-start'        // PageUp — previous page/chunk (list controls may map)
  | 'page-end'          // PageDown
  | 'noop';             // swallowed intentionally (e.g. Space in a text field)

export interface KeyContext {
  /** The event's key (KeyboardEvent.key). */
  key: string;
  /** True when the focus target edits text (input/textarea/contenteditable/select). */
  inTextField: boolean;
  /** True when a drawing-tool canvas or an embed owns the keystrokes (hosts forward). */
  inFocusSurface?: boolean;
}

/** One classification: context in, semantic action out. Pure. */
export function classifyKey(ctx: KeyContext): KeyAction {
  const { key, inTextField } = ctx;
  // inFocusSurface is advisory for hosts (canvas/embed keystroke routing);
  // the semantic classification is the same either way.
  void ctx.inFocusSurface;
  switch (key) {
    case 'Enter':
      // Enter never hijacks a text field's content (unless the host's commit
      // is designed INTO the field — that's the host's own mapping).
      return inTextField ? 'noop' : 'commit';
    case ' ':
    case 'Spacebar':
      // Space toggles only on controls; in text fields it is letters.
      return inTextField ? 'noop' : 'commit';
    case 'Escape':
      return inTextField ? 'cancel' : 'unwind-layer';
    case 'ArrowDown':
    case 'ArrowRight':
      return 'traverse-next';
    case 'ArrowUp':
    case 'ArrowLeft':
      return 'traverse-prev';
    case 'Home':
      return 'jump-start';
    case 'End':
      return 'jump-end';
    case 'PageUp':
      return 'page-start';
    case 'PageDown':
      return 'page-end';
    default:
      return 'noop';
  }
}

/** The text-editing check the classifier (and any host) uses. */
export function isTextField(el: Element | null | undefined): boolean {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'INPUT') return !(el as HTMLInputElement).type.match(/^(button|checkbox|radio|submit|reset|file)$/);
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return (el as HTMLElement).isContentEditable === true;
}

// --------------------------------------------------------- the grammar ----

export interface KeySemantics {
  /** Canonical keys, one meaning each — the table hosts read. */
  rows: Array<{ keys: string; action: KeyAction | string; rule: string }>;
}

export const KEY_GRAMMAR: KeySemantics = {
  rows: [
    { keys: 'Enter', action: 'commit', rule: 'Activate/commit the focused control. Never swallows a text field (fields commit only when designed to).' },
    { keys: 'Space', action: 'commit', rule: 'Toggle/activate the focused control; letters in text fields.' },
    { keys: 'Escape', action: 'unwind-layer', rule: 'Close the TOP layer (toast < palette < menu < drawer < modal — the stack tier order). With text edits open, unwind one level every press: edit first, then the layer.' },
    { keys: 'ArrowUp/Down', action: 'traverse-prev/next', rule: 'Rove within a list/palette/menu/tab strip; list scrollers page instead when the view scrolls.' },
    { keys: 'ArrowLeft/Right', action: 'traverse-prev/next', rule: 'Rove across horizontal strips (tabs, segmented controls); never navigates side panels — that is Tab’s job.' },
    { keys: 'Home / End', action: 'jump-start/end', rule: 'First/last item of the roving scope (not the document, not the page).' },
    { keys: 'PageUp / PageDown', action: 'page-start/end', rule: 'Chunk movement in paged surfaces; passthrough to scroll otherwise.' },
    { keys: 'Tab / Shift+Tab', action: 'traverse-next/prev (focus)', rule: 'The ONLY global focus mover: document tab order = visual order = canvas first, docked rails after (the appScaffold order).' },
    { keys: 'F1–F12, browser chords', action: 'reserve', rule: 'Never rebind F-keys or browser-reserved (Ctrl+T/W/L, Cmd+T…) — apps add feature chords on top, not over.' },
    { keys: 'bare characters', action: 'scope-local', rule: 'Single-letter shortcuts live only in scopes outward of the canvas (lists, toolbars) — never global, so typing is never hijacked.' },
  ],
};

// --------------------------------------------------------- focus rules ----

export interface FocusContract {
  rows: string[];
}

export const FOCUS_CONTRACT: FocusContract = {
  rows: [
    'Tab order = visual order = the shell order (canvas → dock/inspector → chrome bands); the browser focus can never be purchased with row order.',
    'Focus-visible (keyboard) draws the --nexus-focus-* ring; pointer focus never draws it.',
    'modal-layer traps focus while up and releases it on unwind (Escape / close / outside click) — focus always returns to the invoker.',
    'disabled controls are skipped by Tab, not just invisible to clicks.',
    'row/list surfaces rove with arrows and keep ONE tab stop per surface (roving tabindex).',
  ],
};

/**
 * Focus-token derivations from the app's filled slots: the ring keeps its AA
 * non-text contract because accent already contracts 3:1 against surface.
 */
export function focusVars(scaleBase: NexusTokens): Record<string, string> {
  return {
    '--nexus-focus-color': 'var(--nexus-color-accent)',
    '--nexus-focus-width': `${scaleBase.line.regular}px`,
    '--nexus-focus-offset': '2px',
    '--nexus-focus-radius': `${scaleBase.radius.sm}px`,
  };
}
