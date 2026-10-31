// Nexus UX/UI — the space half of the negotiation.
//
// A Nexus space wraps a real DOM element the designer made room for. It
// measures that element (mount + every responsive change via ResizeObserver),
// derives the ranked list of canonical shapes that fit, and hands the
// capability to the configured link. The link answers with a decision; the
// space re-offers automatically whenever its geometry changes.
//
// Three guarantees are enforced HERE, in the engine, before any consumer sees
// a decision:
//
//   1. Fit ruling — a box nothing fits into hard-holds; the link is never
//      consulted, so no fallback shape can sneak past.
//   2. Exact rendering — the decision stamps `renderedBox` with the served
//      shape's canonical pixels, and any link response claiming a shape that
//      does not fit the measured box is rejected back to a hold. A creative
//      is never scaled up, never cropped, never letterboxed-small-into-big.
//   3. Visibility truth — the engine watches whether the space is actually
//      on screen (IntersectionObserver) and stamps `visible` / `countable`
//      on the decision at all times. A decision with countable=false must
//      never be billed, beaconed, or displayed as a fresh serve.

import type { Box, DeviceClass, HoldPlate, Shape, TraceStep } from './types';
import { detectDeviceClass } from './compat';
import { rankShapes, shapeDims, type FitResult } from './fit';
import { getNexusLink } from './link';

export interface Capability {
  slotId: string;
  /** Owning site/property/app, e.g. 'cutlab'. */
  site: string;
  /** Semantic role the designer gave this space: 'sidebar', 'hero', 'inline'... */
  role: string;
  /** Page-level importance, 1 (marginal) – 10 (flagship space). */
  priority: number;
  /** Measured box in CSS pixels. */
  box: Box;
  device: DeviceClass;
  /** Canonical shape ids that fit, best fit first. */
  shapes: string[];
  /** Best-fit detail list for debugging/telemetry. */
  fits: FitResult[];
}

/**
 * Full negotiation decision. Core fields are host-agnostic; `payload` carries
 * whatever the link's host ecosystem returns (e.g. a cascade-side AdDecision),
 * so host views keep rendering their own shapes over the same space.
 */
export interface UAADecision {
  slotId: string;
  site: string;
  role: string;
  device: DeviceClass;
  delivered: boolean;
  /** The served shape id (an ad format id when the link is an ad link). */
  format: string | null;
  campaignId: string | null;
  provider: string | null;
  /** Canonical pixels the decision must render at — engine-stamped, never the link's word. */
  renderedBox: Box | null;
  trace: TraceStep[];
  /** Hold plate copy when the space keeps itself. */
  hold: HoldPlate | null;
  /** Host-shaped raw decision from the link, exactly as the link returned it. */
  payload: unknown;
  capability: Capability;
  /** The space is actually on screen right now. */
  visible: boolean;
  /** delivered && visible — the only state that may be billed or counted. */
  countable: boolean;
}

export type SlotListener = (state: UAADecision) => void;

export interface UniversalSlotOptions {
  element: HTMLElement;
  site: string;
  role: string;
  priority?: number;
  /** Candidate shapes the space may negotiate (hosts pass their catalog). */
  candidateShapes?: Shape[];
  /** Below this visible fraction of the element, the decision stops counting. */
  visibleThreshold?: number;
  /**
   * Near-viewport negotiation gate: the link is only consulted once the
   * element comes within this many px of the viewport (the industry
   * "lazy load" pattern — no ad calls for slots the scroll never reaches).
   * Default {@link DEFAULT_NEAR_VIEWPORT}; `false` negotiates eagerly on mount.
   */
  nearViewport?: number | false;
  link?: NexusLink;
}

/** Default approach distance: ~1 short-viewport ahead of the scroll position. */
export const DEFAULT_NEAR_VIEWPORT = 600;

export interface NexusLink {
  negotiate(capability: Capability): Promise<Omit<UAADecision, 'visible' | 'countable'> | UAADecision>;
}

let seq = 0;

export class UniversalSlot {
  readonly id: string;
  readonly site: string;
  readonly role: string;
  readonly priority: number;

  private readonly element: HTMLElement;
  private readonly link: NexusLink;
  private readonly candidates: Shape[];
  private readonly threshold: number;
  private readonly near: number | false;
  private readonly listeners = new Set<SlotListener>();
  private observer: ResizeObserver | null = null;
  private visibility: IntersectionObserver | null = null;
  private approach: IntersectionObserver | null = null;
  private windowReoffer: (() => void) | null = null;
  private inflight = false;
  private current: UAADecision | null = null;
  private lastVisible = true;
  private approached = false;
  private disposed = false;

