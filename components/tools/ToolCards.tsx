import Link from "next/link";
import { ToolIcon } from "@/components/tools/ToolIcon";
import { getCategory } from "@/lib/content/categories";
import type { ToolDefinition } from "@/lib/content/types";

interface ToolCardsProps {
  tools: ToolDefinition[];
  /** Match the surrounding outline: 3 inside a category section, 2 on a page with only an h1. */
  headingLevel?: 2 | 3;
}

export function ToolCards({ tools, headingLevel = 2 }: ToolCardsProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <div className="tool-cards">
      {tools.map((tool) => {
        const category = getCategory(tool.category);

        return (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="tool-card"
            data-category={category.id}
          >
            <span className="tool-card-head">
              <span
                className="cat-dot"
                data-category={category.id}
                aria-hidden="true"
                title={category.name}
              />
              <span className="tool-card-icon" aria-hidden="true">
                <ToolIcon slug={tool.slug} />
              </span>
              <Heading className="tool-card-title">{tool.name}</Heading>
            </span>
            <span className="tool-card-desc">{tool.seo.description}</span>
          </Link>
        );
      })}
    </div>
  );
}
