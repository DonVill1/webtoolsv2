'use client';

// Nexus UX/UI — React glue.
//
// App-side integration for spaces: an element the design made room for, the
// engine measures it, negotiates through the configured link, and hands back
// the decision plus the host's raw payload. Re-negotiates on resize/rotation,
// restamps countability on genuine visibility changes.
//
// `NexusSpace` is the engine's own minimal, style-free frame so the standard
// works anywhere out of the box; hosts with their own visual system use
// `useNexusSlot` and render over `state.payload`.

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactElement, RefObject } from 'react';
import type { Shape } from './types';
import { UniversalSlot, type UAADecision } from './slot';
import { getNexusLink } from './link';
import { scaleTokens, nexusScale } from './scale';
import { viewportStatus, type ViewportStatus } from './viewport';
import { nexusTokens, type NexusTokens } from './tokens';
import { containerTokens, containerScale, type ContainerScaleState } from './container';
import { snapPane } from './shell';

export interface UseNexusSlotOptions {
  site: string;
  role: string;
  priority?: number;
  /** Catalog the space may negotiate (required — the engine is content-agnostic). */
  shapes?: Shape[];
  /** Visible-fraction threshold below which a decision stops counting (default 0.5). */
  visibleThreshold?: number;
  /** Near-viewport negotiation gate in px (engine default 600); `false` negotiates on mount. */
  nearViewport?: number | false;
}

type GlobalSlots = { slots: UniversalSlot[] };

// Live registry for platform consoles.
const g = globalThis as unknown as GlobalSlots;
g.slots = g.slots ?? [];

function registerDebug(slot: UniversalSlot): void {
  g.slots.push(slot);
}
function unregisterDebug(slot: UniversalSlot): void {
  const idx = g.slots.indexOf(slot);
  if (idx >= 0) g.slots.splice(idx, 1);
}

export function useNexusSlot<T extends HTMLElement = HTMLDivElement>(
  options: UseNexusSlotOptions,
): { ref: RefObject<T | null>; state: UAADecision | null } {
  const ref = useRef<T | null>(null);
  const [state, setState] = useState<UAADecision | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return () => undefined;
    const slot = new UniversalSlot({
      element: el,
      site: options.site,
      role: options.role,
      priority: options.priority,
      candidateShapes: options.shapes,
      visibleThreshold: options.visibleThreshold,
      nearViewport: options.nearViewport,
      link: getNexusLink(),
    });
    registerDebug(slot);
    const unsub = slot.onDecision((decision) => setState(decision));
    slot.observe();
    return () => {
      unsub();
      slot.disconnect();
      unregisterDebug(slot);
    };
    // The slot identity is fixed per mount; renegotiation is internal.
  }, [options.site, options.role, options.priority, options.visibleThreshold, options.nearViewport]);

  return { ref, state };
}

/**
 * The engine's generic space component: render it anywhere and the served
 * result fits the box exactly — or the space holds. Pass the host's shape
 * catalog; with an ad link + ad shapes this is an ad slot, with layout
 * shapes it is a fitting content region.
 */
