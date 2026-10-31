export const DNS_TYPES = ["A", "AAAA", "MX", "TXT", "NS", "CNAME", "SOA", "CAA", "SRV"] as const;

export type DnsRecordType = (typeof DNS_TYPES)[number];

const RCODE_LABELS: Record<number, string> = {
  0: "NOERROR",
  1: "FORMERR",
  2: "SERVFAIL",
  3: "NXDOMAIN",
  4: "NOTIMP",
  5: "REFUSED",
  6: "YXDOMAIN",
  7: "YXRRSET",
  8: "NXRRSET",
  9: "NOTAUTH",
  10: "NOTZONE",
};

export function rcodeLabel(code: number): string {
  return RCODE_LABELS[code] ?? `RCODE ${code}`;
}

export function isDnsRecordType(value: string): value is DnsRecordType {
  return (DNS_TYPES as readonly string[]).includes(value);
}

/**
 * TXT answers arrive as one or more quoted character-strings. Join them so
 * SPF and DKIM values read as the single record they represent; other types
 * keep their raw RDATA.
 */
export function formatRecordData(type: string, data: string): string {
  if (type !== "TXT") return data;

  const parts: string[] = [];
  const pattern = /"((?:[^"\\]|\\.)*)"/g;
  let match = pattern.exec(data);
  while (match) {
    parts.push((match[1] ?? "").replace(/\\(.)/g, "$1"));
    match = pattern.exec(data);
  }
  return parts.length > 0 ? parts.join("") : data;
}

export type DnsOutcome = "records" | "nodata" | "nxdomain" | "error";

export function dnsOutcome(status: number, recordCount: number): DnsOutcome {
  if (status === 3) return "nxdomain";
  if (status !== 0) return "error";
  return recordCount > 0 ? "records" : "nodata";
}
