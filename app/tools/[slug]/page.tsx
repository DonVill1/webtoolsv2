import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ContentShell } from "@/components/layout/ContentShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { ToolIsland } from "@/components/tools/ToolIsland";
import { ToolViewTabs } from "@/components/tools/ToolViewTabs";
import { ToolCards } from "@/components/tools/ToolCards";
import { AdSlot } from "@/components/ui/AdSlot";
import { ShareButton } from "@/components/ui/ShareButton";
import { getCategory } from "@/lib/content/categories";
import { guidesForTool } from "@/lib/content/guides";
import { TOOL_DETAIL_REVIEWED, toolDetail } from "@/lib/content/tool-details";
import { liveTools, relatedTools, toolBySlug } from "@/lib/content/tools";
import { buildMetadata } from "@/lib/seo/metadata";
import { faqSchema, softwareApplicationSchema } from "@/lib/seo/schema";
import { absoluteUrl } from "@/lib/site";
import { hasToolViews } from "@/lib/tools/views";

export const revalidate = 3600;

export function generateStaticParams() {
  return liveTools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = toolBySlug.get(slug);
  if (!tool) return {};
  return buildMetadata({
    title: tool.seo.title,
    description: tool.seo.description,
    path: `/tools/${tool.slug}`,
    modifiedTime: tool.updated,
  });
}