  constructor(options: UniversalSlotOptions) {
    this.element = options.element;
    this.site = options.site;
    this.role = options.role;
    this.priority = options.priority ?? 5;
    this.candidates = options.candidateShapes ?? [];
    this.threshold = options.visibleThreshold ?? 0.5;
    this.near = options.nearViewport ?? DEFAULT_NEAR_VIEWPORT;
    this.lastVisible = options.element.checkVisibility?.() ?? options.element.getBoundingClientRect().width > 0;
    this.link = options.link ?? getNexusLink();
    this.id = `uas_${this.site}_${this.role}_${++seq}`;
  }

  /** Measure the element and derive the current capability (no link call). */
  capability(): Capability {
    const rect = this.element.getBoundingClientRect();
    const box = { w: rect.width, h: rect.height };
    const fits = rankShapes(box, this.candidates);
    return {
      slotId: this.id,
      site: this.site,
      role: this.role,
      priority: this.priority,
      box,
      device: detectDeviceClass(),
      shapes: fits.map((f) => f.shape),
      fits,
    };
  }

  /** One full exchange: measure → offer → decision. Safe to call concurrently (serialized). */
  async offer(): Promise<UAADecision> {
    if (this.inflight || this.disposed) return this.current ?? EMPTY_DECISION(this.capability());
    this.inflight = true;
    try {
      const capability = this.capability();
      let decision: UAADecision;
      if (capability.fits.length === 0) {
        // Hard hold: the ruling happens here, before any transport, so nothing
        // can sneak past the fit contract. Strategic shapes (specials) are
        // still allowed if their minimums fit — rankShapes already handles that.
        decision = HOLD_DECISION(capability);
      } else {
        const raw = await this.link.negotiate(capability);
        decision = ENFORCED_DECISION(capability, raw, this.candidates);
      }
      decision.visible = this.lastVisible;
      decision.countable = decision.delivered && decision.visible;
      this.current = decision;
      for (const listener of this.listeners) listener(decision);
      return decision;
    } finally {
      this.inflight = false;
    }
  }

  onDecision(listener: SlotListener): () => void {
    this.listeners.add(listener);
    if (this.current) listener(this.current);
    return () => this.listeners.delete(listener);
  }

  /** Current visibility truth, recomputed on demand (playground diagnostics). */
  visibilityState(): { visible: boolean; countable: boolean } {
    const on =
      this.visibility && this.current
        ? this.element.getBoundingClientRect().width > 0 && this.lastVisible
        : this.lastVisible;
    return { visible: on, countable: Boolean(this.current?.delivered) && on };
  }

  /** Whether the space has come within scroll reach (see `nearViewport`). */
  get reached(): boolean {
    return this.approached;
  }

  /**
   * Watch the element: negotiate at first scroll approach (the link is only
   * invoked once the space comes near the viewport — parked spaces cost
   * nothing); re-negotiate on geometry/device change (ResizeObserver primary,
   * window-resize secondary driver; rotations change device class even where
   * RO delivery is starved); and watch actual on-screen visibility so the
   * decision's `countable` flag is always true.
   */
  observe(): void {
    const reoffer = () => {
      if (this.disposed || !this.approached) return;
      const cap = this.capability();
      if (
        this.current &&
        sameBox(this.current.capability.box, cap.box) &&
        this.current.capability.device === cap.device
      ) {
        return;
      }
      void this.offer();
    };

    // Approach gate: parked until the scroll brings the space within the
    // configured margin. IO fires immediately for in-view / near-view spaces,
    // so above-the-fold inventory negotiates on mount exactly as before.
    if (typeof IntersectionObserver !== 'undefined' && this.near !== false) {
      this.approach = new IntersectionObserver((entries) => {
        const entry = entries[entries.length - 1];
        // IO's initial callback reports regardless of intersection status —
        // only an actual approach (true within the margin) opens the gate.
        if (!entry?.isIntersecting || this.approached) return;
        this.approached = true;
        void this.offer();
      }, { rootMargin: `${this.near}px ${this.near}px` } as IntersectionObserverInit);
      this.approach.observe(this.element);
    } else {
      // No IO, or an explicit eager gate: negotiate on mount.
      this.approached = true;
      void this.offer();
    }

    if (typeof ResizeObserver !== 'undefined') {
      this.observer = new ResizeObserver(reoffer);
      this.observer.observe(this.element);
    }
    this.windowReoffer = reoffer;
    window.addEventListener('resize', reoffer);

    if (typeof IntersectionObserver !== 'undefined') {
      this.visibility = new IntersectionObserver(
        (entries) => {
          const entry = entries[entries.length - 1];
          if (!entry) return;
          const visible = entry.intersectionRatio >= this.threshold || (this.threshold === 0 && entry.intersectionRatio > 0);
          if (visible === this.lastVisible) return;
          this.lastVisible = visible;
          if (this.current) {
            // Visibility flips do not re-negotiate: the serve stands, only its
            // countability is restamped. An off-screen serve is not a display.
            const restamped: UAADecision = {
              ...this.current,
              visible,
              countable: this.current.delivered && visible,
            };
            this.current = restamped;
            for (const listener of this.listeners) listener(restamped);
          }
        },
        { threshold: [0, this.threshold, 1] },
      );
      this.visibility.observe(this.element);
    }
  }

