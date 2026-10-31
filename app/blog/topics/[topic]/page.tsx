import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { guidesForTopic, guideTopics, guideTopicMeta } from "@/lib/content/guides";
import { toolBySlug } from "@/lib/content/tools";
import { buildMetadata } from "@/lib/seo/metadata";

export function generateStaticParams() {
  return guideTopics.map((topic) => ({ topic }));
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const { topic } = await params;
  const meta = guideTopicMeta[topic];
  if (!meta) return {};
  return buildMetadata({
    title: `${meta.label} guides and explainers`,
    description: `${meta.label} guides from the reference: standards, limits and failure modes behind the tools, written so the claims can be checked.`,
    path: `/blog/topics/${topic}`,
  });
}

export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const meta = guideTopicMeta[topic];
  if (!meta) notFound();
  const items = guidesForTopic(topic);
  const tools = Array.from(new Set(items.flatMap((guide) => guide.relatedTools)))
    .map((slug) => toolBySlug.get(slug))
    .filter((tool): tool is NonNullable<typeof tool> => Boolean(tool));

  return (
    <div className="page narrow">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Blog", href: "/blog" },
          { name: meta.label, href: `/blog/topics/${topic}` },
        ]}
      />

      <header style={{ paddingBottom: 22 }}>
        <p className="eyebrow">Topic / {items.length} guides</p>
        <h1 className="tool-title" style={{ marginTop: 8 }}>
          {meta.label}
        </h1>
        <p className="tool-dek">{meta.intro}</p>
      </header>

      <div className="index-list">
        {items.map((guide) => (
          <Link key={guide.slug} href={`/blog/${guide.slug}`} className="index-row">
            <span className="index-code">{guide.readingMinutes} min</span>
            <span className="index-name">{guide.title}</span>
            <span className="index-desc">{guide.description}</span>
            <span className="index-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </div>

      {tools.length > 0 ? (
        <section style={{ marginTop: 32 }}>
          <h2 className="section-title">Tools used in these guides</h2>
          <div className="pair-grid">
            {tools.map((tool) => (
              <Link key={tool.slug} href={`/tools/${tool.slug}`} className="pair-link">
                <span>{tool.name}</span>
                <span className="mono" aria-hidden="true">
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <p style={{ marginTop: 24 }}>
        <Link href="/blog" className="micro">
          All guides →
        </Link>
      </p>
    </div>
  );
}
