import { ImageResponse } from "next/og";
import { toolBySlug } from "@/lib/content/tools";
import { getCategory } from "@/lib/content/categories";

export const alt = "Web tool reference card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = toolBySlug.get(slug);

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
          <span>{tool ? getCategory(tool.category).name.toUpperCase() : "TOOLS"}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -3, lineHeight: 1.02, maxWidth: 900 }}>
            {tool?.name ?? "Precise web tools"}
          </div>
          <div style={{ width: 220, height: 6, background: "#2DD4BF" }} />
          <div style={{ fontSize: 38, color: "#2DD4BF", fontFamily: "monospace" }}>
            {tool?.og.value ?? "formula · limits · no sign-up"}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#A7B9C9" }}>
          <span>Free · runs in your browser · no sign-up</span>
          <span>{tool?.og.kicker ?? "Reference"}</span>
        </div>
      </div>
    ),
    size,
  );
}
