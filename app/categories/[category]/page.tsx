import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { ToolCards } from "@/components/tools/ToolCards";
import { AdSlot } from "@/components/ui/AdSlot";
import { categories, categoryById } from "@/lib/content/categories";
import { toolsInCategory } from "@/lib/content/tools";
import type { ToolCategoryId } from "@/lib/content/types";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, itemListSchema } from "@/lib/seo/schema";

function isCategory(value: string): value is ToolCategoryId {
  return categories.some((category) => category.slug === value);
}

/** "Developer tools" already names the category; don't render "tools tools". */
function categoryHeading(name: string): string {
  return name.toLowerCase().endsWith("tools") ? name : `${name} tools`;
}

export function generateStaticParams() {
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  if (!isCategory(slug)) return {};
  const category = categoryById.get(slug);
  if (!category) return {};

  return buildMetadata({
    title: `${categoryHeading(category.name)} — free and precise`,
    description: category.description,
    path: `/categories/${category.slug}`,
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  if (!isCategory(slug)) notFound();
  const category = categoryById.get(slug);
  if (!category) notFound();

  const items = toolsInCategory(category.id);
  const others = categories.filter((entry) => entry.slug !== category.slug);

  return (
    <div className="page">
      <header className="collection-head">
        <h1>{categoryHeading(category.name)}</h1>
        <p>{category.intro}</p>
      </header>

      <nav aria-label="Categories" className="filter-tabs">
        <Link href="/tools" className="filter-pill">
          All
        </Link>
        {categories.map((entry) => (
          <Link
            key={entry.slug}
            href={`/categories/${entry.slug}`}
            className={`filter-pill${entry.slug === category.slug ? " is-active" : ""}`}
            aria-current={entry.slug === category.slug ? "page" : undefined}
            data-category={entry.id}
          >
            <span className="filter-dot" aria-hidden="true" />
            {entry.name}
          </Link>
        ))}
      </nav>

      <ToolCards tools={items} />

      <AdSlot
        slot="WEBTOOLS_HOME_HEADER"
        format="728x90"
        mobileFormat="320x100"
        size="728 × 90"
        mobileSize="320 × 100"
      />

      <section className="section" aria-labelledby="other-categories">
        <h2 id="other-categories" className="section-title">
          Other categories
        </h2>
        <p className="section-kicker">Keep browsing by task.</p>
        <div className="related-grid">
          {others.map((entry) => (
            <Link key={entry.slug} href={`/categories/${entry.slug}`} className="related-card">
              <b>{entry.name}</b>
              <span>{entry.intro}</span>
            </Link>
          ))}
        </div>
      </section>

      <JsonLd
        data={itemListSchema(
          `${category.name} tools`,
          items.map((tool) => ({ name: tool.name, href: `/tools/${tool.slug}` })),
        )}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", href: "/" },
          { name: "Tools", href: "/tools" },
          { name: category.name, href: `/categories/${category.slug}` },
        ])}
      />
    </div>
  );
}
