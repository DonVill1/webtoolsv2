export interface SubnetResult {
  family: "IPv4" | "IPv6";
  prefix: number;
  network: string;
  mask: string;
  wildcard: string;
  first: string;
  last: string;
  broadcast: string | null;
  total: bigint;
  usable: bigint;
  binary: string;
}

const V4_BITS = 32n;
const V6_BITS = 128n;

function parseIpv4(text: string): bigint | null {
  const parts = text.split(".");
  if (parts.length !== 4) return null;
  let value = 0n;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const octet = Number(part);
    if (octet > 255) return null;
    value = (value << 8n) | BigInt(octet);
  }
  return value;
}

function parseIpv6(text: string): bigint | null {
  let value = text;
  if (value.startsWith("[") && value.endsWith("]")) value = value.slice(1, -1);
  if (value.includes("%")) return null;

  const double = value.split("::");
  if (double.length > 2) return null;

  const expand = (chunk: string): string[] | null => {
    if (!chunk) return [];
    const groups = chunk.split(":");
    const out: string[] = [];
    for (const group of groups) {
      if (group.includes(".")) {
        const v4 = parseIpv4(group);
        if (v4 === null) return null;
        out.push(((v4 >> 16n) & 0xffffn).toString(16), (v4 & 0xffffn).toString(16));
      } else {
        if (!/^[0-9a-fA-F]{1,4}$/.test(group)) return null;
        out.push(group);
      }
    }
    return out;
  };

  const left = expand(double[0] ?? "");
  const right = expand(double[1] ?? "");
  if (left === null || right === null) return null;

  let groups: string[];
  if (double.length === 1) {
    if (left.length !== 8) return null;
    groups = left;
  } else {
    if (left.length + right.length >= 8) return null;
    groups = [...left, ...Array(8 - left.length - right.length).fill("0"), ...right];
  }

  let result = 0n;
  for (const group of groups) result = (result << 16n) | BigInt(parseInt(group, 16));
  return result;
}

export function formatIpv4(value: bigint): string {
  return [24n, 16n, 8n, 0n].map((shift) => String((value >> shift) & 0xffn)).join(".");
}

export function formatIpv6(value: bigint): string {
  const groups = Array.from({ length: 8 }, (_, index) => Number((value >> BigInt((7 - index) * 16)) & 0xffffn));

  let bestStart = -1;
  let bestLength = 0;
  for (let start = 0; start < 8; start += 1) {
    if (groups[start] !== 0) continue;
    let end = start;
    while (end < 8 && groups[end] === 0) end += 1;
    if (end - start > bestLength) {
      bestStart = start;
      bestLength = end - start;
    }
  }

  const hex = groups.map((group) => group.toString(16));
  if (bestLength < 2) return hex.join(":");
  return `${hex.slice(0, bestStart).join(":")}::${hex.slice(bestStart + bestLength).join(":")}`;
}

/** Parse an address and prefix, then derive every range field. */
export function subnet(input: string): { result: SubnetResult | null; error: string | null } {
  const trimmed = input.trim();
  if (!trimmed) return { result: null, error: null };
  const [addressText, prefixText, extra] = trimmed.split("/");
  if (!addressText || prefixText === undefined || extra !== undefined) {
    return { result: null, error: "Enter an address with a prefix, such as 192.168.1.10/24 or 2001:db8::/48." };
  }

  const family = addressText.includes(":") ? "IPv6" : "IPv4";
  const bits = family === "IPv6" ? V6_BITS : V4_BITS;
  const prefix = Number(prefixText);
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > Number(bits)) {
    return { result: null, error: `A ${family} prefix must be a whole number from 0 to ${bits}.` };
  }

  const address = family === "IPv6" ? parseIpv6(addressText) : parseIpv4(addressText);
  if (address === null) return { result: null, error: `That is not a valid ${family} address.` };

  const hostBits = bits - BigInt(prefix);
  const all = (1n << bits) - 1n;
  const hostMask = hostBits === 0n ? 0n : (1n << hostBits) - 1n;
  const mask = all ^ hostMask;
  const network = address & mask;
  const last = network | hostMask;
  const total = 1n << hostBits;

  let usable: bigint;
  let broadcast: string | null;
  if (family === "IPv6") {
    usable = total;
    broadcast = null;
  } else if (prefix >= 31) {
    usable = total;
    broadcast = prefix === 32 ? null : formatIpv4(last);
  } else {
    usable = total - 2n;
    broadcast = formatIpv4(last);
  }

  const format = family === "IPv6" ? formatIpv6 : formatIpv4;
  const networkAddress = prefix === 0 && family === "IPv6" ? "::" : format(network);
  const lastAddress = family === "IPv6" ? formatIpv6(last) : format(last);

  return {
    result: {
      family,
      prefix,
      network: networkAddress,
      mask: family === "IPv6" ? `/${prefix}` : formatIpv4(mask),
      wildcard: family === "IPv6" ? "n/a" : formatIpv4(hostMask),
      first: family === "IPv4" && prefix <= 30 ? formatIpv4(network + 1n) : networkAddress,
      last: family === "IPv4" && prefix <= 30 ? formatIpv4(last - 1n) : lastAddress,
      broadcast,
      total,
      usable,
      binary: (family === "IPv4" ? Number(address) >>> 0 : 0).toString(2).padStart(family === "IPv4" ? 32 : 0, "0"),
    },
    error: null,
  };
}
