import type { Metadata } from "next";
import { absoluteUrl, siteName } from "@/lib/site";

export interface BuildMetadataArgs {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
}

/**
 * The only place a page's title, description, canonical and robots directives
 * are assembled. Pages never write <title> or a description by hand.
 */
export function buildMetadata({
  title,
  description,
  path,
  noindex = false,
  type = "website",
  publishedTime,
  modifiedTime,
}: BuildMetadataArgs): Metadata {
  const url = absoluteUrl(path);

  return {
    // Absolute, so the layout's brand template cannot push a tuned title past
    // the 60-character display limit.
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    robots: noindex
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
          "max-video-preview": -1,
        },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName,
      locale: "en_US",
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
