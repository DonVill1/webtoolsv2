"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

function ToolSkeleton() {
  return (
    <div className="tool-panel" aria-busy="true" aria-label="Loading tool">
      <div style={{ height: 14, width: 120, background: "var(--wt-color-surface-sunken)" }} />
      <div style={{ height: 44, marginTop: 16, background: "var(--wt-color-surface-sunken)" }} />
      <div style={{ height: 64, marginTop: 16, background: "var(--wt-color-surface-sunken)" }} />
    </div>
  );
}

const loading = () => <ToolSkeleton />;

const registry: Record<string, ComponentType> = {
  "unit-converter": dynamic(() => import("./unit-converter"), { loading }),
  "base64-encoder": dynamic(() => import("./base64-encoder"), { loading }),
  "text-converter": dynamic(() => import("./text-converter"), { loading }),
  "percentage-calculator": dynamic(() => import("./percentage-calculator"), { loading }),
  "bmi-calculator": dynamic(() => import("./bmi-calculator"), { loading }),
  "birthday-countdown": dynamic(() => import("./birthday-countdown"), { loading }),
  "json-validator": dynamic(() => import("./json-validator"), { loading }),
  "uuid-generator": dynamic(() => import("./uuid-generator"), { loading }),
  "jwt-decoder": dynamic(() => import("./jwt-decoder"), { loading }),
  "hash-generator": dynamic(() => import("./hash-generator"), { loading }),
  "timestamp-converter": dynamic(() => import("./timestamp-converter"), { loading }),
  "diff-checker": dynamic(() => import("./diff-checker"), { loading }),
  "password-generator": dynamic(() => import("./password-generator"), { loading }),
  "qr-code-generator": dynamic(() => import("./qr-code-generator"), { loading }),
  "color-palette-generator": dynamic(() => import("./color-palette-generator"), { loading }),
  "image-compressor": dynamic(() => import("./image-compressor"), { loading }),
  "svg-editor": dynamic(() => import("./svg-editor"), { loading }),
  "dns-lookup": dynamic(() => import("./dns-lookup"), { loading }),
  "ip-lookup": dynamic(() => import("./ip-lookup"), { loading }),
  "speed-test": dynamic(() => import("./speed-test"), { loading }),
  "system-info": dynamic(() => import("./system-info"), { loading }),
  "lorem-ipsum-generator": dynamic(() => import("./lorem-ipsum-generator"), { loading }),
  "test-data-generator": dynamic(() => import("./test-data-generator"), { loading }),
  "markdown-editor": dynamic(() => import("./markdown-editor"), { loading }),
  "text-analyzer": dynamic(() => import("./text-analyzer"), { loading }),
  "timezone-buddy": dynamic(() => import("./timezone-buddy"), { loading }),
  "url-encoder": dynamic(() => import("./url-encoder"), { loading }),
  "cron-explainer": dynamic(() => import("./cron-explainer"), { loading }),
  "regex-tester": dynamic(() => import("./regex-tester"), { loading }),
  "subnet-calculator": dynamic(() => import("./subnet-calculator"), { loading }),
  "loan-calculator": dynamic(() => import("./loan-calculator"), { loading }),
  "vat-calculator": dynamic(() => import("./vat-calculator"), { loading }),
  "iban-validator": dynamic(() => import("./iban-validator"), { loading }),
  "color-contrast-checker": dynamic(() => import("./color-contrast-checker"), { loading }),
  "tip-calculator": dynamic(() => import("./tip-calculator"), { loading }),
  "iso-duration-parser": dynamic(() => import("./iso-duration-parser"), { loading }),
};

export function ToolIsland({ slug }: { slug: string }) {
  const Tool = registry[slug];
  if (!Tool) {
    return (
      <div className="callout">
        <strong>This tool is being rebuilt.</strong> The reference material below is accurate; the interactive
        version ships in the next wave.
      </div>
    );
  }
  return <Tool />;
}
