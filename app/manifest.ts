import type { MetadataRoute } from "next";
import { siteName } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteName} — precise web tools`,
    short_name: siteName,
    description:
      "Converters, calculators and developer utilities with the formula, rounding rule and limits shown on every page.",
    start_url: "/",
    display: "standalone",
    background_color: "#0B1725",
    theme_color: "#0B1725",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
