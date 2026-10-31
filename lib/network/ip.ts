export type IpVersion = 4 | 6;

export type IpScope =
  | "public"
  | "private"
  | "loopback"
  | "link-local"
  | "cgnat"
  | "multicast"
  | "documentation"
  | "reserved"
  | "unspecified";

export interface IpAddress {
  version: IpVersion;
  scope: IpScope;
  /** Canonical text form: dotted quad for IPv4, RFC 5952 compressed for IPv6. */
  canonical: string;
  /** Human description of the range that determined the scope. */
  range: string;
  bytes: number[];
}

export type Ipv4Bytes = [number, number, number, number];

export function parseIPv4(value: string): Ipv4Bytes | null {
  const parts = value.split(".");
  if (parts.length !== 4) return null;

  const bytes: number[] = [];
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    // Leading zeros are ambiguous (octal in some parsers), so reject them.
    if (part.length > 1 && part[0] === "0") return null;
    const octet = Number(part);
    if (octet > 255) return null;
    bytes.push(octet);
  }
  return bytes.length === 4 ? (bytes as Ipv4Bytes) : null;
}

function groupsFrom(chunk: string): string[] | null {
  if (chunk === "") return [];
  const groups = chunk.split(":");
  const out: string[] = [];

  for (let index = 0; index < groups.length; index += 1) {
    const group = groups[index];
    if (group === undefined) return null;
    if (group.includes(".")) {
      if (index !== groups.length - 1) return null;
      const embedded = parseIPv4(group);
      if (!embedded) return null;
      out.push(((embedded[0] << 8) | embedded[1]).toString(16));
      out.push(((embedded[2] << 8) | embedded[3]).toString(16));
      continue;
    }
    if (!/^[0-9a-f]{1,4}$/i.test(group)) return null;
    out.push(group);
  }

  return out;
}

export function parseIPv6(value: string): number[] | null {
  let text = value.trim();
  if (text.startsWith("[") && text.endsWith("]")) text = text.slice(1, -1);
  const zone = text.indexOf("%");
  if (zone !== -1) text = text.slice(0, zone);
  if (!text.includes(":")) return null;

  const halves = text.split("::");
  if (halves.length > 2) return null;

  const head = groupsFrom(halves[0] ?? "");
  if (!head) return null;
  const tail = halves.length === 2 ? groupsFrom(halves[1] ?? "") : [];
  if (!tail) return null;

  let groups: string[];
  if (halves.length === 1) {
    if (head.length !== 8) return null;
    groups = head;
  } else {
    // "::" must stand for at least one zero group.
    if (head.length + tail.length > 7) return null;
    groups = [...head, ...Array<string>(8 - head.length - tail.length).fill("0"), ...tail];
  }

  const bytes: number[] = [];
  for (const group of groups) {
    const value = Number.parseInt(group, 16);
    bytes.push((value >> 8) & 0xff, value & 0xff);
  }
  return bytes;
}

export function formatIPv6(bytes: number[]): string {
  const groups: number[] = [];
  for (let index = 0; index < 16; index += 2) {
    groups.push(((bytes[index] ?? 0) << 8) | (bytes[index + 1] ?? 0));
  }

  let bestStart = -1;
  let bestLength = 0;
  for (let index = 0; index < groups.length; ) {
    if (groups[index] !== 0) {
      index += 1;
      continue;
    }
    let end = index;
    while (end < groups.length && groups[end] === 0) end += 1;
    if (end - index > bestLength) {
      bestStart = index;
      bestLength = end - index;
    }
    index = end;
  }

  const hex = groups.map((group) => group.toString(16));
  if (bestLength < 2) return hex.join(":");

  const before = hex.slice(0, bestStart).join(":");
  const after = hex.slice(bestStart + bestLength).join(":");
  return `${before}::${after}`;
}

