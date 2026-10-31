/**
 * Cascade Ads slot declaration.
 *
 * Apps declare slots; they never embed provider code. Until the router is live
 * this renders the designed placeholder plate (the Cut-Lab pattern): a labelled,
 * height-reserved box with no network request and no layout shift.
 */

export type AdSlotId =
  | "WEBTOOLS_HOME_HEADER"
  | "WEBTOOLS_CONTENT_INLINE"
  | "WEBTOOLS_CONTENT_INLINE_2"
  | "WEBTOOLS_CONTENT_INLINE_3"
  | "WEBTOOLS_CONTENT_INLINE_4"
  | "WEBTOOLS_CONTENT_INLINE_5"
  | "WEBTOOLS_RAIL_LEFT"
  | "WEBTOOLS_RAIL_RIGHT"
  | "WEBTOOLS_MOBILE_BAR";

export interface AdSlotProps {
  slot: AdSlotId;
  format?: "728x90" | "320x100" | "120x600" | "336x280" | "970x90";
  mobileFormat?: "320x100" | "320x50";
  size?: string;
  mobileSize?: string;
}

export function AdSlot({
  slot,
  format = "728x90",
  mobileFormat,
  size = "728 × 90",
  mobileSize,
}: AdSlotProps) {
  return (
    <aside aria-label="Advertisement">
      <figure
        className="ad-slot"
        data-ad-slot={slot}
        data-format={format}
        data-mobile-format={mobileFormat ?? format}
      >
        <span className="ad-chip">AD</span>
        <span className="ad-size ad-size-desktop">{size}</span>
        {mobileSize ? <span className="ad-size ad-size-mobile">{mobileSize}</span> : null}
        <span className="ad-note">Slot available</span>
      </figure>
    </aside>
  );
}
