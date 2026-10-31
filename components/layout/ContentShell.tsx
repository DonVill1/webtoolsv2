import type { ReactNode } from "react";
import { AdSlot } from "@/components/ui/AdSlot";

/**
 * Keeps the content column at its normal width and adds sticky skyscrapers in
 * the gutters once the viewport can hold them. The rails are display:none
 * below 1400px, so mobile, tablets and small laptops get no side inventory.
 */
export function ContentShell({ children }: { children: ReactNode }) {
  return (
    <div className="content-shell">
      <div className="content-rail">
        <AdSlot
          slot="WEBTOOLS_RAIL_LEFT"
          format="120x600"
          size="120 × 600"
          mobileFormat="320x100"
        />
      </div>
      {children}
      <div className="content-rail">
        <AdSlot
          slot="WEBTOOLS_RAIL_RIGHT"
          format="120x600"
          size="120 × 600"
          mobileFormat="320x100"
        />
      </div>
    </div>
  );
}