function scopeOfV4(bytes: Ipv4Bytes): { scope: IpScope; note: string } {
  const [a, b, c] = bytes;

  if (a === 0) return { scope: "unspecified", note: "the 0.0.0.0/8 'this network' range" };
  if (a === 10) return { scope: "private", note: "the private 10.0.0.0/8 range" };
  if (a === 127) return { scope: "loopback", note: "the loopback 127.0.0.0/8 range" };
  if (a === 169 && b === 254) return { scope: "link-local", note: "the link-local 169.254.0.0/16 range" };
  if (a === 172 && b >= 16 && b <= 31) return { scope: "private", note: "the private 172.16.0.0/12 range" };
  if (a === 100 && b >= 64 && b <= 127) return { scope: "cgnat", note: "the carrier-grade NAT 100.64.0.0/10 range" };
  if (a === 192 && b === 0 && c === 0) return { scope: "reserved", note: "the IETF protocol assignment 192.0.0.0/24 range" };
  if (a === 192 && b === 0 && c === 2) return { scope: "documentation", note: "the documentation 192.0.2.0/24 range" };
  if (a === 192 && b === 168) return { scope: "private", note: "the private 192.168.0.0/16 range" };
  if (a === 198 && (b === 18 || b === 19)) return { scope: "reserved", note: "the benchmarking 198.18.0.0/15 range" };
  if (a === 198 && b === 51 && c === 100) return { scope: "documentation", note: "the documentation 198.51.100.0/24 range" };
  if (a === 203 && b === 0 && c === 113) return { scope: "documentation", note: "the documentation 203.0.113.0/24 range" };
  if (a >= 224 && a <= 239) return { scope: "multicast", note: "the multicast 224.0.0.0/4 range" };
  if (a >= 240) return { scope: "reserved", note: "the reserved 240.0.0.0/4 range" };
  return { scope: "public", note: "a globally routable range" };
}

function embeddedIPv4(bytes: number[]): Ipv4Bytes {
  const at = (index: number) => bytes[index] ?? 0;
  return [at(12), at(13), at(14), at(15)];
}

function scopeOfV6(bytes: number[]): { scope: IpScope; note: string } {
  const at = (index: number) => bytes[index] ?? 0;
  const allZero = bytes.every((byte) => byte === 0);
  if (allZero) return { scope: "unspecified", note: "the unspecified :: address" };

  const loopback = bytes.slice(0, 15).every((byte) => byte === 0) && at(15) === 1;
  if (loopback) return { scope: "loopback", note: "the loopback ::1/128 range" };

  const mapped =
    bytes.slice(0, 10).every((byte) => byte === 0) && at(10) === 0xff && at(11) === 0xff;
  if (mapped) {
    const inner = scopeOfV4(embeddedIPv4(bytes));
    if (inner.scope === "public") return inner;
    return { scope: inner.scope, note: `an IPv4-mapped address in ${inner.note}` };
  }

  if (at(0) === 0xfe && (at(1) & 0xc0) === 0x80) {
    return { scope: "link-local", note: "the link-local fe80::/10 range" };
  }
  if ((at(0) & 0xfe) === 0xfc) {
    return { scope: "private", note: "the unique-local fc00::/7 range" };
  }
  if (at(0) === 0xff) {
    return { scope: "multicast", note: "the multicast ff00::/8 range" };
  }
  if (at(0) === 0x20 && at(1) === 0x01 && at(2) === 0x0d && at(3) === 0xb8) {
    return { scope: "documentation", note: "the documentation 2001:db8::/32 range" };
  }

  return { scope: "public", note: "a globally routable range" };
}

/** Parses and classifies an address. Returns null when the input is not an IP literal. */
export function parseIpAddress(input: string): IpAddress | null {
  const value = input.trim().replace(/^\[(.*)\]$/, "$1");
  if (!value) return null;

  if (!value.includes(":")) {
    const bytes = parseIPv4(value);
    if (!bytes) return null;
    const { scope, note } = scopeOfV4(bytes);
    return { version: 4, scope, range: note, canonical: bytes.join("."), bytes };
  }

  const bytes = parseIPv6(value);
  if (!bytes) return null;
  const { scope, note } = scopeOfV6(bytes);
  return { version: 6, scope, range: note, canonical: formatIPv6(bytes), bytes };
}

const SCOPE_DESCRIPTIONS: Record<Exclude<IpScope, "public">, string> = {
  private: "a private address used inside a local network",
  loopback: "an address that never leaves the machine",
  "link-local": "a link-local address that is not routable on the internet",
  cgnat: "a carrier-grade NAT address shared by many subscribers",
  multicast: "a multicast address, not a single host",
  documentation: "an address reserved for documentation and examples",
  reserved: "a reserved or non-routable address",
  unspecified: "the unspecified address",
};

/**
 * Plain-language explanation for addresses that cannot have a public
 * location. Returns null for public addresses.
 */
export function explainNonPublic(address: IpAddress): string | null {
  if (address.scope === "public") return null;
  return `${address.canonical} is ${SCOPE_DESCRIPTIONS[address.scope]} (${address.range}), so there is no public location to look up.`;
}
