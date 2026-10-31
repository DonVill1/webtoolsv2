# webtools v2

A document-first reference site for conversions, calculations, encoding and inspection. Every indexable
page is server-rendered: title, answer, formula, limits, FAQs and structured data are in the HTML before
JavaScript runs. The interactive tool is an island.

- **36 tools**, **60 curated conversion pages**, **12 conversion hubs**, **6 category hubs**, **9 guides**
- **143 static pages** in the production build, **134 sitemap URLs**
- **Ten client-only tools** with no server route: URL, cron, regex, subnet, loan, VAT, IBAN/BIC,
  contrast, tip and ISO 8601 duration
- **Banner ads** between content sections and in the desktop rail, with reserved height and a house fallback
- **116 tests** covering maths, content contracts, client tools and SEO surfaces

Read the reasoning in [docs/audit-v1.md](docs/audit-v1.md), the implementation rules in
[docs/v2-blueprint.md](docs/v2-blueprint.md), and the release steps in
[docs/launch-checklist.md](docs/launch-checklist.md).

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript strict
- Tailwind 4 + hand-written component CSS over Nexus tokens (`app/tokens.css`, `packages/nexus-uxui`)
- Vitest for logic and contract tests
- No UI, icon, animation or state library
- Server routes use Node runtime for DNS, IP and speed measurement

## Run

```bash
npm install
cp .env.example .env.local     # optional for local development
npm run dev                    # http://localhost:3000
```

Production check:

```bash
npm run build
npm start                      # keep this running in another terminal
npm run audit:seo              # crawls the sitemap and checks the rendered HTML
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (prerenders 133 pages) |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Vitest: units, content contract, sitemap/metadata/schema, text conversion |
| `npm run audit:seo` | Audit a running production server against `/sitemap.xml` |

`audit:seo` accepts a base URL and a verbose flag:

```bash
npm run audit:seo -- http://localhost:3100 --verbose
```

It checks HTTP 200, HTML content type, title length, description length, canonical path, robots meta,
exactly one `<h1>`, `<html lang>`, JSON-LD presence and minimum word counts per page family. Sitemap paths are
replayed on the target base, so a build configured with the production origin can be audited locally. Exit
code 1 means at least one failure.

## Structure

```
app/
  page.tsx                       home
  tools/[slug]/                  tool detail (SSG) + OG image route
  categories/[category]/         category hubs
  convert/[category]/[pair]/     curated conversion pages + OG image
  guides/[slug]/                 long-form guides
  api/{dns,ip,speedtest}/        the only server routes that touch the network
  sitemap.ts robots.ts manifest.ts llms.txt/
components/
  layout/                        header, footer, breadcrumbs
  home/                          search + tool index
  tools/                         one client island per tool + ToolIsland registry
  ui/                            CopyButton, Icon, AdSlot
lib/
  content/                       categories, tools, guides (typed copy)
  units/                         registry, curated pairs, hrefs
  seo/                           metadata builder, JSON-LD builders
  tools/text-formats.ts          format conversion engine
packages/nexus-uxui/             vendored design engine (tokens, fit, regions)
scripts/audit-seo.mjs            rendered-HTML audit
tests/                           Vitest suites
docs/                            v1 audit, v2 blueprint
```

## Add a tool

1. Add a `ToolDefinition` in `lib/content/tools/<category>.ts` with title ≤ 60 chars, description
   110–160 chars, intro, how-it-works, example, limits, three FAQs and at least two related slugs.
2. Add the answer, reference table, two common mistakes, sources and two extra FAQs in
   `lib/content/tool-details.ts`.
3. Add the island in `components/tools/<slug>.tsx` and register it in
   `components/tools/ToolIsland.tsx`.
4. Add maths tests if the tool computes anything (`tests/units.test.ts` or a new file).
5. Run `npm test` and `npm run typecheck`.
6. Build, serve and run `npm run audit:seo`.

`tests/content.test.ts` fails if a tool has no island, a dangling related link, too few FAQs, a
missing tool-detail entry or a description outside the search-display range. The sitemap picks the
tool up automatically when `status: "live"`.

## Content rules

- The answer comes before the explanation: number, formula, then caveat.
- State what the tool does **not** do. BMI is a screen, base64 is not encryption, geolocation is
  approximate.
- No keyword lists. No generated pair pages. Pairs are added one at a time, with distinct copy.
- Guides ship when they answer a question the tools raise, not to keep a blog warm.

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Production | Canonical origin, no trailing slash |
| `NEXT_PUBLIC_SITE_NAME` | No | Brand name in titles, schema and header |
| `NEXT_PUBLIC_CONTACT_EMAIL` | No | Address shown on `/about` and `/privacy` |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | No | Google Search Console HTML-tag token |
| `NEXT_PUBLIC_BING_SITE_VERIFICATION` | No | Bing Webmaster `msvalidate.01` token |
| `NEXT_PUBLIC_ANALYTICS_ID` | No | GA4 id; empty = no tracker and no consent banner |
| `SANITY_REVALIDATE_SECRET` | No | Shared secret for `POST /api/revalidate` |

If `NEXT_PUBLIC_SITE_URL` is missing in production the app throws at startup rather than emitting
canonicals pointing at `localhost`. Preview deployments on Vercel send `X-Robots-Tag: noindex`.

## Server routes

| Route | Upstream | Notes |
| --- | --- | --- |
| `GET /api/dns?name=&type=` | Cloudflare DNS-over-HTTPS | Validated domain + record type, cached 5 min |
| `GET /api/ip?ip=` | ipwho.is | Empty `ip` uses the connection address; self responses are `no-store` |
| `GET /api/speedtest?bytes=` | none | Returns 0–4 MB of octets, `no-store` |
| `POST /api/speedtest` | none | Echoes the received byte count |
| `POST /api/revalidate` | none | Header secret, revalidates index and slug paths |

These are the only routes that leave the process. Every other tool runs entirely in the browser; the
[privacy page](app/privacy/page.tsx) lists them.

## Deploy

Any Node host that supports Next.js App Router works (Vercel is the default; Netlify with the Next
runtime also works). Build with the production `NEXT_PUBLIC_SITE_URL`, then run the audit against the
deployed origin before submitting the sitemap.

Static export is not supported: `/api/*` routes and generated OG images need a server runtime.
