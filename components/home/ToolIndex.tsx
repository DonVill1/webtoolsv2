import Link from "next/link";
import { ToolCards } from "@/components/tools/ToolCards";
import { categories } from "@/lib/content/categories";
import { liveTools } from "@/lib/content/tools";

export function ToolIndex() {
  return (
    <div>
      {categories.map((category) => {
        const items = liveTools.filter((tool) => tool.category === category.id);
        if (items.length === 0) return null;

        return (
          <section key={category.slug} className="index-section" aria-labelledby={`cat-${category.slug}`}>
            <div className="index-section-head">
              <h2 id={`cat-${category.slug}`} className="section-title" style={{ margin: 0 }}>
                {category.name}
              </h2>
              <Link href={`/categories/${category.slug}`} className="micro">
                {items.length} tools →
              </Link>
            </div>
            <ToolCards tools={items} headingLevel={3} />
          </section>
        );
      })}
    </div>
  );
}
