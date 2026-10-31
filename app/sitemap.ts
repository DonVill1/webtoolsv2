import type { MetadataRoute } from "next";
import { categories } from "@/lib/content/categories";
import { liveTools } from "@/lib/content/tools";
import { guides, guideTopics } from "@/lib/content/guides";
import { conversionPairs, unitCategories } from "@/lib/units/registry";
import { pairHref } from "@/lib/units/pairs";
import { PAIR_CONTENT_REVIEWED } from "@/lib/units/pair-content";
import { absoluteUrl } from "@/lib/site";

const LEGAL_REVIEWED = "2026-10-27";

export default function sitemap(): MetadataRoute.Sitemap {
  const pairReviewed = new Date(PAIR_CONTENT_REVIEWED);
  const legalReviewed = new Date(LEGAL_REVIEWED);
  const latestTool = new Date(
    Math.max(...liveTools.map((tool) => new Date(tool.updated).getTime())),
  );
  const latestGuide = new Date(
    Math.max(...guides.map((guide) => new Date(guide.updatedAt).getTime())),
  );
  const latestSite = new Date(
    Math.max(latestTool.getTime(), latestGuide.getTime(), pairReviewed.getTime()),
  );
  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: latestSite, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/tools"), lastModified: latestTool, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/convert"), lastModified: pairReviewed, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/blog"), lastModified: latestGuide, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/about"), lastModified: legalReviewed, changeFrequency: "yearly", priority: 0.4 },
    { url: absoluteUrl("/privacy"), lastModified: legalReviewed, changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/terms"), lastModified: legalReviewed, changeFrequency: "yearly", priority: 0.3 },
  ];

  for (const category of categories) {
    const categoryTools = liveTools.filter((tool) => tool.category === category.id);
    const latest = categoryTools.length
      ? new Date(Math.max(...categoryTools.map((tool) => new Date(tool.updated).getTime())))
      : latestTool;
    entries.push({
      url: absoluteUrl(`/categories/${category.slug}`),
      lastModified: latest,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  for (const tool of liveTools) {
    entries.push({
      url: absoluteUrl(`/tools/${tool.slug}`),
      lastModified: new Date(tool.updated),
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  for (const category of unitCategories) {
    entries.push({
      url: absoluteUrl(`/convert/${category.slug}`),
      lastModified: pairReviewed,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  for (const pair of conversionPairs) {
    entries.push({
      url: absoluteUrl(pairHref(pair)),
      lastModified: pairReviewed,
      changeFrequency: "yearly",
      priority: 0.6,
    });
  }

  for (const guide of guides) {
    entries.push({
      url: absoluteUrl(`/blog/${guide.slug}`),
      lastModified: new Date(guide.updatedAt),
      changeFrequency: "yearly",
      priority: 0.6,
    });
  }

  for (const topic of guideTopics) {
    const topicGuides = guides.filter((guide) => guide.topic === topic);
    const latest = topicGuides.length
      ? new Date(Math.max(...topicGuides.map((guide) => new Date(guide.updatedAt).getTime())))
      : latestGuide;
    entries.push({
      url: absoluteUrl(`/blog/topics/${topic}`),
      lastModified: latest,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  return entries;
}
