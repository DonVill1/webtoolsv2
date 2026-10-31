import { categories } from "@/lib/content/categories";
import { liveTools } from "@/lib/content/tools";
import { guides } from "@/lib/content/guides";
import { conversionPairs, unitCategories } from "@/lib/units/registry";
import { pairHref, pairHeading } from "@/lib/units/pairs";
import { absoluteUrl, siteName } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const lines: string[] = [
    `# ${siteName}`,
    "",
    "Precise, private web tools. Every tool page states its formula, its rounding rule and its limits.",
    `Sitemap: ${absoluteUrl("/sitemap.xml")}`,
    "",
    "## Tools",
    "",
  ];

  for (const tool of liveTools) {
    lines.push(`- [${tool.name}](${absoluteUrl(`/tools/${tool.slug}`)}): ${tool.seo.description}`);
  }

  lines.push("", "## Unit families", "");
  for (const category of unitCategories) {
    lines.push(
      `- [${category.name}](${absoluteUrl(`/convert/${category.slug}`)}): ${category.intro} (${category.units.length} units)`,
    );
  }

  lines.push("", "## Selected conversion tables", "");
  for (const pair of conversionPairs.slice(0, 24)) {
    lines.push(`- [${pairHeading(pair)}](${absoluteUrl(pairHref(pair))})`);
  }

  lines.push("", "## Blog", "");
  for (const guide of guides) {
    lines.push(`- [${guide.title}](${absoluteUrl(`/blog/${guide.slug}`)}): ${guide.description}`);
  }

  lines.push("", "## Categories", "");
  for (const category of categories) {
    lines.push(`- [${category.name}](${absoluteUrl(`/categories/${category.slug}`)}): ${category.intro}`);
  }

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
