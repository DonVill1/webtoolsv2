import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ContentShell } from "@/components/layout/ContentShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { PairConverter } from "@/components/tools/pair-converter";
import { AdSlot } from "@/components/ui/AdSlot";
import { buildMetadata } from "@/lib/seo/metadata";
import { conversionApplicationSchema, faqSchema } from "@/lib/seo/schema";
import {
  categoryBySlug,
  conversionPairs,
  conversionTable,
  convertUnit,
  formatNumber,
  formulaFor,
  pairBySlug,
  pairsInCategory,
  reversePair,
} from "@/lib/units/registry";
import { unitMany, unitOne, withUnitArticle } from "@/lib/units/grammar";
import {
  PAIR_CONTENT_REVIEWED,
  categoryContent,
  pairDerivation,
  pairFaqs,
  pairGuide,
  pairQuickAnswer,
  unitExplanation,
} from "@/lib/units/pair-content";
import { pairDescription, pairHeading, pairHref, pairTitle } from "@/lib/units/pairs";

export function generateStaticParams() {
  return conversionPairs.map((pair) => ({
    category: pair.category.slug,
    pair: pair.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; pair: string }>;
}): Promise<Metadata> {
  const { category: categorySlug, pair: pairSlugValue } = await params;
  const category = categoryBySlug.get(categorySlug);
  const pair = pairBySlug.get(pairSlugValue);
  if (!category || !pair || pair.category.id !== category.id) return {};

  return buildMetadata({
    title: pairTitle(pair),
    description: pairDescription(pair),
    path: pairHref(pair),
    modifiedTime: PAIR_CONTENT_REVIEWED,
  });
}

export default async function ConversionPairPage({
  params,
}: {
  params: Promise<{ category: string; pair: string }>;
}) {
  const { category: categorySlug, pair: pairSlugValue } = await params;
  const category = categoryBySlug.get(categorySlug);
  const pair = pairBySlug.get(pairSlugValue);
  if (!category || !pair || pair.category.id !== category.id) notFound();

  const rows = conversionTable(pair);
  const reverse = reversePair(pair);
  const siblings = pairsInCategory(category.id)
    .filter((entry) => entry.slug !== pair.slug)
    .slice(0, 6);
  const heading = pairHeading(pair);
  const faqs = pairFaqs(pair);
  const quick = pairQuickAnswer(pair);
  const copy = categoryContent(category.id);
  const guide = pairGuide(pair);
  const fromOne = unitOne(pair.from);
  const fromMany = unitMany(pair.from);
  const toOne = unitOne(pair.to);
  const toMany = unitMany(pair.to);

  return (
    <ContentShell>
      <div className="page">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Convert", href: "/convert" },
          { name: category.name, href: `/convert/${category.slug}` },
          { name: heading, href: pairHref(pair) },
        ]}
      />

      <header style={{ paddingBottom: 20 }}>
        <p className="eyebrow">
          {category.name} / {pair.from.symbol} → {pair.to.symbol}
        </p>
        <h1 className="tool-title" style={{ marginTop: 8 }}>
          {heading} converter
        </h1>
        <p className="tool-dek">
          Convert {fromMany} to {toMany} with the exact factor, the reverse answer, a full
          reference table and the arithmetic behind it. Pre-set to 1 {pair.from.symbol}; change
          the value to convert anything.
        </p>
      </header>

      <div className="callout" style={{ marginBottom: 18 }}>
        <strong>{quick.value}.</strong> {quick.detail}
      </div>

      <PairConverter
        category={category.id}
        fromId={pair.from.id}
        toId={pair.to.id}
        fromSymbol={pair.from.symbol}
        toSymbol={pair.to.symbol}
        fromName={pair.from.name}
        toName={pair.to.name}
        formula={formulaFor(pair)}
      />

      <AdSlot
        slot="WEBTOOLS_CONTENT_INLINE"
        format="728x90"
        mobileFormat="320x100"
        size="728 × 90"
        mobileSize="320 × 100"
      />

      <section className="section" aria-labelledby="answer-title">
        <h2 id="answer-title" className="section-title">
          {faqs[0]?.q}
        </h2>
        <div className="prose">
          <p>{faqs[0]?.a}</p>
          <p>{pairDerivation(pair)}</p>
        </div>
      </section>

      <section className="section" aria-labelledby="table-title">
        <h2 id="table-title" className="section-title">
          {heading} table
        </h2>
        <div className="table-wrap">
          <table className="table">
            <caption>
              {fromMany} to {toMany}
            </caption>
            <thead>
              <tr>
                <th scope="col">
                  {pair.from.name} ({pair.from.symbol})
                </th>
                <th scope="col" className="num">
                  {pair.to.name} ({pair.to.symbol})
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.input}>
                  <td className="num">{formatNumber(row.input, 8)}</td>
                  <td className="num">{formatNumber(row.output, 8)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section" aria-labelledby="formula-title">
        <h2 id="formula-title" className="section-title">
          Formula and worked examples
        </h2>
        <div className="prose">
          <p>
            <strong>{formulaFor(pair)}.</strong>{" "}
            {category.id === "temperature"
              ? "Temperature conversions are affine, not multiplicative, so the offset is part of the formula rather than a separate step."
              : `The pair factor is ${formatNumber(
                  convertUnit(category.id, 1, pair.from.id, pair.to.id),
                  10,
                )}. Multiplying by that factor is the whole conversion for this pair.`}
          </p>
          {category.id === "temperature" ? (
            <p>
              Celsius is the base for this family. Fahrenheit applies an offset of 32 and a
              5/9 scale, while Kelvin is Celsius plus 273.15. The converter maps the source to
              Celsius, then to the target, so the offset is never skipped.
            </p>
          ) : (
            <p>
              One {fromOne} is also {formatNumber(pair.from.toBase(1), 10)}{" "}
              {category.basePlural}, and one {toOne} is {formatNumber(pair.to.toBase(1), 10)}{" "}
              {category.basePlural}. The converter uses those definitions directly rather than a
              chain of rounded factors.
            </p>
          )}
        </div>
        <div className="table-wrap" style={{ marginTop: 14 }}>
          <table className="table">
            <caption>Worked examples</caption>
            <thead>
              <tr>
                <th scope="col">Input</th>
                <th scope="col" className="num">
                  Output
                </th>
              </tr>
            </thead>
            <tbody>
              {[2, 5, 10].map((value) => (
                <tr key={value}>
                  <td className="num">
                    {formatNumber(value, 8)} {pair.from.symbol}
                  </td>
                  <td className="num">
                    {formatNumber(
                      convertUnit(category.id, value, pair.from.id, pair.to.id),
                      8,
                    )}{" "}
                    {pair.to.symbol}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section" aria-labelledby="units-title">
        <h2 id="units-title" className="section-title">
          What {withUnitArticle(pair.from)} and {withUnitArticle(pair.to)} measure
        </h2>
        <div className="prose">
          <p>{unitExplanation(pair.from.id) ?? copy.measures}</p>
          <p>{unitExplanation(pair.to.id) ?? copy.measures}</p>
          <p>
            {copy.measures} {copy.uses}
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="accuracy-title">
        <h2 id="accuracy-title" className="section-title">
          Accuracy and the common mistake
        </h2>
        <div className="prose">
          <p>{copy.precision}</p>
        </div>
        <div className="callout" style={{ marginTop: 14 }}>
          <strong>{copy.mistake.title}.</strong> {copy.mistake.body}
        </div>
      </section>

      {guide ? (
        <section className="section" aria-labelledby="guide-title">
          <h2 id="guide-title" className="section-title">
            Go deeper
          </h2>
          <div className="callout">
            <strong>
              <Link href={`/blog/${guide.slug}`}>{guide.title}</Link>
            </strong>{" "}
            {guide.description}
          </div>
        </section>
      ) : null}

      <section className="section" aria-labelledby="faq-title">
        <h2 id="faq-title" className="section-title">
          Frequently asked questions
        </h2>
        <div className="faq">
          {faqs.slice(1).map((faq) => (
            <details key={faq.q}>
              <summary>
                <span>{faq.q}</span>
              </summary>
              <div className="faq-answer">{faq.a}</div>
            </details>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="related-title">
        <h2 id="related-title" className="section-title">
          Related conversions
        </h2>
        <div className="pair-grid">
          {siblings.map((entry) => (
            <Link key={entry.slug} href={pairHref(entry)} className="pair-link">
              <span>{pairHeading(entry)}</span>
              <span className="mono">
                {entry.from.symbol} → {entry.to.symbol}
              </span>
            </Link>
          ))}
        </div>
        <p style={{ marginTop: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
          {reverse ? (
            <Link href={pairHref(reverse)} className="micro">
              Reverse: {pairHeading(reverse)} →
            </Link>
          ) : (
            <Link
              href={`/tools/unit-converter?category=${category.slug}&from=${pair.to.id}&to=${pair.from.id}`}
              className="micro"
            >
              Reverse in the converter →
            </Link>
          )}
          <Link
            href={`/tools/unit-converter?category=${category.slug}&from=${pair.from.id}&to=${pair.to.id}`}
            className="micro"
          >
            Open in the full unit converter →
          </Link>
          <Link href={`/convert/${category.slug}`} className="micro">
            All {category.name.toLowerCase()} tables →
          </Link>
          <Link href="/blog/how-we-test-conversions" className="micro">
            How these numbers are tested →
          </Link>
        </p>
        <p className="micro" style={{ marginTop: 14 }}>
          Reviewed {new Date(PAIR_CONTENT_REVIEWED).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: "UTC",
          })}
          . Factors follow the{" "}
          <a
            href="https://www.bipm.org/en/publications/si-brochure"
            rel="noopener noreferrer"
          >
            SI Brochure (BIPM)
          </a>{" "}
          and{" "}
          <a
            href="https://www.nist.gov/pml/special-publication-811"
            rel="noopener noreferrer"
          >
            NIST SP 811
          </a>
          . If a number is wrong, <Link href="/about#corrections">report it</Link>.
        </p>
      </section>

      <JsonLd
        data={conversionApplicationSchema({
          name: `${heading} converter`,
          description: pairDescription(pair),
          href: pairHref(pair),
          category: category.name,
          dateModified: PAIR_CONTENT_REVIEWED,
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
      </div>
    </ContentShell>
  );
}
