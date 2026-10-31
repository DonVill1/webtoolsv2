// Nexus UX/UI — engine types.
//
// Nexus is a measured-space negotiation layer. A space announces what it
// physically is (its real rendered box, its device context, the ranked list
// of canonical shapes that fit inside) and a link answers with a decision.
// These types are deliberately content-agnostic: the same contract fits ad
// formats today and layout regions, media decks, panels tomorrow.

export type DeviceClass = 'desktop' | 'tablet' | 'mobile';

/** Measured box in CSS pixels — the truth of the UX. */
export interface Box {
  w: number;
  h: number;
}

/**
 * A canonical shape a space may fit. Either an exact size (dims set) or a
 * responsive special (dims null, with an eligibility minimum). Shapes are
 * content-facing ids — an ad format id, a layout token, anything.
 */
export interface Shape {
  id: string;
  /** Canonical box; null = responsive special that fills its space. */
  dims: Box | null;
  /** Eligibility minimum for responsive specials. */
  min?: Box;
}

/** One hop of the negotiation trace, host-agnostic. */
export interface TraceStep {
  provider: string;
  outcome: string;
  message?: string;
  ms: number;
}

/** The hold plate copy when a space keeps itself instead of serving. */
export interface HoldPlate {
  headline: string;
  body?: string;
}
