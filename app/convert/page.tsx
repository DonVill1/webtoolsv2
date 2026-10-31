import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { AdSlot } from "@/components/ui/AdSlot";
import { buildMetadata } from "@/lib/seo/metadata";
import { itemListSchema } from "@/lib/seo/schema";
import { conversionPairs, pairsInCategory, unitCategories } from "@/lib/units/registry";
import { pairHref, pairHeading } from "@/lib/units/pairs";

export const metadata = buildMetadata({
  title: "Unit conversion tables — 12 families, 60 pairs",
  description:
    "Sixty curated conversion tables with exact factors, formulas, worked examples and a pre-set converter. Length, weight, temperature, data, speed and more.",
  path: "/convert",
});

export default function ConvertIndexPage() {
  const featured = conversionPairs.filter((pair) =>
    ["feet-to-inches", "kilograms-to-pounds", "celsius-to-fahrenheit", "megabytes-to-gigabytes", "kilometres-to-miles"].includes(
      pair.slug,
    ),
  );

  return (
    <div className="page">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Convert", href: "/convert" },
        ]}
      />

      <header style={{ paddingBottom: 22 }}>
        <p className="eyebrow">Reference / {unitCategories.length} families / {conversionPairs.length} tables</p>
        <h1 className="tool-title" style={{ marginTop: 8 }}>
          Conversion tables
        </h1>
        <p className="tool-dek">
          Curated pairs, not the full matrix: each table has a pre-set converter, the exact factor, the formula,
          a value table and worked examples. Expand a category to see every unit.
        </p>
      </header>

      <div className="related-grid">
        {unitCategories.map((category) => {
          const pairs = pairsInCategory(category.id);
          return (
            <Link key={category.slug} href={`/convert/${category.slug}`} className="related-card">
              <b>{category.name}</b>
              <span>
                {category.units.length} units · {pairs.length} tables
              </span>
            </Link>
          );
        })}
      </div>

      <section className="section" aria-labelledby="popular">
        <h2 id="popular" className="section-title">
          Most-used tables
        </h2>
        <div className="pair-grid">
          {featured.map((pair) => (
            <Link key={pair.slug} href={pairHref(pair)} className="pair-link">
              <span>{pairHeading(pair)}</span>
              <span className="mono">{pair.from.symbol} → {pair.to.symbol}</span>
            </Link>
          ))}
        </div>
      </section>

      <AdSlot
        slot="WEBTOOLS_HOME_HEADER"
        format="728x90"
        mobileFormat="320x100"
        size="728 × 90"
        mobileSize="320 × 100"
      />

      <section className="section" aria-labelledby="all-families">
        <h2 id="all-families" className="section-title">
          All families
        </h2>
        <div className="table-wrap">
          <table className="table">
            <caption>Unit families and their reference tables</caption>
            <thead>
              <tr>
                <th scope="col">Family</th>
                <th scope="col">Units</th>
                <th scope="col">Tables</th>
                <th scope="col">Base unit</th>
              </tr>
            </thead>
            <tbody>
              {unitCategories.map((category) => (
                <tr key={category.slug}>
                  <td>
                    <Link href={`/convert/${category.slug}`} style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
                      {category.name}
                    </Link>
                  </td>
                  <td className="num">{category.units.length}</td>
                  <td className="num">{pairsInCategory(category.id).length}</td>
                  <td style={{ color: "var(--wt-color-ink-muted)" }}>{category.base}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <JsonLd
        data={itemListSchema(
          "Unit conversion families",
          unitCategories.map((category) => ({
            name: category.name,
            href: `/convert/${category.slug}`,
          })),
        )}
      />
    </div>
  );
}
