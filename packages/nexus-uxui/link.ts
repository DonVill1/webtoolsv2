// Nexus UX/UI — link wiring.
//
// The engine is transport-agnostic: a link is how a host answers a Capability
// (walk its own ad chain, fit its own layout, whatever comes next — the space
// does not care). Hosts register their link once at startup with
// setNexusLink(); spaces created without a link hold loudly.

import type { Capability, NexusLink, UAADecision } from './slot';

type RawDecision = Omit<UAADecision, 'visible' | 'countable'>;

let configured: NexusLink | null = null;

/** Register the host's negotiation link. Call once at app startup. */
export function setNexusLink(link: NexusLink): void {
  configured = link;
}

/** The configured link, or a stand-in that holds until the host registers one. */
export function getNexusLink(): NexusLink {
  return configured ?? HOLD_LINK;
}

/** Explicit placeholder link: every space holds pending host configuration. */
export const HOLD_LINK: NexusLink = {
  async negotiate(capability: Capability): Promise<RawDecision> {
    return {
      slotId: capability.slotId,
      site: capability.site,
      role: capability.role,
      device: capability.device,
      delivered: false,
      format: null,
      campaignId: null,
      provider: null,
      renderedBox: null,
      trace: [
        { provider: 'nexus', outcome: 'skipped', message: 'no link configured', ms: 0 },
      ],
      hold: {
        headline: 'This space is holding',
        body: 'The Nexus link is not configured for this app yet.',
      },
      payload: null,
      capability,
    };
  },
};

export type { RawDecision };
