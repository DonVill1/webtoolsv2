import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { ToolCards } from "@/components/tools/ToolCards";
import { Icon } from "@/components/ui/Icon";
import { categories } from "@/lib/content/categories";
import { liveTools } from "@/lib/content/tools";
import { buildMetadata } from "@/lib/seo/metadata";
import { itemListSchema } from "@/lib/seo/schema";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  return buildMetadata({
    title: "All tools — converters, calculators, developer utilities",
    description:
      "The full index: 26 precise web tools for conversion, calculation, encoding, design, text and network diagnostics. No sign-up and no upload.",
    path: "/tools",
    noindex: query.length > 0,
  });
}

export default async function ToolsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const normalized = query.toLowerCase();

  const results = normalized
    ? liveTools.filter((tool) =>
        [tool.name, tool.seo.description, tool.intent, tool.content.intro]
          .join(" ")
          .toLowerCase()
          .includes(normalized),
      )
    : liveTools;

  return (
    <div className="page">
      <header className="collection-head">
        <h1>All web tools</h1>
        <p>
          {liveTools.length} free tools for conversion, calculation, encoding, design, text and
          network diagnostics. Every result shows its formula and its limits.
        </p>
      </header>

      <form action="/tools" method="get" role="search" className="collection-search">
        <label htmlFor="tool-search" className="visually-hidden">
          Search tools
        </label>
        <div className="search-bar">
          <input
            id="tool-search"
            className="input"
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search tools..."
            autoComplete="off"
          />
          <button className="btn btn-primary" type="submit" aria-label="Search">
            <Icon name="search" size={17} />
          </button>
        </div>
      </form>

      <nav aria-label="Categories" className="filter-tabs">
        <Link
          href="/tools"
          className="filter-pill is-active"
          aria-current={query ? undefined : "page"}
        >
          All
        </Link>
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/categories/${category.slug}`}
            className="filter-pill"
            data-category={category.id}
          >
            <span className="filter-dot" aria-hidden="true" />
            {category.name}
          </Link>
        ))}
      </nav>

      {query ? (
        <p className="results-note">
          {results.length} result{results.length === 1 ? "" : "s"} for “{query}” ·{" "}
          <Link href="/tools" className="text-link">
            Clear
          </Link>
        </p>
      ) : null}

      {query && results.length === 0 ? (
        <div className="callout" style={{ marginTop: 12 }}>
          <strong>Nothing matched.</strong> Try a task (“compress”, “timestamp”, “kg”) rather than an
          exact product name.
        </div>
      ) : (
        <ToolCards tools={results} />
      )}

      <JsonLd
        data={itemListSchema(
          "All tools",
          liveTools.map((tool) => ({ name: tool.name, href: `/tools/${tool.slug}` })),
        )}
      />
    </div>
  );
}
