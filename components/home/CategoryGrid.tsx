import Link from "next/link";
import { categories } from "@/lib/content/categories";
import { liveTools } from "@/lib/content/tools";

export function CategoryGrid() {
  return (
    <div className="v1-grid">
      {categories.map((category) => {
        const items = liveTools.filter((tool) => tool.category === category.id);
        if (items.length === 0) return null;

        return (
          <section key={category.slug} className="category-card" data-category={category.id}>
            <div className="category-card-head">
              <span className="category-dot" aria-hidden="true" />
              <h3>{category.name}</h3>
            </div>
            <p>{category.description}</p>
            <div className="category-links">
              {items.map((tool) => (
                <Link key={tool.slug} href={`/tools/${tool.slug}`}>
                  <span className="tool-dot" aria-hidden="true" />
                  {tool.name}
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
