import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { AdSlot } from "@/components/ui/AdSlot";
import { guides, guideTopics } from "@/lib/content/guides";
import { buildMetadata } from "@/lib/seo/metadata";
import { itemListSchema } from "@/lib/seo/schema";

export const metadata = buildMetadata({
  title: "Blog — guides, explainers and methodology",
  description:
    "Short, checkable explanations behind the tools: exact conversion factors, SI versus IEC, Base64, JSON rules and how the numbers are tested.",
  path: "/blog",
});

export default function BlogPage() {
  return (
    <div className="page">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Blog", href: "/blog" },
        ]}
      />

      <header style={{ paddingBottom: 22 }}>
        <p className="eyebrow">Blog / {guides.length} guides</p>
        <h1 className="tool-title" style={{ marginTop: 8 }}>
          Blog
        </h1>
        <p className="tool-dek">
          The reasoning behind the tools: where a factor comes from, which standard is in play, and what the
          number cannot tell you.
        </p>
      </header>

      <nav aria-label="Topics" className="tabs" style={{ marginBottom: 24 }}>
        {guideTopics.map((topic) => (
          <Link key={topic} href={`/blog/topics/${topic}`} className="tab">
            {topic}
          </Link>
        ))}
      </nav>

      <div className="index-list">
        {guides.map((guide) => (
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

      <AdSlot slot="WEBTOOLS_HOME_HEADER" format="728x90" mobileFormat="320x100" size="728 × 90" mobileSize="320 × 100" />

      <JsonLd
        data={itemListSchema(
          "Blog — guides and explainers",
          guides.map((guide) => ({ name: guide.title, href: `/blog/${guide.slug}` })),
        )}
      />
    </div>
  );
}
