import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { buildMetadata } from "@/lib/seo/metadata";
import { contactEmail, siteName } from "@/lib/site";

export const metadata = buildMetadata({
  title: "About, methodology and advertising policy",
  description:
    "How the tools are built, how conversions are tested, what runs on the server, and the rules the single ad slot follows.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="page narrow">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "About", href: "/about" },
        ]}
      />

      <header style={{ paddingBottom: 22 }}>
        <p className="eyebrow">Reference / methodology</p>
        <h1 className="tool-title" style={{ marginTop: 8 }}>
          About {siteName}
        </h1>
        <p className="tool-dek">
          A small, deliberately narrow toolkit: conversion, calculation, encoding and inspection. The ambition is
          accuracy you can check, not the largest list of tools on the internet.
        </p>
      </header>

      <div className="prose">
        <h2 id="methodology">Methodology</h2>
        <p>
          Conversion factors live in a typed registry in the source code. They are exact decimals wherever the
          standard defines one — 1 inch is 0.0254 m, 1 pound is 0.45359237 kg — and labelled conventions where it
          does not, such as an average Gregorian month of 30.436875 days.
        </p>
        <p>
          A conversion multiplies by the source factor and divides by the target factor in one step. Displayed
          values are rounded to six significant figures; the unrounded value is kept for the next operation. That
          matters when a result feeds another calculation rather than a person.
        </p>
        <p>
          Each tool page publishes its own limits. The{" "}
          <Link href="/blog/how-we-test-conversions">methodology guide</Link> describes the golden-value tests and
          the claims the site does not make.
        </p>

        <h2>What runs where</h2>
        <p>
          Most tools run entirely in the browser: conversions, encodings, hashing, image compression and text
          analysis never upload your input. Three tools need a server round-trip, and each says so on its page:
        </p>
        <ul>
          <li>
            <Link href="/tools/dns-lookup">DNS lookup</Link> queries Cloudflare&apos;s DNS-over-HTTPS resolver.
          </li>
          <li>
            <Link href="/tools/ip-lookup">IP lookup</Link> queries <code>ipwho.is</code> and names the provider in
            the result.
          </li>
          <li>
            <Link href="/tools/speed-test">Speed test</Link> measures against this site&apos;s own endpoint, not a
            third-party network.
          </li>
        </ul>

        <h2 id="advertise">Advertising policy</h2>
        <p>
          There is at most one ad plate per page, below the tool and above the reference material. It is always
          labelled, its height is reserved before it loads, and it never appears in the header, the footer or the
          middle of a result.
        </p>
        <p>
          No pop-unders, no interstitials, no auto-playing video, no ad code that can navigate the page. Until a
          real sponsor is routed, the plate reads “Slot available” and makes no network request.
        </p>
        <p className="micro">Ad enquiries open when the production domain is finalised.</p>

        <h2 id="corrections">Corrections</h2>
        <p>
          A wrong number is a bug. If a conversion, formula or claim is incorrect, report it with the tool name,
          the input and the expected result.
          {contactEmail ? (
            <>
              {" "}
              Email <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
            </>
          ) : (
            " Contact details will be published with the production domain."
          )}
        </p>

        <h2>Privacy, in one line</h2>
        <p>
          No account, no tracker by default, no upload unless a page says otherwise. Read the{" "}
          <Link href="/privacy">privacy page</Link> for the exact list.
        </p>
      </div>
    </div>
  );
}
