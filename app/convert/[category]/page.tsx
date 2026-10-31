import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ContentShell } from "@/components/layout/ContentShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { AdSlot } from "@/components/ui/AdSlot";
import { buildMetadata } from "@/lib/seo/metadata";
import { itemListSchema } from "@/lib/seo/schema";
import {
  categoryBySlug,
  formatNumber,
  pairsInCategory,
  unitCategories,
  type UnitCategory,
} from "@/lib/units/registry";
import { pairHref, pairHeading } from "@/lib/units/pairs";
import { categoryContent } from "@/lib/units/pair-content";

export function generateStaticParams() {
  return unitCategories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = categoryBySlug.get(slug);
  if (!category) return {};

  return buildMetadata({
    title: `${category.name} conversions — every unit and table`,
    description: `Convert ${category.name.toLowerCase()} with exact factors and a full reference table. ${category.units.length} units, ${pairsInCategory(category.id).length} curated pair pages, formulas and limits shown.`,
    path: `/convert/${category.slug}`,
  });
}

export default async function ConvertCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category: UnitCategory | undefined = categoryBySlug.get(slug);
  if (!category) notFound();

  const pairs = pairsInCategory(category.id);
  const others = unitCategories.filter((entry) => entry.slug !== category.slug);
  const copy = categoryContent(category.id);

  return (
    <ContentShell>
      <div className="page">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Convert", href: "/convert" },
          { name: category.name, href: `/convert/${category.slug}` },
        ]}
      />

      <header style={{ paddingBottom: 22 }}>
        <p className="eyebrow">
          Conversion / {category.units.length} units / {pairs.length} tables
        </p>
        <h1 className="tool-title" style={{ marginTop: 8 }}>
          {category.name} conversions
        </h1>
        <p className="tool-dek">{category.intro}</p>
        <p style={{ marginTop: 12 }}>
          <Link className="btn btn-sm" href={`/tools/unit-converter?category=${category.slug}`}>
            Open the {category.name.toLowerCase()} converter
          </Link>
        </p>
      </header>

      <section className="section" aria-labelledby="about-family">
        <h2 id="about-family" className="section-title">
          What these units measure
        </h2>
        <div className="prose">
          <p>{copy.measures}</p>
          <p>{copy.uses}</p>
          <p>{copy.precision}</p>
        </div>
        <div className="callout" style={{ marginTop: 14 }}>
          <strong>{copy.mistake.title}.</strong> {copy.mistake.body}
        </div>
      </section>

      <section aria-labelledby="tables">
        <h2 id="tables" className="section-title">
          Reference tables
        </h2>
        <div className="pair-grid">
          {pairs.map((pair) => (
            <Link key={pair.slug} href={pairHref(pair)} className="pair-link">
              <span>{pairHeading(pair)}</span>
              <span className="mono">
                {pair.from.symbol} → {pair.to.symbol}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <AdSlot
        slot="WEBTOOLS_CONTENT_INLINE"
        format="728x90"
        mobileFormat="320x100"
        size="728 × 90"
        mobileSize="320 × 100"
      />

      <section className="section" aria-labelledby="units">
        <h2 id="units" className="section-title">
          All {category.name.toLowerCase()} units
        </h2>
        <div className="table-wrap">
          <table className="table">
            <caption>Every unit in this family and its factor in {category.basePlural}</caption>
            <thead>
              <tr>
                <th scope="col">Unit</th>
                <th scope="col">Symbol</th>
                <th scope="col" className="num">
                  1 unit in {category.basePlural}
                </th>
              </tr>
            </thead>
            <tbody>
              {category.units.map((unit) => (
                <tr key={unit.id}>
                  <td>{unit.name}</td>
                  <td className="mono">{unit.symbol}</td>
                  <td className="num">{formatNumber(unit.toBase(1), 8)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {category.id === "data" ? (
          <div className="callout" style={{ marginTop: 14 }}>
            <strong>Two standards, two sets of units.</strong> SI decimal units (kB, MB, GB) use powers of 1,000.
            IEC binary units (KiB, MiB, GiB) use powers of 1,024. Most operating systems display binary sizes under
            the decimal label, which is why a “1 TB” drive shows about 931 GiB.
          </div>
        ) : null}
      </section>

      <section className="section" aria-labelledby="other-families">
        <h2 id="other-families" className="section-title">
          Other families
        </h2>
        <div className="related-grid">
          {others.map((entry) => (
            <Link key={entry.slug} href={`/convert/${entry.slug}`} className="related-card">
              <b>{entry.name}</b>
              <span>{entry.units.length} units</span>
            </Link>
          ))}
        </div>
      </section>

      <JsonLd
        data={itemListSchema(
          `${category.name} conversion tables`,
          pairs.map((pair) => ({ name: pairHeading(pair), href: pairHref(pair) })),
        )}
      />
      </div>
    </ContentShell>
  );
}
