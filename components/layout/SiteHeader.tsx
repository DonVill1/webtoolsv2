import Image from "next/image";
import Link from "next/link";
import { siteName } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="page site-header-inner">
        <Link href="/" className="wordmark" aria-label={`${siteName} home`}>
          <Image
            src="/webtools-logo.svg"
            alt={siteName}
            width={150}
            height={38}
            priority
            className="wordmark-logo"
          />
        </Link>
        <nav className="site-nav" aria-label="Primary">
          <Link href="/">Home</Link>
          <Link href="/tools">Tools</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/about">About</Link>
        </nav>
      </div>
    </header>
  );
}
