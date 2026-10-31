import { ImageResponse } from "next/og";
import { categoryBySlug, convertUnit, formatNumber, pairBySlug } from "@/lib/units/registry";

export const alt = "Unit conversion table";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ category: string; pair: string }>;
}) {
  const { category: categorySlug, pair: pairSlug } = await params;
  const category = categoryBySlug.get(categorySlug);
  const pair = pairBySlug.get(pairSlug);
  const factor =
    category && pair ? formatNumber(convertUnit(category.id, 1, pair.from.id, pair.to.id), 8) : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0B1725 0%, #15283C 100%)",
          color: "#F2F7F9",
          padding: 64,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 22, letterSpacing: 2 }}>
          <div style={{ width: 18, height: 18, background: "#2DD4BF" }} />
          <span>{category ? `${category.name.toUpperCase()} CONVERSION` : "CONVERSION"}</span>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 28, fontFamily: "monospace" }}>
          <span style={{ fontSize: 76, color: "#A7B9C9" }}>{pair?.from.symbol ?? "ft"}</span>
          <span style={{ fontSize: 54, color: "#2DD4BF" }}>→</span>
          <span style={{ fontSize: 76, color: "#A7B9C9" }}>{pair?.to.symbol ?? "in"}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ fontSize: 52, fontWeight: 700, letterSpacing: -1.5 }}>
            {pair ? `1 ${pair.from.symbol} = ${factor} ${pair.to.symbol}` : "Exact factor, full table"}
          </span>
          <div style={{ width: 220, height: 6, background: "#2DD4BF" }} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#A7B9C9" }}>
          <span>Formula · table · worked examples</span>
          <span>No sign-up</span>
        </div>
      </div>
    ),
    size,
  );
}