export function NexusSpace({
  site,
  role,
  priority,
  shapes,
  className,
}: {
  site: string;
  role: string;
  priority?: number;
  shapes?: Shape[];
  className?: string;
}): ReactElement {
  const { ref, state } = useNexusSlot<HTMLDivElement>({ site, role, priority, shapes });
  return (
    <div
      ref={ref}
      data-nexus-role={role}
      style={{ minWidth: 120, minHeight: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      className={className ?? ''}
    >
      <SpaceFrame state={state} />
    </div>
  );
}

function SpaceFrame({ state }: { state: UAADecision | null }): ReactElement {
  if (!state) return <span style={{ fontFamily: 'monospace', opacity: 0.5 }}>NEXUS · parked — negotiates on scroll approach</span>;
  if (!state.delivered) {
    const { box, shapes: fitting } = state.capability;
    const fits = fitting.length > 0 ? fitting.join(' → ') : 'nothing — holding';
    return (
      <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
        NEXUS HOLD · {Math.round(box.w)}×{Math.round(box.h)} · no standard shape fits ({fits})
      </span>
    );
  }
  if (!state.visible) {
    return (
      <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
        ✂ CUT — off-screen, not counted
      </span>
    );
  }
  const rb = state.renderedBox;
  const meta = `${Math.round(state.capability.box.w)}×${Math.round(state.capability.box.h)} · ${state.format} · ${state.provider}${rb ? ` · rendered ${rb.w}×${rb.h}` : ''}`;
  return <span style={{ fontFamily: 'monospace', fontSize: 12 }}>NEXUS SERVED · {meta}</span>;
}

/** Live viewport guard. Breakage is reported; the scale engine never deforms. */
export function useViewportGuard(): ViewportStatus {
  const [status, setStatus] = useState<ViewportStatus>(() => viewportStatus());
  useEffect(() => {
    const onResize = () => setStatus(viewportStatus());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return status;
}

/** Live fluid scale: React state + a pre-spread CSS-variables style object. */
export function useNexusScale(): { vars: CSSProperties; tokens: ReturnType<typeof scaleTokens> } {
  const [tokens, setTokens] = useState(() => scaleTokens());
  useEffect(() => {
    const onResize = () => setTokens(scaleTokens());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return { vars: tokens.vars as CSSProperties, tokens };
}

/** Live full token set (every family) for the viewport, as spreadable vars. */
export function useNexusTokens(): { vars: CSSProperties; tokens: NexusTokens } {
  const [tokens, setTokens] = useState(() => nexusTokens());
  useEffect(() => {
    const onResize = () => setTokens(nexusTokens());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return { vars: tokens.vars as CSSProperties, tokens };
}

export interface PaneLadderHandle {
  /** Spread onto the drag handle (divider) element. */
  handleProps: {
    onPointerDown: (e: React.PointerEvent) => void;
    style: CSSProperties;
  };
  /** Snapped hard point while dragging (px); null when idle. */
  preview: number | null;
  /** The committed pane width (px); null until the first commit. */
  value: number | null;
  /** Commit a width directly (snaps to the ladder). */
  setPane: (px: number) => void;
}

/**
 * The pane-drag contract from the shell pane ladder: drag live, preview the
 * snapped hard point while moving, commit only on release — panes never rest
 * in a hold zone. Attach a ref to the pane element and spread handleProps on
 * the divider; render the pane at (preview ?? value ?? designed) width.
 * Keyboard: Arrow keys on the handle move 1 hard point, Home/End jump — the
 * grammar from keyboard.ts applies to dividers too.
 */
export function usePaneLadder<T extends HTMLElement = HTMLDivElement>(
  handleRef: RefObject<T | null>,
  ladderPoints: number[],
  options: {
    /** Which side the pane docks on — drag direction follows it. */
    side?: 'left' | 'right';
    /** The pane's designed width (scale-derived) — the value before first drag. */
    designed?: number;
    scale?: number;
  } = {},
): PaneLadderHandle {
  const side = options.side ?? 'left';
  const scale = options.scale ?? (typeof window === 'undefined' ? 1 : nexusScale().scale);
  const [preview, setPreview] = useState<number | null>(null);
  const [value, setValue] = useState<number | null>(options.designed ?? null);
  const points = useMemo(() => [...ladderPoints].map((p) => Math.max(1, Math.round(p * scale))).sort((a, b) => a - b), [ladderPoints, scale]);

  const previewRef = useRef<number | null>(null);
  previewRef.current = preview;

  useEffect(() => {
    const handle = handleRef.current;
    if (!handle || points.length === 0) return () => undefined;
    let onMove: ((e: PointerEvent) => void) | null = null;

    const onDown = (e: PointerEvent) => {
      if (!e.isPrimary) return;
      e.preventDefault();
      handle.setPointerCapture(e.pointerId);
      const onMoveAdapter = (ev: PointerEvent) => {
        const r = handle.parentElement?.getBoundingClientRect();
        if (!r) return;
        const w = side === 'left' ? ev.clientX - r.left : r.right - ev.clientX;
        setPreview(snapPane(w, points));
      };
      const onUp = () => {
        window.removeEventListener('pointermove', onMoveAdapter);
        window.removeEventListener('pointerup', onUp);
        try { handle.releasePointerCapture(e.pointerId); } catch { /* released already */ }
        const commit = previewRef.current;
        setPreview(null);
        if (commit != null) setValue(commit);
        onMove = null;
      };
      onMove = onMoveAdapter;
      window.addEventListener('pointermove', onMoveAdapter);
      window.addEventListener('pointerup', onUp);
    };
    handle.addEventListener('pointerdown', onDown);
    return () => {
      handle.removeEventListener('pointerdown', onDown);
      if (onMove) window.removeEventListener('pointermove', onMove);
    };
  }, [handleRef, points, side]);

  const setPane = (px: number): void => setValue(snapPane(px, points));

  return {
    handleProps: {
      onPointerDown: () => undefined, // real binding happens on the DOM node; spread keeps the contract explicit
      style: { touchAction: 'none', cursor: 'col-resize' },
    },
    preview,
    value,
    setPane,
  };
}

/**
 * Live container-scoped tokens: attach the ref to any element and the token
 * families scale to THAT box, not the viewport — the standard for cards,
 * embeds, plugins and portals living inside bigger layouts.
 */
export function useNexusContainer<T extends HTMLElement = HTMLDivElement>(
  ref: RefObject<T | null>,
): { tokens: NexusTokens | null; state: ContainerScaleState | null } {
  const [tokens, setTokens] = useState<NexusTokens | null>(null);
  const [state, setState] = useState<ContainerScaleState | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return () => undefined;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      if (w <= 0) return;
      const st = containerScale(w);
      setState(st);
      setTokens(containerTokens(st));
    };
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [ref]);

  return { tokens, state };
}
