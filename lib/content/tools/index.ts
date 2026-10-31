import type { ToolCategoryId, ToolDefinition } from "../types";
import { getCategory } from "../categories";
import { converterTools } from "./converters";
import { calculatorTools } from "./calculators";
import { developerTools } from "./developers";
import { designTools } from "./design";
import { networkTools } from "./network";
import { textTools } from "./text";
import { clientTools } from "./client-tools";

export const tools: ToolDefinition[] = [
  ...converterTools,
  ...calculatorTools,
  ...developerTools,
  ...designTools,
  ...textTools,
  ...networkTools,
  ...clientTools,
];

export const toolBySlug = new Map(tools.map((tool) => [tool.slug, tool]));

export const liveTools = tools.filter((tool) => tool.status === "live");

export function getTool(slug: string): ToolDefinition {
  const tool = toolBySlug.get(slug);
  if (!tool) throw new Error(`Unknown tool: ${slug}`);
  return tool;
}

export function toolsInCategory(category: ToolCategoryId): ToolDefinition[] {
  return liveTools.filter((tool) => tool.category === category);
}

export function toolCode(tool: ToolDefinition): string {
  const index = toolsInCategory(tool.category).findIndex((entry) => entry.slug === tool.slug);
  const prefix = getCategory(tool.category).code;
  return `${prefix}-${String(index + 1).padStart(2, "0")}`;
}

export function relatedTools(tool: ToolDefinition): ToolDefinition[] {
  return tool.related
    .map((slug) => toolBySlug.get(slug))
    .filter((entry): entry is ToolDefinition => Boolean(entry));
}

/** Structural contract: a tool cannot ship without its page furniture. */
export function validateTools(): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();

  for (const tool of tools) {
    if (seen.has(tool.slug)) problems.push(`duplicate slug: ${tool.slug}`);
    seen.add(tool.slug);

    if (!/^[a-z0-9-]+$/.test(tool.slug)) problems.push(`${tool.slug}: slug must be kebab-case`);
    if (tool.seo.title.length > 60) problems.push(`${tool.slug}: title over 60 chars`);
    if (tool.seo.description.length < 110 || tool.seo.description.length > 160) {
      problems.push(`${tool.slug}: description should be 110-160 chars`);
    }
    if (tool.content.faqs.length < 3) problems.push(`${tool.slug}: needs at least 3 FAQs`);
    if (tool.content.examples.length < 1) problems.push(`${tool.slug}: needs an example`);
    if (tool.content.howItWorks.length < 1) problems.push(`${tool.slug}: needs how-it-works copy`);
    if (!tool.content.limits) problems.push(`${tool.slug}: needs a limits note`);
    for (const related of tool.related) {
      if (!toolBySlug.has(related)) problems.push(`${tool.slug}: unknown related tool "${related}"`);
      if (related === tool.slug) problems.push(`${tool.slug}: relates to itself`);
    }
  }

  return problems;
}
