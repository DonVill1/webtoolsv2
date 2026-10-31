"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const measurementId = process.env.NEXT_PUBLIC_ANALYTICS_ID;

type Choice = "granted" | "denied";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __gtagConsent?: (choice: Choice) => void;
  }
}

function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!measurementId) return;
    const stored = window.localStorage.getItem("analytics-consent");
    if (stored === "granted" || stored === "denied") {
      window.__gtagConsent?.(stored);
      return;
    }
    setVisible(true);
  }, []);

  if (!visible) return null;

  const choose = (choice: Choice) => {
    window.localStorage.setItem("analytics-consent", choice);
    window.__gtagConsent?.(choice);
    setVisible(false);
  };

  return (
    <div className="consent" role="dialog" aria-label="Analytics consent">
      <span>
        Anonymous page analytics help decide which tools to improve. No cross-site tracking, no ads audience.
      </span>
      <span style={{ display: "flex", gap: 8 }}>
        <button type="button" className="btn btn-sm" onClick={() => choose("denied")}>
          Decline
        </button>
        <button type="button" className="btn btn-sm btn-primary" onClick={() => choose("granted")}>
          Allow
        </button>
      </span>
    </div>
  );
}

export function Analytics() {
  if (!measurementId) return null;

  return (
    <>
      <Script id="gtag-consent" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied'
          });
          window.__gtagConsent = function(choice) {
            gtag('consent', 'update', { analytics_storage: choice });
          };
        `}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-config" strategy="afterInteractive">
        {`gtag('js', new Date()); gtag('config', '${measurementId}', { anonymize_ip: true });`}
      </Script>
      <ConsentBanner />
    </>
  );
}
