export type UrlMode = "component" | "whole";

export interface ParsedUrl {
  href: string;
  scheme: string;
  username: string;
  password: string;
  host: string;
  port: string;
  path: string;
  query: string;
  fragment: string;
  params: Array<{ key: string; value: string }>;
}

/** Encode text for one URL value, or for a complete address. */
export function encodeUrl(value: string, mode: UrlMode): string {
  return mode === "component" ? encodeURIComponent(value) : encodeURI(value);
}

/**
 * Decode once. Returns the original text and an error instead of throwing, so
 * a pasted string with a stray percent sign reports the problem inline.
 */
export function decodeUrl(value: string): { value: string; error: string | null } {
  try {
    return { value: decodeURIComponent(value.replace(/\+/g, "%20")), error: null };
  } catch {
    return { value: "", error: "The input contains an incomplete percent escape, such as a lone % or %2." };
  }
}

/** Split a full URL the way a request splits it, or report why it cannot. */
export function parseUrl(value: string): { parsed: ParsedUrl | null; error: string | null } {
  const trimmed = value.trim();
  if (!trimmed) return { parsed: null, error: null };
  try {
    const url = new URL(trimmed);
    const params: Array<{ key: string; value: string }> = [];
    url.searchParams.forEach((paramValue, key) => params.push({ key, value: paramValue }));
    return {
      parsed: {
        href: url.href,
        scheme: url.protocol.replace(/:$/, ""),
        username: url.username,
        password: url.password,
        host: url.hostname,
        port: url.port,
        path: url.pathname,
        query: url.search,
        fragment: url.hash,
        params,
      },
      error: null,
    };
  } catch {
    return {
      parsed: null,
      error: "A full URL needs a scheme, such as https://. Add one or use component mode for a bare value.",
    };
  }
}
