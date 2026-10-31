// Nexus UX/UI — device classes and their DESIGN BOUNDS.
//
// Breakpoints decide which device class a viewport is; the presets carry the
// designed minimum/maximum of each class — the hard limits the scale engine
// clamps at and the viewport guard names when broken.

import type { DeviceClass } from './types';

export interface DeviceDesign {
  min: number;
  max: number;
}

/** Designed viewport bounds per class: desktop / tablet / mobile. */
export const DEVICE_PRESETS: Record<DeviceClass, DeviceDesign> = {
  desktop: { min: 1024, max: 2560 },
  tablet: { min: 768, max: 1023 },
  mobile: { min: 320, max: 767 },
};

export function detectDeviceClass(width?: number): DeviceClass {
  const w = width ?? (typeof window === 'undefined' ? 1280 : window.innerWidth);
  if (w >= 1024) return 'desktop';
  if (w >= 768) return 'tablet';
  return 'mobile';
}