const serverRouteTools = new Set(["dns-lookup", "ip-lookup", "speed-test"]);

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = toolBySlug.get(slug);
  if (!tool) notFound();

  const category = getCategory(tool.category);
  const related = relatedTools(tool);
  const detail = toolDetail(tool.slug);
  const faqs = [...tool.content.faqs, ...detail.extraFaqs];
  const toolGuides = guidesForTool(tool.slug).slice(0, 4);
  const updated = new Date(tool.updated).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const locality = serverRouteTools.has(tool.slug) ? "Server route" : "Browser only";

  return (
    <ContentShell>
      <div className="page">
        <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Tools", href: "/tools" },
          { name: category.name, href: `/categories/${category.slug}` },
          { name: tool.name, href: `/tools/${tool.slug}` },
        ]}
      />

      <header className="tool-head">
        <p className="eyebrow tool-category" data-category={category.id}>
          <span className="category-dot" aria-hidden="true" />
          <Link href={`/categories/${category.slug}`}>{category.name}</Link>
        </p>
        <h1 className="tool-title">{tool.name}</h1>
        <p className="tool-dek">{tool.content.intro}</p>
        <div className="tool-meta">
          <span className="chip">Updated {updated}</span>
          <span className="chip">{locality}</span>
          <span className="chip">No sign-up</span>
          <ShareButton url={absoluteUrl(`/tools/${tool.slug}`)} title={tool.name} />
        </div>
      </header>

      <div className="callout" style={{ marginBottom: 18 }}>
        <strong>Short answer.</strong> {detail.answer}
      </div>

      <nav className="tool-jump" aria-label="On this page">
        <span className="tool-jump-label">On this page</span>
        <a href="#how-it-works">How it works</a>
        <a href="#faq">FAQ</a>
        <a href="#related">Related</a>
        <a href="#sources">References</a>
      </nav>

      <div className="tool-grid">
        {hasToolViews(tool.slug) ? (
          <div className="tool-view">
            <ToolViewTabs slug={tool.slug} />
            <div id="tool-view-panel" role="tabpanel" aria-label={`${tool.name} interactive tool`}>
              <ToolIsland slug={tool.slug} />
            </div>
          </div>
        ) : (
          <ToolIsland slug={tool.slug} />
        )}
      </div>

      <AdSlot
        slot="WEBTOOLS_CONTENT_INLINE"
        format="728x90"
        mobileFormat="320x100"
        size="728 × 90"
        mobileSize="320 × 100"
      />

      <section className="section" id="how-it-works" aria-labelledby="how-title">
        <h2 id="how-title" className="section-title">
          How it works
        </h2>
        <div className="content-card prose">
          {tool.content.howItWorks.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="section" id="examples" aria-labelledby="examples-title">
        <h2 id="examples-title" className="section-title">
          Worked examples
        </h2>
        <div className="table-wrap">
          <table className="table">
            <caption>Examples produced by this implementation</caption>
            <thead>
              <tr>
                <th scope="col">Input</th>
                <th scope="col">Output</th>
                <th scope="col">Notes</th>
              </tr>
            </thead>
            <tbody>
              {tool.content.examples.map((example) => (
                <tr key={`${example.input}-${example.output}`}>
                  <td className="mono">{example.input}</td>
                  <td className="mono">{example.output}</td>
                  <td style={{ color: "rgba(255,255,255,0.62)" }}>{example.note ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section" id="reference" aria-labelledby="reference-title">
        <h2 id="reference-title" className="section-title">
          Quick reference
        </h2>
        <div className="table-wrap">
          <table className="table">
            <caption>{detail.reference.caption}</caption>
            <thead>
              <tr>
                {detail.reference.columns.map((column) => (
                  <th key={column} scope="col">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {detail.reference.rows.map((row) => (
                <tr key={row.join("|")}>
                  <th scope="row" className="row-head">
                    {row[0]}
                  </th>
                  {row.slice(1).map((cell, index) => (
                    <td key={`${row[0]}-${index}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section" id="mistakes" aria-labelledby="mistakes-title">
        <h2 id="mistakes-title" className="section-title">
          Common mistakes
        </h2>
        <div className="content-card prose">
          <ul>
            {detail.mistakes.map((mistake) => (
              <li key={mistake}>{mistake}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" id="limits" aria-labelledby="limits-title">
        <h2 id="limits-title" className="section-title">
          Limits and assumptions
        </h2>
        <div className="callout">
          <strong>Stated up front.</strong> {tool.content.limits}
        </div>
        <p style={{ marginTop: 12, textAlign: "center", fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
          Read the{" "}
          <Link href="/about#methodology" style={{ color: "var(--wt-color-accent)" }}>
            methodology
          </Link>{" "}
          for how factors, rounding and tests are handled.
        </p>
      </section>

      <AdSlot
        slot="WEBTOOLS_CONTENT_INLINE_2"
        format="728x90"
        mobileFormat="320x100"
        size="728 × 90"
        mobileSize="320 × 100"
      />

      <section className="section" id="faq" aria-labelledby="faq-title">
        <h2 id="faq-title" className="section-title">
          Frequently asked questions
        </h2>
        <div className="faq-list">
          {faqs.map((faq) => (
            <div key={faq.q} className="faq-card">
              <h3>{faq.q}</h3>
              <p>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <AdSlot
        slot="WEBTOOLS_CONTENT_INLINE_3"
        format="728x90"
        mobileFormat="320x100"
        size="728 × 90"
        mobileSize="320 × 100"
      />

      {toolGuides.length > 0 ? (
        <section className="section" id="guides" aria-labelledby="guides-title">
          <h2 id="guides-title" className="section-title">
            Guides for this tool
          </h2>
          <div className="related-grid">
            {toolGuides.map((guide) => (
              <Link key={guide.slug} href={`/blog/${guide.slug}`} className="related-card">
                <b>{guide.title}</b>
                <span>{guide.description}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {toolGuides.length > 0 ? (
        <AdSlot
          slot="WEBTOOLS_CONTENT_INLINE_4"
          format="728x90"
          mobileFormat="320x100"
          size="728 × 90"
          mobileSize="320 × 100"
        />
      ) : null}

      <section className="section" id="related" aria-labelledby="related-title">
        <h2 id="related-title" className="section-title">
          Related tools
        </h2>
        <ToolCards tools={related} headingLevel={3} />
        <p style={{ marginTop: 22, textAlign: "center" }}>
          <Link href={`/categories/${category.slug}`} className="text-link">
            All tools in {category.name} →
          </Link>
        </p>
      </section>

      {detail.conversions?.length ? (
        <section className="section" id="conversions" aria-labelledby="conversions-title">
          <h2 id="conversions-title" className="section-title">
            Related conversion tables
          </h2>
          <div className="pair-grid">
            {detail.conversions.map((conversion) => (
              <Link key={conversion.href} href={conversion.href} className="pair-link">
                <span>{conversion.label}</span>
                <span className="mono">Table →</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <AdSlot
        slot="WEBTOOLS_CONTENT_INLINE_5"
        format="728x90"
        mobileFormat="320x100"
        size="728 × 90"
        mobileSize="320 × 100"
      />

      <section className="section" id="sources" aria-labelledby="sources-title">
        <h2 id="sources-title" className="section-title">
          Standards and references
        </h2>
        <div className="content-card prose">
          <ul>
            {detail.sources.map((source) => (
              <li key={source.href}>
                <a href={source.href} rel="noopener noreferrer">
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="micro">
            Reviewed{" "}
            {new Date(TOOL_DETAIL_REVIEWED).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              timeZone: "UTC",
            })}
            . If a number is wrong, <Link href="/about#corrections">report it</Link>.
          </p>
        </div>
      </section>

      <JsonLd data={softwareApplicationSchema(tool)} />
      <JsonLd data={faqSchema(faqs)} />
      </div>
    </ContentShell>
  );
}
