import { NextResponse } from "next/server";
import { isDnsRecordType, rcodeLabel, formatRecordData } from "@/lib/network/dns";
import { normalizeDomain } from "@/lib/network/domain";

export const runtime = "nodejs";

const TYPE_NAMES: Record<number, string> = {
  1: "A",
  2: "NS",
  5: "CNAME",
  6: "SOA",
  12: "PTR",
  15: "MX",
  16: "TXT",
  28: "AAAA",
  33: "SRV",
  257: "CAA",
};

interface DohAnswer {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

function shape(records: DohAnswer[] | undefined) {
  return (records ?? []).map((record) => {
    const type = TYPE_NAMES[record.type] ?? String(record.type);
    return {
      name: record.name,
      type,
      ttl: record.TTL,
      data: formatRecordData(type, record.data),
      raw: record.data,
    };
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = (searchParams.get("type") ?? "A").toUpperCase();
  const fresh = searchParams.get("fresh") === "1";

  const normalized = normalizeDomain(searchParams.get("name") ?? "");
  if (!normalized.ok) {
    return NextResponse.json({ error: normalized.error }, { status: 400 });
  }
  if (!isDnsRecordType(type)) {
    return NextResponse.json(
      { error: `Unsupported record type. Choose one of: ${["A", "AAAA", "MX", "TXT", "NS", "CNAME", "SOA", "CAA", "SRV"].join(", ")}.` },
      { status: 400 },
    );
  }

  const name = normalized.name;

  try {
    const upstream = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`,
      {
        headers: { accept: "application/dns-json" },
        signal: AbortSignal.timeout(8000),
        ...(fresh ? { cache: "no-store" as const } : { next: { revalidate: 60 } }),
      },
    );

    if (!upstream.ok) {
      return NextResponse.json(
        { error: "The DNS resolver did not answer. Try again in a moment." },
        { status: 502 },
      );
    }

    const payload = (await upstream.json()) as {
      Status: number;
      Answer?: DohAnswer[];
      Authority?: DohAnswer[];
    };

    const records = shape(payload.Answer);
    const status = payload.Status ?? 2;

    return NextResponse.json(
      {
        name,
        type,
        status,
        statusLabel: rcodeLabel(status),
        records,
        authority: shape(payload.Authority),
        checkedAt: new Date().toISOString(),
        cached: !fresh,
        resolver: "Cloudflare 1.1.1.1 over DoH",
      },
      {
        headers: {
          "cache-control": fresh
            ? "no-store"
            : "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    return NextResponse.json(
      {
        error: timedOut
          ? "The DNS resolver took too long to answer. Try again."
          : "The DNS lookup failed before a result arrived. Try again.",
      },
      { status: 502 },
    );
  }
}
