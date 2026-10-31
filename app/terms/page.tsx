import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteName } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Terms of use and limitations",
  description:
    "The terms for using the tools: provided as-is, no warranty for critical decisions, acceptable use, and where the limits are documented.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="page narrow">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Terms", href: "/terms" },
        ]}
      />

      <header style={{ paddingBottom: 22 }}>
        <p className="eyebrow">Policy</p>
        <h1 className="tool-title" style={{ marginTop: 8 }}>
          Terms of use
        </h1>
        <p className="tool-dek">Plain terms for a free utility site: use it, check it, and do not rely on it for anything critical without verifying.</p>
      </header>

      <div className="prose">
        <h2>As-is</h2>
        <p>
          {siteName} is provided as-is, without warranty of any kind. Every tool page documents its assumptions and
          limits; read them before using a result for a decision that matters. For medical, legal, financial or
          engineering work, verify with an authoritative source.
        </p>

        <h2>No professional advice</h2>
        <p>
          The BMI calculator is a population screening formula, not a diagnosis. Percentage results are arithmetic,
          not financial advice. IP geolocation is approximate. Hashing and encoding are not encryption and do not
          provide confidentiality.
        </p>

        <h2>Acceptable use</h2>
        <ul>
          <li>Do not use the site to break the law or to process data you have no right to process.</li>
          <li>Do not attempt to overload the server routes or automate them beyond reasonable personal use.</li>
          <li>Do not present the output of a tool as a certified measurement or a professional opinion.</li>
        </ul>

        <h2>Availability</h2>
        <p>
          The site may change, and a tool may be rebuilt or retired. There is no account and no stored work, so
          export anything you need to keep. Server routes depend on third-party resolvers and providers that can
          fail independently.
        </p>

        <h2>Advertising</h2>
        <p>
          Pages may carry at most one labelled ad plate. Ads are separated from results and cannot alter a
          calculation. See the <Link href="/about#advertise">advertising policy</Link>.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these terms are handled through the contact details on the{" "}
          <Link href="/about">about page</Link>.
        </p>
        <p className="micro">Last updated 27 October 2026</p>
      </div>
    </div>
  );
}
