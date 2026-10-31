import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@/components/Analytics";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/seo/schema";
import { siteName, siteUrl } from "@/lib/site";
import "./globals.css";
import "./v1-ui.css";

const plexMono = localFont({
  src: [
    { path: "./fonts/plex-mono-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/plex-mono-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-plex",
  display: "swap",
  preload: false,
  fallback: ["ui-monospace", "monospace"],
});

// Public ownership tokens. Rendered only when set, so local and preview builds
// stay clean. Google also accepts a DNS TXT domain property; either works.
const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
const bingVerification = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — precise web tools`,
    template: `%s | ${siteName}`,
  },
  description:
    "Precise, private web tools with the formula, rounding rule and limits shown on every page. Converters, calculators and developer utilities that run in your browser.",
  applicationName: siteName,
  formatDetection: { telephone: false, address: false, email: false },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  verification: {
    ...(googleVerification ? { google: googleVerification } : {}),
    ...(bingVerification ? { other: { "msvalidate.01": bingVerification } } : {}),
  },
  openGraph: {
    type: "website",
    siteName,
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0D1B2A",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={plexMono.variable}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <JsonLd data={organizationSchema()} id="schema-organization" />
        <JsonLd data={websiteSchema()} id="schema-website" />
        <Analytics />
      </body>
    </html>
  );
}
