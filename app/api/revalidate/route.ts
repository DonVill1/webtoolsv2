import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface WebhookBody {
  _type?: string;
  slug?: { current?: string } | string;
}

export async function POST(request: Request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Revalidation is not configured." }, { status: 500 });
  }

  const provided = request.headers.get("x-webhook-secret") ?? new URL(request.url).searchParams.get("secret");
  if (provided !== secret) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let body: WebhookBody = {};
  try {
    body = (await request.json()) as WebhookBody;
  } catch {
    // A missing body still revalidates the shared routes below.
  }

  const slug = typeof body.slug === "string" ? body.slug : body.slug?.current;
  const paths = new Set<string>(["/", "/tools", "/blog", "/convert"]);

  if (body._type === "tool") paths.add("/tools");
  if (body._type === "guide") paths.add("/blog");
  if (slug) {
    paths.add(`/tools/${slug}`);
    paths.add(`/blog/${slug}`);
  }

  for (const path of paths) revalidatePath(path);

  return NextResponse.json({ revalidated: true, paths: [...paths] });
}
