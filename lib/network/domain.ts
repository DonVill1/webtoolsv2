import { parseIpAddress } from "./ip";

export type DomainResult = { ok: true; name: string } | { ok: false; error: string };

const LABEL = /^[a-z0-9_](?:[a-z0-9_-]*[a-z0-9_])?$/;

/**
 * Accepts what people actually paste — full URLs, paths, ports, trailing
 * dots, uppercase, internationalised names — and returns the bare DNS name
 * to query.
 */
export function normalizeDomain(input: string): DomainResult {
  const raw = input.trim();
  if (!raw) return { ok: false, error: "Enter a domain name, for example example.com." };

  if (raw.startsWith("*.")) {
    return {
      ok: false,
      error: "Wildcards only exist inside a zone. Query a concrete name such as www.example.com.",
    };
  }

  const looksLikeAddress = parseIpAddress(raw);
  if (looksLikeAddress) {
    return {
      ok: false,
      error: `${looksLikeAddress.canonical} is an IP address, not a domain name. Use the IP lookup tool instead.`,
    };
  }

  let value = raw;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) {
    try {
      value = new URL(value).hostname;
    } catch {
      return { ok: false, error: "That URL could not be read. Enter a domain such as example.com." };
    }
  } else {
    const cut = value.search(/[/?#]/);
    if (cut !== -1) value = value.slice(0, cut);
  }

  const at = value.lastIndexOf("@");
  if (at !== -1) value = value.slice(at + 1);

  // Strip a port, but leave bare IPv6 literals to the address check above.
  if (!value.includes(":") || /^\[.*\]:\d+$/.test(value)) {
    value = value.replace(/:\d+$/, "");
  }
  value = value.replace(/^\[(.*)\]$/, "$1").replace(/\.$/, "").trim().toLowerCase();

  if (!value) return { ok: false, error: "Enter a domain name, for example example.com." };

  let ascii: string;
  try {
    // URL parsing normalises case and converts IDNs to punycode.
    ascii = new URL(`http://${value}`).hostname.replace(/\.$/, "");
  } catch {
    return { ok: false, error: "That is not a valid domain name." };
  }

  if (parseIpAddress(ascii)) {
    return { ok: false, error: "Enter a domain name, not an IP address." };
  }

  if (ascii.length > 253) {
    return { ok: false, error: "Domain names cannot be longer than 253 characters." };
  }

  const labels = ascii.split(".");
  if (labels.some((label) => label.length === 0 || label.length > 63)) {
    return { ok: false, error: "Each part of a domain must be 1–63 characters." };
  }
  if (labels.some((label) => !LABEL.test(label))) {
    return {
      ok: false,
      error: "Domain parts may only contain letters, digits, hyphens and underscores, and cannot start or end with a hyphen.",
    };
  }
  if (labels.length === 1) {
    return {
      ok: false,
      error: "Enter a full domain name such as example.com — single-label names only resolve on a local network.",
    };
  }
  const tld = labels[labels.length - 1] ?? "";
  if (/^\d+$/.test(tld)) {
    return { ok: false, error: "The last part of a domain cannot be all digits." };
  }

  return { ok: true, name: ascii };
}
