import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="page narrow" style={{ paddingBlock: 80 }}>
      <p className="eyebrow">404</p>
      <h1 className="tool-title" style={{ marginTop: 10 }}>
        That page does not exist.
      </h1>
      <p className="tool-dek">
        The link may be old, or the tool may have moved. The full index is the fastest way back.
      </p>
      <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
        <Link className="btn btn-primary" href="/tools">
          All tools
        </Link>
        <Link className="btn" href="/">
          Home
        </Link>
      </div>
    </div>
  );
}
