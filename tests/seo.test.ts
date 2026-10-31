import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";
import sitemap from "@/app/sitemap";
import { conversionPairs } from "@/lib/units/registry";
import { PAIR_CONTENT_REVIEWED } from "@/lib/units/pair-content";
import { guides, guideTopics } from "@/lib/content/guides";
import { categories } from "@/lib/content/categories";
import { liveTools } from "@/lib/content/tools";
import { buildMetadata } from "@/lib/seo/metadata";
import {
  articleSchema,
  breadcrumbSchema,
  faqSchema,
  softwareApplicationSchema,
  organizationSchema,
} from "@/lib/seo/schema";

describe("sitemap", () => {
  const entries = sitemap();
  const urls = entries.map((entry) => entry.url);

  it("has no duplicate URLs", () => {
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("includes every indexable route family", () => {
    for (const tool of liveTools) expect(urls.some((url) => url.endsWith(`/tools/${tool.slug}`))).toBe(true);
    for (const category of categories) expect(urls.some((url) => url.endsWith(`/categories/${category.id}`))).toBe(true);
    for (const pair of conversionPairs) expect(urls.some((url) => url.endsWith(pair.href))).toBe(true);
    for (const guide of guides) expect(urls.some((url) => url.endsWith(`/blog/${guide.slug}`))).toBe(true);
    for (const topic of guideTopics) expect(urls.some((url) => url.endsWith(`/blog/topics/${topic}`))).toBe(true);
  });

  it("uses absolute HTTPS-style origins and valid dates", () => {
    for (const entry of entries) {
      expect(entry.url.startsWith("http")).toBe(true);
      expect(Number.isNaN(new Date(entry.lastModified ?? 0).getTime())).toBe(false);
      expect(entry.priority).toBeGreaterThanOrEqual(0);
      expect(entry.priority).toBeLessThanOrEqual(1);
    }
  });

  it("uses the reviewed content date for pair pages, not the build time", () => {
    for (const pair of conversionPairs) {
      const entry = entries.find((candidate) => candidate.url.endsWith(pair.href));
      expect(entry, pair.href).toBeDefined();
      expect(new Date(entry!.lastModified!).toISOString().slice(0, 10)).toBe(
        PAIR_CONTENT_REVIEWED,
      );
    }
  });
});

describe("v1 redirects", () => {
  async function redirects() {
    return (await nextConfig.redirects?.()) ?? [];
  }

  it("301s each retired path directly to its live target", async () => {
    const bySource = new Map((await redirects()).map((rule) => [rule.source, rule]));

    expect(bySource.get("/guides")).toMatchObject({ destination: "/blog", statusCode: 301 });
    expect(bySource.get("/guides/topics/:topic")).toMatchObject({
      destination: "/blog/topics/:topic",
      statusCode: 301,
    });
    expect(bySource.get("/guides/:slug")).toMatchObject({
      destination: "/blog/:slug",
      statusCode: 301,
    });
    expect(bySource.get("/test-enhanced-system-info")).toMatchObject({
      destination: "/tools/system-info",
      statusCode: 301,
    });
    expect(bySource.get("/tools/code-formatter")).toMatchObject({
      destination: "/tools/json-validator",
      statusCode: 301,
    });
    expect(bySource.get("/tools/cron-scheduler")).toMatchObject({ destination: "/tools", statusCode: 301 });
  });

  it("does not shadow a live v2 tool, category or guide", async () => {
    const sources = new Set((await redirects()).map((rule) => rule.source));

    expect(sources.has("/blog")).toBe(false);
    for (const tool of liveTools) expect(sources.has(`/tools/${tool.slug}`)).toBe(false);
    for (const category of categories) expect(sources.has(`/categories/${category.slug}`)).toBe(false);
    for (const guide of guides) expect(sources.has(`/blog/${guide.slug}`)).toBe(false);
  });

  it("never redirects to another redirect", async () => {
    const rules = await redirects();
    const sources = new Set(rules.map((rule) => rule.source));

    for (const rule of rules) expect(sources.has(rule.destination)).toBe(false);
  });
});

describe("metadata", () => {
  it("sets an absolute title, canonical and indexable robots", () => {
    const metadata = buildMetadata({
      title: "Example tool — 45 characters of clarity",
      description: "A description that is long enough to be useful but short enough to display in full.",
      path: "/tools/example",
    });
    expect(metadata.title).toEqual({ absolute: "Example tool — 45 characters of clarity" });
    expect(metadata.alternates?.canonical).toMatch(/\/tools\/example$/);
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(metadata.openGraph?.title).toBe("Example tool — 45 characters of clarity");
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
  });

  it("can mark utility pages noindex", () => {
    const metadata = buildMetadata({
      title: "Private page",
      description: "Not for the index; still linked so humans can reach it.",
      path: "/private",
      noindex: true,
    });
    expect(metadata.robots).toMatchObject({ index: false, follow: true });
  });
});

describe("structured data", () => {
  it("emits the organisation and application types search engines expect", () => {
    expect(organizationSchema()["@type"]).toBe("Organization");
    const tool = liveTools[0]!;
    expect(softwareApplicationSchema(tool)).toMatchObject({
      "@type": "SoftwareApplication",
      isAccessibleForFree: true,
    });
    expect(breadcrumbSchema([{ name: "Home", href: "/" }])).toMatchObject({
      "@type": "BreadcrumbList",
    });
    expect(faqSchema(tool.content.faqs)).toMatchObject({ "@type": "FAQPage" });
    const guide = guides[0]!;
    expect(articleSchema(guide)).toMatchObject({ "@type": "Article", headline: guide.title });
  });
});
