import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, type Crumb } from "@/lib/seo/schema";

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <>
      <JsonLd data={breadcrumbSchema(items)} />
      <nav aria-label="Breadcrumb" className="breadcrumbs">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <span key={item.href} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              {index > 0 ? <span className="sep">/</span> : null}
              {last ? (
                <span aria-current="page" style={{ color: "var(--wt-color-ink)" }}>
                  {item.name}
                </span>
              ) : (
                <Link href={item.href}>{item.name}</Link>
              )}
            </span>
          );
        })}
      </nav>
    </>
  );
}
