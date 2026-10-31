import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ContentShell } from "@/components/layout/ContentShell";
import { Markdown } from "@/components/Markdown";
import { JsonLd } from "@/components/seo/JsonLd";
import { AdSlot } from "@/components/ui/AdSlot";
import { guideBySlug, guides } from "@/lib/content/guides";
import { toolBySlug } from "@/lib/content/tools";
import { buildMetadata } from "@/lib/seo/metadata";
import { articleSchema } from "@/lib/seo/schema";

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = guideBySlug.get(slug);
  if (!guide) return {};
  return buildMetadata({
    title: guide.title,
    description: guide.description,
    path: `/blog/${guide.slug}`,
    type: "article",
    publishedTime: guide.publishedAt,
    modifiedTime: guide.updatedAt,
  });
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guideBySlug.get(slug);
  if (!guide) notFound();

  const related = Array.from(new Set(guide.relatedTools))
    .map((toolSlug) => toolBySlug.get(toolSlug))
    .filter((tool): tool is NonNullable<typeof tool> => Boolean(tool));

  return (
    <ContentShell>
      <div className="page narrow">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Blog", href: "/blog" },
          { name: guide.title, href: `/blog/${guide.slug}` },
        ]}
      />

      <article>
        <header style={{ paddingBottom: 22 }}>
          <p className="eyebrow">
            <Link href={`/blog/topics/${guide.topic}`} style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
              {guide.topic}
            </Link>{" "}
            / {guide.readingMinutes} min read
          </p>
          <h1 className="tool-title" style={{ marginTop: 8 }}>
            {guide.title}
          </h1>
          <p className="tool-dek">{guide.description}</p>
          <p className="micro" style={{ marginTop: 12 }}>
            Published {formatDate(guide.publishedAt)} · Updated {formatDate(guide.updatedAt)}
          </p>
        </header>

        <Markdown source={guide.body} />

        <AdSlot
          slot="WEBTOOLS_CONTENT_INLINE"
          format="728x90"
          mobileFormat="320x100"
          size="728 × 90"
          mobileSize="320 × 100"
        />

        <section className="section" aria-labelledby="tools-in-this-guide">
          <h2 id="tools-in-this-guide" className="section-title">
            Tools used in this guide
          </h2>
          <div className="related-grid">
            {related.map((tool) => (
              <Link key={tool.slug} href={`/tools/${tool.slug}`} className="related-card">
                <b>{tool.name}</b>
                <span>{tool.seo.description}</span>
              </Link>
            ))}
          </div>
        </section>
      </article>

      <JsonLd data={articleSchema(guide)} />
      </div>
    </ContentShell>
  );
}
