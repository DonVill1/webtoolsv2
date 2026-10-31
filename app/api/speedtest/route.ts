import { NextResponse } from "next/server";
import { SPEEDTEST } from "@/lib/network/speedtest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * One payload per server process, served as a slice. Allocating a fresh body
 * per request turned a public endpoint into an easy memory-churn target.
 */
const payload = Buffer.alloc(SPEEDTEST.maxDownloadBytes, 0x2e);

const noStore = {
  "cache-control": "no-store, no-transform",
  "x-content-type-options": "nosniff",
};

function requestedBytes(raw: string | null): number {
  if (raw === null || raw.trim() === "") return 500_000;
  // Number(), not parseInt(): "12abc" should fall back, not silently become 12.
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return 500_000;
  return Math.floor(Math.min(Math.max(parsed, 0), SPEEDTEST.maxDownloadBytes));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bytes = requestedBytes(searchParams.get("bytes"));

  return new Response(payload.subarray(0, bytes), {
    headers: {
      "content-type": "application/octet-stream",
      "content-length": String(bytes),
      ...noStore,
    },
  });
}

/**
 * Counts a request body without buffering it, and refuses anything over the
 * cap. Reading the whole body first let a client hold an unbounded allocation
 * in the server process.
 */
async function countBody(request: Request): Promise<number | null> {
  const declared = request.headers.get("content-length");
  if (declared !== null) {
    const size = Number(declared);
    if (Number.isFinite(size) && size > SPEEDTEST.maxUploadBytes) return null;
  }

  if (!request.body) return 0;

  const reader = request.body.getReader();
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > SPEEDTEST.maxUploadBytes) {
        await reader.cancel();
        return null;
      }
    }
  } finally {
    reader.releaseLock();
  }
  return total;
}

export async function POST(request: Request) {
  const bytes = await countBody(request);

  if (bytes === null) {
    return NextResponse.json(
      { error: `Payload exceeds ${SPEEDTEST.maxUploadBytes} bytes` },
      { status: 413, headers: noStore },
    );
  }

  return NextResponse.json({ bytes }, { headers: noStore });
}