  disconnect(): void {
    this.disposed = true;
    this.observer?.disconnect();
    this.observer = null;
    this.visibility?.disconnect();
    this.visibility = null;
    this.approach?.disconnect();
    this.approach = null;
    if (this.windowReoffer) window.removeEventListener('resize', this.windowReoffer);
    this.windowReoffer = null;
  }
}

function sameBox(a: Box, b: Box): boolean {
  return Math.abs(a.w - b.w) < 1.5 && Math.abs(a.h - b.h) < 1.5;
}

/** Base envelope before visibility/countability are stamped. */
function envelope(cap: Capability, base: Partial<UAADecision>): UAADecision {
  return {
    slotId: cap.slotId,
    site: cap.site,
    role: cap.role,
    device: cap.device,
    delivered: false,
    format: null,
    campaignId: null,
    provider: null,
    renderedBox: null,
    trace: [],
    hold: null,
    payload: null,
    capability: cap,
    visible: true,
    countable: false,
    ...base,
  };
}

/** Empty decision when a space exists but nobody negotiated yet. */
export function EMPTY_DECISION(cap: Capability): UAADecision {
  return envelope(cap, { hold: null, trace: [] });
}

/** The unfittable-box ruling, applied by the engine itself. */
export function HOLD_DECISION(cap: Capability): UAADecision {
  return envelope(cap, {
    trace: [
      {
        provider: 'nexus',
        outcome: 'not_compatible',
        message: `fit ruling: nothing fits ${Math.round(cap.box.w)}×${Math.round(cap.box.h)}`,
        ms: 0,
      },
    ],
    hold: {
      headline: 'This space is holding',
      body: `No standard shape fits ${Math.round(cap.box.w)}×${Math.round(cap.box.h)} — the space waits for the layout to grow.`,
    },
  });
}

/**
 * The exact-rendering guarantee. Whatever the link claims, the decision the
 * consumer sees carries a `renderedBox` that is the served shape's canonical
 * pixels; a response whose shape does not fit the measured box is rejected to
 * a hold with the violation in the trace. A creative is never transformed.
 */
export function ENFORCED_DECISION(
  cap: Capability,
  raw: Omit<UAADecision, 'visible' | 'countable'> | UAADecision,
  shapes: Shape[],
): UAADecision {
  const delivered = raw.delivered ?? false;
  const format = raw.format ?? null;
  if (!delivered || !format) {
    return envelope(cap, { ...raw, delivered: false, format: null, renderedBox: null });
  }
  const dims = shapeDims(format, shapes, cap.box);
  if (!dims || dims.w > cap.box.w + 0.01 || dims.h > cap.box.h + 0.01) {
    return envelope(cap, {
      ...raw,
      delivered: false,
      format: null,
      campaignId: null,
      renderedBox: null,
      provider: null,
      hold: {
        headline: 'This space is holding',
        body: `The link's answer did not fit the measured box (\`${format}\` in ${Math.round(cap.box.w)}×${Math.round(cap.box.h)}) — rejected by the fit contract.`,
      },
      trace: [
        ...(raw.trace ?? []),
        {
          provider: 'nexus',
          outcome: 'not_compatible',
          message: `exact-render rule: ${format} rejected (${dims ? `${dims.w}×${dims.h}` : 'unknown'} > box)`,
          ms: 0,
        },
      ],
    });
  }
  return envelope(cap, { ...raw, delivered: true, format, renderedBox: dims });
}

export { rankShapes, shapeDims, type FitResult };
