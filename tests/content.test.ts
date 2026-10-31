import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { categories } from "@/lib/content/categories";
import { guideBySlug, guides, guideTopics, guideTopicMeta } from "@/lib/content/guides";
import { TOOL_DETAIL_REVIEWED, toolDetails } from "@/lib/content/tool-details";
import { relatedTools, toolBySlug, tools, validateTools } from "@/lib/content/tools";
import { conversionPairs, pairBySlug, unitCategories } from "@/lib/units/registry";
import { pairDescription, pairHeading, pairTitle } from "@/lib/units/pairs";
import { hasUnitGrammar, unitMany, unitOne, withUnitArticle } from "@/lib/units/grammar";
import {
  PAIR_CONTENT_REVIEWED,
  categoryContent,
  pairDerivation,
  pairFaqs,
  pairGuide,
  pairQuickAnswer,
  unitExplanation,
} from "@/lib/units/pair-content";
import { textFormats } from "@/lib/tools/text-formats";

describe("tool content contract", () => {
  it("passes every structural validation rule", () => {
    expect(validateTools()).toEqual([]);
  });

  it("ships a live, fully-written page for every tool", () => {
    expect(tools.length).toBeGreaterThanOrEqual(26);
    for (const tool of tools) {
      expect(tool.status).toBe("live");
      expect(tool.content.intro.length).toBeGreaterThan(80);
      expect(tool.content.limits.length).toBeGreaterThan(40);
      expect(tool.content.faqs.length).toBeGreaterThanOrEqual(3);
      expect(tool.seo.description.length).toBeGreaterThanOrEqual(110);
      expect(tool.seo.description.length).toBeLessThanOrEqual(160);
      expect(new Date(tool.updated).getTime()).toBeGreaterThanOrEqual(new Date(tool.added).getTime());
    }
  });

  it("gives every tool a direct answer, reference table, mistakes, sources and two extra FAQs", () => {
    expect(Object.keys(toolDetails).sort()).toEqual(tools.map((tool) => tool.slug).sort());
    expect(TOOL_DETAIL_REVIEWED).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const answers = new Set<string>();
    for (const tool of tools) {
      const detail = toolDetails[tool.slug]!;
      expect(detail.answer.length, tool.slug).toBeGreaterThan(120);
      expect(detail.answer).not.toContain("undefined");
      answers.add(detail.answer);

      expect(detail.reference.caption.length, tool.slug).toBeGreaterThan(8);
      expect(detail.reference.columns.length, tool.slug).toBeGreaterThanOrEqual(2);
      expect(detail.reference.columns.length, tool.slug).toBeLessThanOrEqual(4);
      expect(detail.reference.rows.length, tool.slug).toBeGreaterThanOrEqual(4);
      for (const row of detail.reference.rows) {
        expect(row.length, `${tool.slug}: ${row[0]}`).toBe(detail.reference.columns.length);
        expect(row.every((cell) => cell.trim().length > 0), `${tool.slug}: ${row[0]}`).toBe(true);
      }
      expect(new Set(detail.reference.rows.map((row) => row[0])).size, tool.slug).toBe(
        detail.reference.rows.length,
      );

      expect(detail.mistakes.length, tool.slug).toBeGreaterThanOrEqual(2);
      for (const mistake of detail.mistakes) {
        expect(mistake.length, `${tool.slug}: mistake`).toBeGreaterThan(60);
      }

      expect(detail.sources.length, tool.slug).toBeGreaterThanOrEqual(1);
      for (const source of detail.sources) {
        expect(source.href, tool.slug).toMatch(/^https:\/\//);
        expect(source.label.length, tool.slug).toBeGreaterThan(8);
      }

      for (const conversion of detail.conversions ?? []) {
        expect(conversion.href, `${tool.slug}: ${conversion.href}`).toMatch(/^\/convert\//);
        expect(
          conversionPairs.some((pair) => pair.href === conversion.href),
          `${tool.slug}: ${conversion.href}`,
        ).toBe(true);
      }

      expect(detail.extraFaqs.length, tool.slug).toBe(2);
      const faqs = [...tool.content.faqs, ...detail.extraFaqs];
      expect(faqs.length, tool.slug).toBe(5);
      expect(new Set(faqs.map((faq) => faq.q)).size, tool.slug).toBe(faqs.length);
      for (const faq of faqs) {
        expect(faq.q.endsWith("?"), `${tool.slug}: ${faq.q}`).toBe(true);
        expect(faq.a.length, `${tool.slug}: ${faq.q}`).toBeGreaterThan(60);
      }
    }

    expect(answers.size).toBe(tools.length);
  });

  it("ships a distinct v1-style icon for every live tool", () => {
    for (const tool of tools) {
      const file = resolve(process.cwd(), "public/tool-icons", `${tool.slug}.svg`);
      expect(existsSync(file), `missing icon: ${tool.slug}`).toBe(true);
      const svg = readFileSync(file, "utf8");
      expect(svg).toContain("<svg");
      expect(svg).toContain('viewBox="0 0 512 512"');
    }
  });

  it("has an island implementation for every live tool", () => {
    const source = readFileSync(resolve(process.cwd(), "components/tools/ToolIsland.tsx"), "utf8");
    const registered = new Set(
      Array.from(source.matchAll(/"([a-z0-9-]+)":\s*dynamic/g), (match) => match[1]),
    );
    for (const tool of tools) {
      expect(registered.has(tool.slug), `missing island: ${tool.slug}`).toBe(true);
    }
    expect(registered.size).toBe(tools.length);
  });

  it("keeps every related-tool link resolvable", () => {
    for (const tool of tools) {
      expect(relatedTools(tool).length, `${tool.slug} has no related tools`).toBeGreaterThanOrEqual(2);
      for (const related of tool.related) {
        expect(toolBySlug.has(related), `${tool.slug} → ${related}`).toBe(true);
        expect(related).not.toBe(tool.slug);
      }
    }
  });

  it("gives every category at least two live tools", () => {
    for (const category of categories) {
      const count = tools.filter((tool) => tool.category === category.id).length;
      expect(count, category.id).toBeGreaterThanOrEqual(2);
    }
  });

  it("keeps guides substantive and linked to real tools", () => {
    expect(guides.length).toBeGreaterThanOrEqual(5);
    expect(new Set(guides.map((guide) => guide.slug)).size).toBe(guides.length);
    for (const topic of guideTopics) {
      expect(guideTopicMeta[topic], `missing topic meta: ${topic}`).toBeDefined();
      expect(guideTopicMeta[topic]!.intro.length).toBeGreaterThan(120);
    }
    for (const guide of guides) {
      expect(guideBySlug.get(guide.slug)).toBe(guide);
      expect(guide.body.length).toBeGreaterThan(800);
      expect(guide.readingMinutes).toBeGreaterThan(1);
      expect(guideTopics).toContain(guide.topic);
      for (const slug of guide.relatedTools) {
        expect(toolBySlug.has(slug), `${guide.slug} → ${slug}`).toBe(true);
      }
    }
  });

  it("keeps converter formats in sync with the tool registry", () => {
    expect(textFormats).toContain("json");
    expect(textFormats).toContain("yaml");
    expect(toolBySlug.has("text-converter")).toBe(true);
  });

  it("has explicit singular and plural grammar for every paired unit", () => {
    for (const pair of conversionPairs) {
      expect(hasUnitGrammar(pair.from), `${pair.slug}: ${pair.from.id}`).toBe(true);
      expect(hasUnitGrammar(pair.to), `${pair.slug}: ${pair.to.id}`).toBe(true);
    }
    expect(unitOne(conversionPairs[0]!.from)).toBe("foot");
    expect(unitMany(conversionPairs[0]!.from)).toBe("feet");
    expect(withUnitArticle(conversionPairs[0]!.from)).toBe("a foot");
    expect(withUnitArticle(conversionPairs[0]!.to)).toBe("an inch");
  });

  it("never writes one feet, one inches or one celsius on a pair page", () => {
    for (const pair of conversionPairs) {
      const faqs = pairFaqs(pair);
      const questions = faqs.map((faq) => `${faq.q} ${faq.a}`).join(" ");
      expect(questions).not.toMatch(/\bone (feet|inches|celsius|fahrenheit|kelvins?)\b/i);
      expect(questions).not.toMatch(/\ban (feet|inches|metres?|kilograms?)\b/i);
      expect(questions).not.toContain("undefined");

      if (pair.category.id !== "temperature") {
        expect(faqs[0]!.q).toBe(
          `How many ${unitMany(pair.to)} are in one ${unitOne(pair.from)}?`,
        );
        expect(faqs[1]!.q).toBe(
          `How many ${unitMany(pair.from)} are in one ${unitOne(pair.to)}?`,
        );
      }
    }
  });

  it("gives every conversion pair a distinct answer, five FAQs and a guide", () => {
    const answers = new Set<string>();
    for (const pair of conversionPairs) {
      const quick = pairQuickAnswer(pair);
      const faqs = pairFaqs(pair);
      expect(quick.value.length, pair.slug).toBeGreaterThan(12);
      expect(quick.detail.length, pair.slug).toBeGreaterThan(40);
      expect(faqs.length, pair.slug).toBe(5);
      for (const faq of faqs) {
        expect(faq.a.length, `${pair.slug}: ${faq.q}`).toBeGreaterThan(60);
        expect(faq.q.endsWith("?"), `${pair.slug}: ${faq.q}`).toBe(true);
      }
      expect(new Set(faqs.map((faq) => faq.q)).size).toBe(faqs.length);
      expect(pairDerivation(pair)).not.toContain("undefined");
      expect(pairGuide(pair), pair.slug).toBeDefined();
      expect(unitExplanation(pair.from.id), pair.slug).toBeTruthy();
      expect(unitExplanation(pair.to.id), pair.slug).toBeTruthy();
      answers.add(quick.value);
    }
    expect(answers.size).toBe(conversionPairs.length);
  });

  it("keeps proper nouns and US labels intact in pair headings", () => {
    expect(pairHeading(pairBySlug.get("celsius-to-fahrenheit")!)).toBe("Celsius to Fahrenheit");
    expect(pairHeading(pairBySlug.get("gallons-us-to-litres")!)).toBe("US gallons to litres");
    expect(pairHeading(pairBySlug.get("feet-to-inches")!)).toBe("Feet to inches");
    expect(pairHeading(pairBySlug.get("kilowatt-hours-to-btu")!)).toBe(
      "Kilowatt-hours to British thermal units",
    );
  });

  it("keeps generated pair titles and descriptions inside search limits", () => {
    for (const pair of conversionPairs) {
      const title = pairTitle(pair);
      const description = pairDescription(pair);
      expect(title.length, `${pair.slug}: ${title}`).toBeLessThanOrEqual(60);
      expect(description.length, `${pair.slug}: ${description}`).toBeLessThanOrEqual(160);
      expect(description).not.toMatch(/\b1 (feet|inches|ounces|kelvins|US gallons?)\b/i);
    }
  });

  it("keeps every conversion family's explanatory copy complete", () => {
    expect(PAIR_CONTENT_REVIEWED).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    for (const category of unitCategories) {
      const copy = categoryContent(category.id);
      expect(copy.measures.length, category.id).toBeGreaterThan(100);
      expect(copy.uses.length, category.id).toBeGreaterThan(80);
      expect(copy.precision.length, category.id).toBeGreaterThan(100);
      expect(copy.mistake.title.length, category.id).toBeGreaterThan(10);
      expect(copy.mistake.body.length, category.id).toBeGreaterThan(100);
      expect(category.basePlural.length, category.id).toBeGreaterThan(2);
    }
  });
});
