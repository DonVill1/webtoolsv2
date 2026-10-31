import { NextResponse } from "next/server";
import { explainNonPublic, parseIpAddress } from "@/lib/network/ip";
import { mapIpWho, type IpWhoResponse } from "@/lib/network/ipwho";

export const runtime = "nodejs";

function clientAddress(request: Request): string | null {
  const headers = request.headers;
  const direct = headers.get("cf-connecting-ip") ?? headers.get("x-real-ip");
  if (direct?.trim()) return direct.trim();

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requested = (searchParams.get("ip") ?? "").trim();
  const candidate = requested || clientAddress(request);

  if (!candidate) {
    return NextResponse.json(
      {
        error:
          "Could not determine your public address from this connection. Enter an address to look up.",
        code: "no-address",
      },
      { status: 400, headers: { "cache-control": "no-store" } },
    );
  }

  const address = parseIpAddress(candidate);
  if (!address) {
    return NextResponse.json(
      {
        error: "Enter a valid IPv4 or IPv6 address, for example 8.8.8.8 or 2001:4860:4860::8888.",
        code: "invalid",
      },
      { status: 400, headers: { "cache-control": "no-store" } },
    );
  }

  const refusal = explainNonPublic(address);
  if (refusal) {
    return NextResponse.json(
      { error: refusal, code: "non-public", address: address.canonical },
      { status: 400, headers: { "cache-control": "no-store" } },
    );
  }

  const self = !requested;

  try {
    const upstream = await fetch(`https://ipwho.is/${address.canonical}`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(8000),
      ...(self ? { cache: "no-store" as const } : { next: { revalidate: 86400 } }),
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: "The geolocation provider did not answer. Try again in a moment." },
        { status: 502, headers: { "cache-control": "no-store" } },
      );
    }

    const data = (await upstream.json()) as IpWhoResponse;

    if (data.success === false) {
      return NextResponse.json(
        {
          error:
            data.message === "Reserved range"
              ? `${address.canonical} is a reserved address with no public location.`
              : (data.message ?? "No data was published for that address."),
        },
        { status: 404, headers: { "cache-control": "no-store" } },
      );
    }

    return NextResponse.json(
      { ...mapIpWho(data, address), checkedAt: new Date().toISOString() },
      {
        headers: {
          "cache-control": self
            ? "no-store"
            : "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      },
    );
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    return NextResponse.json(
      {
        error: timedOut
          ? "The geolocation provider took too long to answer. Try again."
          : "The lookup failed before a result arrived. Try again.",
      },
      { status: 502, headers: { "cache-control": "no-store" } },
    );
  }
}
