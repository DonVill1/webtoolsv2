// Nexus UX/UI — the region catalog: the page-chrome standard.
//
// Every standard page region gets a spec on the SAME fit contract the ads
// package consumes — the ladder, hold zones, and negotiation apply to page
// chrome, not only ad inventory. Bands are flexible-width region *specials*
// (dims null with designed minimums); inventory-hosting regions carry the
// canonical ad hard points they must accommodate, so a page cut from this
// catalog holds its ad slots by CONSTRUCTION — never by hoping.
//
// Heights/widths are stated at scale 1; `joinDevice` and the scaffold scale
// them by the fluid scale like every other token. Pairing discipline: ads
// never render in label chrome (header nav, footer, banner-plates);
// inventory lives only in the regions designed to receive it.

import type { DeviceClass, Shape } from './types';
import { detectDeviceClass } from './compat';

export type RegionKind = 'chrome' | 'announce' | 'inventory' | 'flow';

export interface BandDesign {
  /** Designed minimum at scale 1 — the hard limit. */
  min: number;
  /** The comfortable design at scale 1 — the snap target. */
  designed: number;
}

export interface RegionSpec {
  id: string;
  label: string;
  kind: RegionKind;
  /** Vertical band design per device class (band regions). */
  band?: Partial<Record<DeviceClass, BandDesign>>;
  /** Width design for column regions. */
  width?: Partial<Record<DeviceClass, BandDesign>>;
  /** Canonical ad format ids this region must accommodate, per device class. */
  hosts?: Partial<Record<DeviceClass, string[]>>;
  note: string;
}

export const REGIONS: RegionSpec[] = [
  {
    id: 'banner-plate',
    label: 'Banner plate',
    kind: 'announce',
    band: { desktop: { min: 40, designed: 48 }, tablet: { min: 40, designed: 44 }, mobile: { min: 36, designed: 40 } },
    note: 'Full-width announcement band (system messages, site notices). Chrome — never ad inventory.',
  },
  {
    id: 'header',
    label: 'Header band',
    kind: 'chrome',
    band: { desktop: { min: 64, designed: 80 }, tablet: { min: 64, designed: 72 }, mobile: { min: 48, designed: 56 } },
    note: 'Brand + primary nav. Control chrome — inventory lives in header-ad-band, never here.',
  },
  {
    id: 'header-ad-band',
    label: 'Header ad band',
    kind: 'inventory',
    band: { desktop: { min: 90, designed: 90 }, tablet: { min: 90, designed: 90 }, mobile: { min: 50, designed: 50 } },
    hosts: {
      desktop: ['970x250', '970x90', '728x90', '468x60'],
      tablet: ['728x90', '468x60'],
      mobile: ['320x100', '320x50', '300x50'],
    },
    note: 'The leaderboard strip designed UNDER the header: desktop/tablet exactly 90px tall so the wide ladders fit edge-to-edge; mobile exactly 50px for the banner ladder.',
  },
  {
    id: 'hero',
    label: 'Hero',
    kind: 'inventory',
    band: { desktop: { min: 250, designed: 360 }, tablet: { min: 250, designed: 280 }, mobile: { min: 240, designed: 240 } },
    hosts: { desktop: ['970x250'], tablet: ['728x90', '300x250'], mobile: ['native'] },
    note: 'Opening block. The billboard (970x250) is the desktop hero hard point; smaller classes fall to rectangle/native inventory.',
  },
  {
    id: 'aside',
    label: 'Aside / sidebar',
    kind: 'inventory',
    width: { desktop: { min: 120, designed: 300 }, tablet: { min: 120, designed: 240 }, mobile: { min: 120, designed: 300 } },
    hosts: {
      desktop: ['300x600', '240x400', '160x600', '120x240', '120x600'],
      tablet: ['240x400', '160x600', '120x600'],
      mobile: ['300x250', '336x280'],
    },
    note: 'Vertical inventory column: designed width snaps to the sidebar hard points (120/160/240/300). Mobile asides move inline below the fold.',
  },
  {
    id: 'content',
    label: 'Content column',
    kind: 'flow',
    width: { desktop: { min: 560, designed: 760 }, tablet: { min: 480, designed: 640 }, mobile: { min: 280, designed: 320 } },
    note: 'The readable measure (~65ch at md type). Inline inventory designs into its flow — see inline-flow.',
  },
  {
    id: 'inline-flow',
    label: 'Inline flow slot',
    kind: 'inventory',
    band: { desktop: { min: 280, designed: 336 }, tablet: { min: 250, designed: 280 }, mobile: { min: 250, designed: 280 } },
    hosts: {
      desktop: ['336x280', '300x250', '250x250', '180x150', 'native'],
      tablet: ['300x250', '250x250', 'native'],
      mobile: ['300x250', '250x250', '180x150', 'native'],
    },
    note: 'The mid-content rectangle slot: designed heights ladder exactly to the rectangle hard points so the box is an exact pick, never a residual.',
  },
  {
    id: 'card-strip',
    label: 'Card strip row',
    kind: 'flow',
    band: { desktop: { min: 180, designed: 320 }, tablet: { min: 160, designed: 280 }, mobile: { min: 160, designed: 240 } },
    hosts: { desktop: ['300x250'], mobile: ['300x250'] },
    note: 'Horizontal card rows designed at the 300px card width so a rectangle card slot spells the same grid as content cards.',
  },
  {
    id: 'footer',
    label: 'Footer band',
    kind: 'chrome',
    band: { desktop: { min: 56, designed: 72 }, tablet: { min: 48, designed: 64 }, mobile: { min: 44, designed: 56 } },
    note: 'Sign-off chrome. Never inventory — the bottom of the page is where trust lives.',
  },
];

