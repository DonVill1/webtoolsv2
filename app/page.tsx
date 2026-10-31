import Link from "next/link";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ToolCards } from "@/components/tools/ToolCards";
import { JsonLd } from "@/components/seo/JsonLd";
import { AdSlot } from "@/components/ui/AdSlot";
import { Icon } from "@/components/ui/Icon";
import { liveTools } from "@/lib/content/tools";
import type { Faq } from "@/lib/content/types";
import { buildMetadata } from "@/lib/seo/metadata";
import { faqSchema, itemListSchema } from "@/lib/seo/schema";
import { siteName } from "@/lib/site";
import { unitCategories } from "@/lib/units/registry";

const tracking = process.env.NEXT_PUBLIC_ANALYTICS_ID ? "consent-gated analytics" : "no trackers";

export const metadata = buildMetadata({
  title: `${siteName} — free web tools with precise answers`,
  description: `Converters, calculators and developer utilities that show the formula, the rounding rule and the limits. ${liveTools.length} free tools, no sign-up, ${tracking}.`,
  path: "/",
});

const popularSlugs = [
  "unit-converter",
  "percentage-calculator",
  "json-validator",
  "base64-encoder",
  "bmi-calculator",
  "password-generator",
];

const popular = popularSlugs
  .map((slug) => liveTools.find((tool) => tool.slug === slug))
  .filter((tool): tool is (typeof liveTools)[number] => Boolean(tool));

const faqs: Faq[] = [
  {
    q: "Are these tools really free?",
    a: "Yes. Every tool is free to use, with no account, no subscription and no locked result. There is at most one clearly labelled ad slot per page, and it never sits between you and an answer.",
  },
  {
    q: "Is my data uploaded?",
    a: "No for most tools. Conversions, hashing, encoding, image compression and text analysis run entirely in your browser. DNS lookup, IP lookup and the speed test need a server request, and each of those pages says so before you run it.",
  },
  {
    q: "How accurate are the answers?",
    a: "Conversion factors are exact decimals where a standard defines one, and labelled conventions where it does not. Displayed values are rounded to six significant figures, with the unrounded value kept for the next operation. Every tool page states its limits.",
  },
  {
    q: "Do I need an account?",
    a: "No. Open the tool, use it, close the tab. There is no sign-up, no saved history on the server and no email required.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="page hero-inner">
          <p className="hero-eyebrow">
            {liveTools.length} free tools · no sign-up
          </p>
          <h1 className="hero-title">
            Powerful web tools at your <span className="hero-accent">fingertips</span>
          </h1>
          <p className="hero-sub">
            Free, fast utilities for converting, calculating, encoding and inspecting — with the
            formula, the rounding rule and the limits shown on every page.
          </p>
          <p className="hero-note">
            No downloads. No sign-ups. The work happens in your browser.
          </p>

          <form action="/tools" method="get" role="search" className="hero-search">
            <label htmlFor="home-search" className="visually-hidden">
              Search tools
            </label>
            <div className="search-bar">
              <input
                id="home-search"
                className="input"
                type="search"
                name="q"
                placeholder={`Search ${liveTools.length} tools — “json”, “kg to lb”, “base64”`}
                autoComplete="off"
              />
              <button className="btn btn-primary" type="submit">
                <Icon name="search" size={16} />
                Search
              </button>
            </div>
          </form>

          <p className="hero-stats">
            <span>
              <strong>{liveTools.length}</strong> tools
            </span>
            <span>
              <strong>{unitCategories.length}</strong> unit families
            </span>
            <span>
              <strong>0</strong> trackers
            </span>
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="why-title">
        <div className="page">
          <h2 id="why-title" className="section-title">
            Why choose our tools?
          </h2>
          <p className="section-kicker">
            Built for a quick answer you can check, not another account to manage.
          </p>
          <div className="benefit-grid">
            <div className="benefit-card">
              <span className="benefit-icon" aria-hidden="true">
                <Icon name="bolt" size={25} />
              </span>
              <h3>Lightning fast</h3>
              <p>
                No app shell and no sign-in. Each page is server-rendered, and the tool itself runs
                as soon as it loads.
              </p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon" aria-hidden="true">
                <Icon name="lock" size={25} />
              </span>
              <h3>Privacy focused</h3>
              <p>
                Most tools never upload your input. The three that need a server request say so
                before you run them.
              </p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon" aria-hidden="true">
                <Icon name="monitor" size={25} />
              </span>
              <h3>Works everywhere</h3>
              <p>
                One responsive layout for desktop, tablet and phone. No install, no extension, no
                separate mobile app.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-band" aria-labelledby="categories-title">
        <div className="page">
          <h2 id="categories-title" className="section-title">
            Browse by category
          </h2>
          <p className="section-kicker">
            Find the right tool by task, then open it directly — every item below is a real page,
            not a card that only appears after JavaScript loads.
          </p>
          <CategoryGrid />
          <div className="section-more">
            <Link href="/tools" className="text-link">
              View all {liveTools.length} tools →
            </Link>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="popular-title">
        <div className="page">
          <h2 id="popular-title" className="section-title">
            Popular tools
          </h2>
          <p className="section-kicker">
            The ones people reach for most, from unit conversion to JSON validation.
          </p>
          <ToolCards tools={popular} headingLevel={3} />
        </div>
      </section>

      <AdSlot
        slot="WEBTOOLS_HOME_HEADER"
        format="728x90"
        mobileFormat="320x100"
        size="728 × 90"
        mobileSize="320 × 100"
      />

      <section className="section" aria-labelledby="how-title">
        <div className="page">
          <h2 id="how-title" className="section-title">
            How it works
          </h2>
          <p className="section-kicker">Three steps, no detours.</p>
          <div className="steps">
            <div className="step">
              <span className="step-num">1</span>
              <h3>Choose a tool</h3>
              <p>Browse by category or search by the task you need to finish.</p>
            </div>
            <div className="step">
              <span className="step-num">2</span>
              <h3>Enter your data</h3>
              <p>Type, paste or pick a file. Most tools process it on your device.</p>
            </div>
            <div className="step">
              <span className="step-num">3</span>
              <h3>Get an answer you can check</h3>
              <p>Copy the result, with the formula and the limits right beside it.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-band" aria-labelledby="faq-title">
        <div className="page">
          <h2 id="faq-title" className="section-title">
            Frequently asked questions
          </h2>
          <p className="section-kicker">The short answers before you start.</p>
          <div className="faq-list">
            {faqs.map((faq) => (
              <div key={faq.q} className="faq-card">
                <h3>{faq.q}</h3>
                <p>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="page">
          <h2>Ready to simplify your online tasks?</h2>
          <p>
            Explore {liveTools.length} free tools and get a precise answer without creating an
            account.
          </p>
          <Link href="/tools" className="cta-link">
            Browse all tools
          </Link>
        </div>
      </section>

      <JsonLd
        data={itemListSchema(
          "All tools",
          liveTools.map((tool) => ({ name: tool.name, href: `/tools/${tool.slug}` })),
        )}
      />
      <JsonLd data={faqSchema(faqs)} id="schema-home-faq" />
    </>
  );
}
