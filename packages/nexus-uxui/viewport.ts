// Nexus UX/UI — the viewport guard.
//
// Hard limits are part of the standard: every device class has designed
// bounds, and a display outside them is not scaled into submission — it is
// named, and the person is asked to fix it (narrow window, tool-docked
// viewport, odd emulation). Maximizing the display maximizes utility AND
// the ad inventory that can run in it.
//
// `viewportStatus` is pure (explicit width in, verdict out) so hosts can
// simulate and test it; the React hook reads the live viewport.

import type { DeviceClass } from './types';
import { DEVICE_PRESETS } from './compat';

export interface ViewportStatus {
  ok: boolean;
  device: DeviceClass;
  issue: 'tooNarrow' | 'tooWide' | null;
  bounds: { min: number; max: number };
  /** What the person should do, in one line. */
  message: string | null;
}

/**
 * Verdict for a viewport width against its device class's designed bounds.
 * Width defaults to the live window; pass one to simulate.
 */
export function viewportStatus(width?: number): ViewportStatus {
  const w = width ?? (typeof window === 'undefined' ? 1280 : window.innerWidth);
  const device: DeviceClass = w >= 1024 ? 'desktop' : w >= 768 ? 'tablet' : 'mobile';
  const bounds = DEVICE_PRESETS[device];
  if (w < bounds.min) {
    return {
      ok: false,
      device,
      issue: 'tooNarrow',
      bounds,
      message: `This display is below the designed minimum for ${device} (${bounds.min}px). Fix or maximize the window — ads and layout only fit correctly inside the bounds.`,
    };
  }
  if (w > bounds.max) {
    return {
      ok: false,
      device,
      issue: 'tooWide',
      bounds,
      message: `This display exceeds the designed maximum for ${device} (${bounds.max}px). Scale the window to a standard display — content and ads stop fitting correctly outside the bounds.`,
    };
  }
  return { ok: true, device, issue: null, bounds, message: null };
}
