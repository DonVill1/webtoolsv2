import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/content/categories";
import { liveTools } from "@/lib/content/tools";
import { siteName } from "@/lib/site";

const popular = ["unit-converter", "percentage-calculator", "json-validator", "base64-encoder"];

export function SiteFooter() {
  const tools = liveTools;
  const tracking = process.env.NEXT_PUBLIC_ANALYTICS_ID ? "consent-gated analytics" : "0 trackers";

  return (
    <footer className="site-footer">
      <div className="page">
        <div className="footer-grid">
          <div>
            <Link href="/" className="wordmark" aria-label={`${siteName} home`}>
              <Image
                src="/webtools-logo.svg"
                alt={siteName}
                width={150}
                height={38}
                className="wordmark-logo"
              />
            </Link>
            <p className="footer-blurb">
              Precise, private web tools. Every answer shows its formula, its rounding rule and its
              limits.
            </p>
            <p className="footer-small">
              {tools.length} tools · {categories.length} categories · {tracking}
            </p>
          </div>

          <div>
            <p className="footer-col-title">Categories</p>
            <div className="footer-links">
              {categories.map((category) => (
                <Link key={category.slug} href={`/categories/${category.slug}`}>
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="footer-col-title">Popular</p>
            <div className="footer-links">
              {popular.map((slug) => {
                const tool = tools.find((entry) => entry.slug === slug);
                return tool ? (
                  <Link key={slug} href={`/tools/${slug}`}>
                    {tool.name}
                  </Link>
                ) : null;
              })}
              <Link href="/tools">All tools</Link>
            </div>
          </div>

          <div>
            <p className="footer-col-title">Reference</p>
            <div className="footer-links">
              <Link href="/convert">Conversion tables</Link>
              <Link href="/blog">Blog</Link>
              <Link href="/about">About &amp; methodology</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </div>
          </div>
        </div>

        <div className="footer-meta">
          <span>
            © {new Date().getFullYear()} {siteName}. All rights reserved.
          </span>
          <span>Client-side by default · server routes disclosed · no sign-up</span>
        </div>
      </div>
    </footer>
  );
}
