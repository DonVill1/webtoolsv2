import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { buildMetadata } from "@/lib/seo/metadata";
import { contactEmail, siteName } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Privacy and data handling policy",
  description:
    "What this site collects, what stays in your browser, which server routes contact third parties, and how analytics consent works.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="page narrow">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Privacy", href: "/privacy" },
        ]}
      />

      <header style={{ paddingBottom: 22 }}>
        <p className="eyebrow">Policy</p>
        <h1 className="tool-title" style={{ marginTop: 8 }}>
          Privacy
        </h1>
        <p className="tool-dek">The short version: no account, no tracker by default, and most tools never send your input anywhere.</p>
      </header>

      <div className="prose">
        <h2>What stays in your browser</h2>
        <p>
          Conversions, encodings, hashes, JWT decoding, JSON formatting, diffs, password generation, QR codes, colour
          palettes, image compression, SVG editing, text analysis and the time-zone planner all run locally. Your
          input is not transmitted and is not stored after the tab closes.
        </p>

        <h2>What reaches a server</h2>
        <ul>
          <li>
            <strong>DNS lookup</strong> sends the domain and record type to this site&apos;s server route, which
            queries Cloudflare&apos;s DNS-over-HTTPS endpoint.
          </li>
          <li>
            <strong>IP lookup</strong> sends the queried address (or your connection address) to{" "}
            <code>ipwho.is</code> through a server route.
          </li>
          <li>
            <strong>Speed test</strong> transfers data to and from this site&apos;s own endpoint.
          </li>
        </ul>
        <p>
          Like any hosted site, the hosting platform records standard request logs, including IP address, user agent
          and timestamp, for security and reliability. Those logs are not used to profile visitors.
        </p>

        <h2>Analytics</h2>
        <p>
          Analytics is off unless the operator configures a measurement ID, and consent is denied by default. If
          you choose “Allow”, aggregate page analytics are recorded with IP anonymisation. You can decline and the
          site works exactly the same. There is no cross-site advertising audience and no session recording.
        </p>

        <h2>Local storage</h2>
        <p>
          A few tools remember your last input in <code>localStorage</code> so a reload does not lose work. The
          analytics choice is stored there too. Nothing in local storage is sent to the server.
        </p>

        <h2>Your choices</h2>
        <p>
          Clear site data in your browser to remove local storage and the analytics choice. Because there is no
          account, there is no server-side profile to delete.
        </p>

        <h2>Contact</h2>
        <p>
          {contactEmail ? (
            <>
              Privacy questions: <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
            </>
          ) : (
            "Contact details will be published with the production domain."
          )}{" "}
          See also <Link href="/about#methodology">the methodology</Link> and <Link href="/terms">terms</Link>.
        </p>
        <p className="micro">Last updated 27 October 2026 · {siteName}</p>
      </div>
    </div>
  );
}
