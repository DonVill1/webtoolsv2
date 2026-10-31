import { z } from "zod";

const urlSchema = z
  .string()
  .url()
  .refine((value) => !value.endsWith("/"), "SITE_URL must not end with a slash");

const rawUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined) ??
  "http://localhost:3000";

const parsed = urlSchema.safeParse(rawUrl);

if (!parsed.success && process.env.NODE_ENV === "production") {
  throw new Error(
    `Invalid site URL "${rawUrl}". Set NEXT_PUBLIC_SITE_URL to an absolute origin with no trailing slash.`,
  );
}

export const siteUrl = parsed.success ? parsed.data : "http://localhost:3000";

export const siteName = process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "WebTools";

export const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || null;

/** The brand is deliberately not baked into metadata: one env change renames the site. */
/** Absolute URL for any route, used by canonicals, schema, sitemap and OG images. */
export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalized === "/" ? "" : normalized}`;
}

export const locale = "en";
