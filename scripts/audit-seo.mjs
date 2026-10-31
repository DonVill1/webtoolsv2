#!/usr/bin/env node
/**
 * SEO / content audit against the real rendered site.
 *
 * Usage:
 *   npm run build && npm start
 *   npm run audit:seo                       # http://localhost:3000
 *   npm run audit:seo -- http://localhost:3100
 *
 * The script reads /sitemap.xml, then checks every URL it finds. It asserts
 * what a crawler sees in the server HTML — not what React renders later — so
 * it catches the client-only metadata mistake the v1 audit found.
 */

const base = (process.argv[2] ?? process.env.AUDIT_BASE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
const verbose = process.argv.includes("--verbose");
const TIMEOUT_MS = 20_000;
const CONCURRENCY = 5;

const failures = [];
const warnings = [];

function fail(url, message) {
  failures.push({ url, message });
}

function warn(url, message) {
  warnings.push({ url, message });
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function attribute(tag, name) {
  const match = new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i").exec(tag);
  return match ? decodeEntities(match[2] ?? match[3] ?? "") : null;
}

function metaContent(html, key, value) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    if (attribute(tag, key) === value) return attribute(tag, "content");
  }
  return null;
}

function textOf(html) {
  return decodeEntities(
    html
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<svg\b[\s\S]*?<\/svg>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function family(pathname) {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/tools/")) return "tool detail";
  if (pathname === "/tools") return "tool index";
  if (pathname.startsWith("/convert/") && pathname.split("/").length === 4) return "conversion pair";
  if (pathname.startsWith("/convert")) return "conversion hub";
  if (pathname === "/blog") return "blog";
  if (pathname.startsWith("/blog/topics/")) return "guide topic";
  if (pathname.startsWith("/blog/")) return "guide";
  if (pathname.startsWith("/categories/")) return "category";
  if (["/about", "/privacy", "/terms"].includes(pathname)) return "legal";
  return "other";
}

const minimumWords = {
  home: 100,
  blog: 100,
  "tool index": 100,
  "tool detail": 500,
  "conversion pair": 200,
  "conversion hub": 140,
  guide: 500,
  "guide topic": 140,
  category: 120,
  legal: 150,
  other: 80,
};

function needsStructuredData(pathname) {
  return pathname === "/" || pathname === "/tools" || pathname === "/convert" || pathname.startsWith("/blog") || pathname.startsWith("/tools/") || pathname.startsWith("/convert/") || pathname.startsWith("/categories/");
}

async function checkPage(url, expectedOrigin) {
  const pathname = new URL(url).pathname;
  let response;
  try {
    response = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": "webtools-seo-audit/2.0" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    fail(url, `request failed: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }

  if (response.status !== 200) {
    fail(url, `HTTP ${response.status}`);
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) {
    fail(url, `unexpected content-type: ${contentType}`);
    return null;
  }

  const html = await response.text();
  const title = decodeEntities((/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? "").trim());
  const description = metaContent(html, "name", "description");
  const robots = metaContent(html, "name", "robots");
  const canonicalTag = /<link\b[^>]*rel=["']canonical["'][^>]*>/i.exec(html)?.[0];
  const canonical = canonicalTag ? attribute(canonicalTag, "href") : null;
  const h1Count = (html.match(/<h1[\s>]/gi) ?? []).length;
  const hasLang = /<html\b[^>]*\blang=["'][a-z-]+["']/i.test(html);
  const jsonLdCount = (html.match(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>/gi) ?? []).length;
  const words = textOf(html).split(/\s+/).filter(Boolean).length;

  if (!title) fail(url, "missing <title>");
  else if (title.length < 20) fail(url, `title too short (${title.length} chars)`);
  else if (title.length > 65) fail(url, `title too long (${title.length} chars): ${title}`);

  if (!description) fail(url, "missing meta description");
  else if (description.length < 80) fail(url, `description too short (${description.length} chars)`);
  else if (description.length > 165) fail(url, `description too long (${description.length} chars)`);

  if (!canonical) fail(url, "missing canonical link");
  else {
    const canonicalUrl = new URL(canonical);
    if (canonicalUrl.pathname.replace(/\/$/, "") !== pathname.replace(/\/$/, "")) {
      fail(url, `canonical points elsewhere: ${canonicalUrl.pathname}`);
    }
    if (canonicalUrl.origin !== expectedOrigin) {
      warn(url, `canonical origin ${canonicalUrl.origin} differs from sitemap origin ${expectedOrigin}`);
    }
  }

  if (robots?.includes("noindex")) fail(url, "page is noindex");
  if (h1Count !== 1) fail(url, `expected exactly one <h1>, found ${h1Count}`);
  if (!hasLang) fail(url, "<html> has no lang attribute");
  if (needsStructuredData(pathname) && jsonLdCount === 0) fail(url, "no JSON-LD structured data in server HTML");

  const minimum = minimumWords[family(pathname)] ?? 80;
  if (words < minimum) fail(url, `thin content: ${words} words (minimum ${minimum} for ${family(pathname)})`);

  if (family(pathname) === "tool detail") {
    const faqCards = (html.match(/class="faq-card"/g) ?? []).length;
    if (faqCards < 5) fail(url, `tool page has ${faqCards} FAQ cards, expected at least 5`);
    if (!html.includes("Short answer.")) fail(url, "tool page has no direct-answer block");
    for (const id of ["reference", "mistakes", "sources"]) {
      if (!new RegExp(`id="${id}"`).test(html)) fail(url, `tool page is missing #${id}`);
    }
  }

  if (verbose) {
    console.log(`  ok  ${pathname} — ${words} words · ${jsonLdCount} JSON-LD block(s)`);
  }

  return { pathname, words, jsonLdCount, family: family(pathname) };
}

async function main() {
  console.log(`\nSEO audit → ${base}`);
  let sitemapResponse;
  try {
    sitemapResponse = await fetch(`${base}/sitemap.xml`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (error) {
    console.error(`Could not read ${base}/sitemap.xml. Is the production server running?`);
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(2);
  }
  if (!sitemapResponse.ok) {
    console.error(`Sitemap returned HTTP ${sitemapResponse.status}.`);
    process.exit(2);
  }

  const xml = await sitemapResponse.text();
  const urls = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => decodeEntities(match[1].trim()));
  if (urls.length === 0) {
    console.error("Sitemap contains no URLs.");
    process.exit(2);
  }

  const baseUrl = new URL(base);
  const sitemapOrigins = new Set(urls.map((url) => new URL(url).origin));
  if (sitemapOrigins.size !== 1) {
    console.error(`Sitemap mixes origins: ${[...sitemapOrigins].join(", ")}.`);
    process.exit(2);
  }
  const sitemapOrigin = [...sitemapOrigins][0];
  const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
  if (sitemapOrigin !== baseUrl.origin) {
    if (localHosts.has(baseUrl.hostname)) {
      console.log(`Sitemap origin ${sitemapOrigin}; replaying its paths on ${base}.`);
    } else {
      console.error(`Sitemap origin ${sitemapOrigin} does not match audit origin ${baseUrl.origin}.`);
      process.exit(2);
    }
  }

  // Check paths on the audit origin. This lets a build configured with the
  // production origin be audited locally without editing the sitemap.
  const queue = urls.map((url) => {
    const parsed = new URL(url);
    return `${base}${parsed.pathname}${parsed.search}`;
  });
  const results = [];
  const started = Date.now();

  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (;;) {
        const url = queue.shift();
        if (!url) return;
        const result = await checkPage(url, sitemapOrigin);
        if (result) results.push(result);
      }
    }),
  );

  const byFamily = new Map();
  for (const result of results) {
    const entry = byFamily.get(result.family) ?? { count: 0, words: 0 };
    entry.count += 1;
    entry.words += result.words;
    byFamily.set(result.family, entry);
  }

  console.log("\nCoverage");
  for (const [name, entry] of [...byFamily.entries()].sort((a, b) => b[1].count - a[1].count)) {
    console.log(`  ${String(entry.count).padStart(3)}  ${name.padEnd(18)} avg ${Math.round(entry.words / entry.count)} words`);
  }

  if (warnings.length) {
    console.log(`\nWarnings (${warnings.length})`);
    for (const warning of warnings) console.log(`  ! ${warning.url}\n    ${warning.message}`);
  }

  if (failures.length) {
    console.log(`\nFailures (${failures.length} across ${urls.length} URLs)`);
    for (const failure of failures) console.log(`  ✗ ${failure.url}\n    ${failure.message}`);
    console.log(`\nResult: FAIL (${((Date.now() - started) / 1000).toFixed(1)}s)\n`);
    process.exit(1);
  }

  console.log(`\nResult: PASS — ${urls.length} URLs checked in ${((Date.now() - started) / 1000).toFixed(1)}s\n`);
}

await main();