export function getRegion(id: string): RegionSpec | undefined {
  return REGIONS.find((r) => r.id === id);
}

/** The designed band of a region on a device class (scale-1 numbers). */
export function regionBand(spec: RegionSpec, device: DeviceClass): BandDesign | null {
  return spec.band?.[device] ?? null;
}

/** The designed width of a column region on a device class (scale-1 numbers). */
export function regionWidth(spec: RegionSpec, device: DeviceClass): BandDesign | null {
  return spec.width?.[device] ?? null;
}

/** The ad hard points a region must accommodate (its pairing table). */
export function regionAdHosts(spec: RegionSpec, device: DeviceClass): string[] {
  return spec.hosts?.[device] ?? [];
}

/**
 * Regions as negotiable shapes: bands and columns are responsive specials —
 * they fill their measured space and carry designed minimums — so the
 * engine's negotiation, holds, and traces work on chrome from the same code
 * path as creative inventory.
 */
export function regionShapes(device?: DeviceClass): Shape[] {
  const d: DeviceClass = device ?? detectDeviceClass();
  const shapes: Shape[] = [];
  for (const r of REGIONS) {
    const band = r.band?.[d];
    if (band) {
      shapes.push({ id: `region/${r.id}`, dims: null, min: { w: 120, h: band.min } });
      continue;
    }
    const width = r.width?.[d];
    if (width) {
      shapes.push({ id: `region/${r.id}`, dims: null, min: { w: width.min, h: 40 } });
    }
  }
  return shapes;
}

// ----------------------------------------------------- page scaffold ------

export interface ScaffoldRow {
  region: string;
  /** Scaled band height (or aside width) in px. */
  size: number;
  kind: RegionKind;
  /** Canonical ad shapes this row is designed to hold (format ids). */
  adHosts: string[];
}

export interface PageScaffold {
  device: DeviceClass;
  /** Ordered rows: plate → header → ad band → hero → main(+aside) … footer. */
  rows: ScaffoldRow[];
  /** Gutter between content and aside columns, scaled. */
  gutter: number;
  notes: string[];
}

const GUTTER = 24; // at scale 1 — reads as space-3 territory on real pages

/**
 * Cut a page from the catalog: the ordered rows with scaled bands, the aside
 * snapped to its nearest sidebar hard point, and every hosting discipline
 * visible. Bands multiply by `scale` exactly like the fluid tokens.
 */
export function pageScaffold(device: DeviceClass, scale: number): PageScaffold {
  const rows: ScaffoldRow[] = [];
  const push = (id: string, size: number): void => {
    const spec = getRegion(id);
    if (!spec) return;
    const band = regionBand(spec, device);
    const width = regionWidth(spec, device);
    const designed = width?.designed ?? size;
    rows.push({
      region: id,
      size: Math.round((band?.designed ?? designed ?? size) * scale),
      kind: spec.kind,
      adHosts: regionAdHosts(spec, device),
    });
  };

  push('banner-plate', 48);
  push('header', 80);
  push('header-ad-band', 90);
  push('hero', 360);
  rows.push({ region: 'main', size: Math.round(contentDesigned(device) * scale), kind: 'flow', adHosts: [] });

  if (device !== 'mobile') {
    const asideSpec = getRegion('aside');
    const asideW = asideSpec ? regionWidth(asideSpec, device) : null;
    if (asideW) {
      rows.push({
        region: 'aside',
        size: Math.round(asideW.designed * scale),
        kind: 'inventory',
        adHosts: regionAdHosts(asideSpec as RegionSpec, device),
      });
    }
  }
  push('inline-flow', 336);
  push('card-strip', 320);
  push('footer', 72);

  return {
    device,
    rows,
    gutter: Math.round(GUTTER * scale),
    notes: [
      'aside is designed to the sidebar ad hard points (120/160/240/300) — swap widths freely, inventory never deforms',
      'inventory bands carry the exact heights of their hard points — a size that never arrives shows nothing',
      'chrome (header, footer, plates) never hosts inventory — content claims chrome first',
    ],
  };
}

/** The main row's height: the content column's designed width as its measure. */
function contentDesigned(device: DeviceClass): number {
  const spec = getRegion('content');
  const w = spec ? regionWidth(spec, device) : null;
  return w?.designed ?? 640;
}
