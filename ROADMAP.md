# WebTools v2 — build roadmap

Last reviewed: 2026-10-28. Scope: the 36 live tools at `/tools`, the 60 conversion
pairs at `/convert`, and the blog at `/blog`.

This document is deliberately opinionated. It separates what the platform can
actually sustain on Cloudflare's free plan from what would need a paid plan or a
different architecture, and it prioritises tools an LLM cannot answer from
memory: live lookups, real verification, file processing, scheduled checks and
measurements taken from the user's own connection.

---

## 1. Where the product is now

- 36 tools, 6 categories, 60 curated conversion pairs, guides and a blog.
- Ten new client-only tools shipped 2026-10-28: URL encoder, cron explainer,
  regex tester, subnet calculator, loan calculator, VAT calculator, IBAN/BIC
  validator, contrast checker, tip calculator and ISO 8601 duration parser.
  Each has a detail block, five FAQs, a reference table, a distinct icon and a
  logic test file; all of them run without a server route.
- Four upgrades shipped in the same batch: JWT HMAC verification, file hashing,
  date-to-timestamp input and birthday `.ics` export.
- Every tool page carries an answer, formula, worked examples, reference table,
  common mistakes, limits, FAQs, sources and internal links.
- Tabs now exist on 8 tools and are URL-backed: unit converter (12 categories),
  percentage calculator (6 modes), system information (5 sections), QR code
  generator (4 content types), hash generator (4 algorithms), text converter (6
  pairs), BMI (metric/imperial) and Base64 (encode/decode).
- Tab links are rendered on the server, so they are crawlable before the tool's
  JavaScript loads. The page's canonical stays on the base tool URL, so query
  variants do not compete with it.
- The site is technically clean (metadata, canonicals, sitemap, structured
  data, static generation), but authority is still the bottleneck, not markup.

The remaining gap is not "more pages". It is **unique data and repeatable
utility** — the things a chat answer cannot reproduce: today's DNS answer, the
certificate a server actually presents, the redirect chain a URL actually
returns, the bytes in a file.

---

## 1a. Implementation checklist

Use this as the live tracker. The detail lives in the sections below; an item
is only ticked when it is built, tested and verified in a browser.

### Platform

- [ ] Migrate the Next.js app to Cloudflare Workers with `@opennextjs/cloudflare`
- [ ] Keep the compressed Worker under the 3 MiB free limit
- [ ] Add the shared cache helper (Cache API + KV, explicit TTLs)
- [ ] Add the shared outbound-fetch guard (SSRF, redirects, size/time caps)
- [ ] Add rate limiting (Durable Object or D1 fixed window)
- [ ] Create the D1 schema (`lookup_cache`, `tool_runs`, `reports`, `monitors`)
- [ ] Add privacy-preserving analytics (Cloudflare or Analytics Engine)
- [ ] Add structured upstream error logging per provider
- [ ] Add the deploy-time crawl smoke test
- [ ] Reserve ad slot heights and keep CLS at zero

### SEO and authority

- [x] Server-rendered, URL-backed tabs on 8 tools
- [x] Canonical consolidation for tab query variants
- [x] Fix the stale-chunk error page with a one-time reload
- [x] Pass the SEO audit on the production build (134 URLs, 36 tool pages)
- [ ] Landing pages for the top four tab intents (temperature, discount, sha256, wifi QR)
- [ ] Unique copy, H1, examples and FAQs on every landing page
- [ ] Expand conversion pairs from 60 to ~120 with real demand
- [ ] Add author, reviewer and correction log to tool pages
- [ ] Publish the first original data asset and earn links to it
- [ ] Submit sitemaps and review query gaps monthly

### Existing tools — shipped

- [x] Fix IP refusal copy and loopback wording
- [x] Verify the 26 v1 tools against the production build
- [ ] Verify all ten new tools interactively (five checked: URL, cron, subnet, loan, contrast; JWT verify checked)
- [x] Tabs: unit converter, percentage, system info, QR, hash, text converter, BMI, Base64
- [x] Network section in System Information
- [x] Stale QR results hidden when inputs change

### Existing tools — upgrades

High value, low effort:

- [x] JWT: HS256 / HS384 / HS512 verification with a shared secret
- [ ] JWT: RS256 / ES256 verification with the issuer's public key
- [ ] DNS: record-type tabs, DNSSEC AD flag, propagation mode
- [ ] IP: ASN and network name, reverse DNS, map link
- [ ] JSON: JSON Schema validation, JSONL mode, duplicate-key detection
- [x] Hash: file hashing in the browser, with a known-digest comparison
- [x] URL/text: dedicated URL encoder and parser (shipped as a tool)
- [ ] Base64: file input, URL-safe decode, data-URI builder
- [ ] Image compressor: batch queue and ZIP, EXIF strip, AVIF/PNG output
- [ ] Markdown editor: front matter, table of contents export, print styles
- [ ] Diff checker: word-level mode, ignore options, patch export
- [ ] Colour palette: contrast for any pair and image-to-palette (the contrast
      checker now covers the pair case)
- [x] Timestamp converter: date/ISO input back to Unix time
- [x] Birthday countdown: `.ics` calendar export

Medium effort:

- [ ] Speed test: multi-stream download, upload chunking, shareable result
- [ ] System information: WebGPU adapter, permissions, export JSON
- [ ] Unit converter: precision control, custom units, copy-all table
- [ ] Test-data generator: relational datasets, locale packs, SQL dialects
- [ ] SVG editor: optimiser, accessibility checker, PNG export
- [ ] Password generator: passphrase mode, policy presets, entropy notes
- [ ] QR generator: logo, batch CSV, SVG/PDF export
- [ ] Timezone buddy: meeting-slot finder, shareable URL, DST warnings

### New client-only tools (shipped 2026-10-28)

- [x] URL encoder and parser (`lib/tools/url-encode.ts`)
- [x] Cron expression explainer (`lib/tools/cron.ts`)
- [x] Regex tester (`lib/tools/regex.ts`)
- [x] Subnet calculator, IPv4 and IPv6 (`lib/tools/subnet.ts`)
- [x] Loan and amortization calculator with CSV (`lib/tools/finance.ts`)
- [x] VAT calculator, add and remove (`lib/tools/finance.ts`)
- [x] IBAN and BIC validator (`lib/tools/finance.ts`)
- [x] Colour contrast checker with a passing suggestion (`lib/tools/color.ts`)
- [x] Tip calculator and equal split (`lib/tools/finance.ts`)
- [x] ISO 8601 duration parser and seconds builder (`lib/tools/duration.ts`)
- [x] One detail block, five FAQs, reference table and icon per new tool
- [x] 22 logic tests covering all ten tools (`tests/client-tools.test.ts`)
- [ ] Add each new tool to the search-query map and the monthly query-gap review
- [ ] Promote the strongest three (subnet, contrast, cron) with dedicated guides

### New server-backed tools

- [ ] Wave 1: DNS propagation checker
- [ ] Wave 1: SPF / DKIM / DMARC checker
- [ ] Wave 1: RDAP / WHOIS lookup
- [ ] Wave 1: HTTP header and redirect checker
- [ ] Wave 1: Open Graph preview
- [ ] Wave 1: Currency converter
- [ ] Wave 1: Security headers grader
- [ ] Wave 1: robots.txt and sitemap validator
- [ ] Wave 2: CT / SSL lookup, PageSpeed, screenshot, link checker, uptime
- [ ] Wave 3: PDF/image/email tools only if the paid budget is approved

### Mobile, desktop and local-first

- [ ] Manifest polish and install test on iOS + Android
- [ ] Service worker with build-ID cache and offline page
- [ ] Web Share Target for text and URLs
- [ ] IndexedDB drafts for the heaviest-input tools
- [ ] Desktop install instructions and manifest shortcuts
- [ ] Tauri spike: static export, file open, binary size measured
- [ ] File associations and drag-and-drop in the desktop shell
- [ ] Encrypted draft export/import
- [ ] Runtime `browser | server` flag on every tool definition
- [ ] CI builds the static export and audits it

See [docs/mobile-desktop.md](docs/mobile-desktop.md) for the strategy and
hardware requirements.

---

## 2. Platform budget (Cloudflare free plan, 2026)

These numbers decide which tools are viable. Sources are listed at the end.

| Resource | Free allowance | What it means for us |
| --- | --- | --- |
| Workers requests | 100,000/day (static assets free and unlimited) | Fine for launch; a hit tool can exhaust it. Cache aggressively, keep pages static. |
| Workers CPU | 10 ms per request | Good for fetch + JSON, bad for image/PDF/video work. Push heavy work to the browser or R2 + paid Workers. |
| Worker memory | 128 MB per isolate | Stream files; never buffer a large upload. |
| OpenNext bundle | 3 MiB compressed on Free | Audit dependencies before migrating; `qrcode`, `marked`, `js-yaml`, `zod` all count. |
| Subrequests | 50 per invocation | Caps multi-resolver DNS matrices and crawls per request. |
| D1 | 5M rows read/day, 100k rows written/day, 5 GB/account, 500 MB/database | Plenty for caching lookups and counters; use indexes, batch writes. Daily limits are enforced since 2026-09-01. |
| KV | 100k reads/day, 1k writes/day, 1 GB | Good read-through cache; the write cap rules out per-request counters. |
| R2 | 10 GB-month, 1M Class A, 10M Class B, free egress | Screenshots/exports/report artifacts; not a database. |
| Queues | 10k operations/day (~3.3k messages) | Background screenshots, crawl jobs, email — not high-volume. |
| Cron | 5 triggers, 10 ms CPU each, 15 min wall time | Enough for a small uptime monitor or daily data refresh. |
| Durable Objects | SQLite backend only on Free; 100k requests/day, 5 GB/account | Rate limiters and live counters that must be strongly consistent. |
| Browser Run | 10 minutes/day, 1 quick action per 10 s | Screenshot/preview tools are demo-scale only; paid plan for real use. |
| Workers AI | 10k neurons/day | Optional summaries; don't build a tool that depends on it. |
| Analytics Engine | 100k data points/day, 10k SQL queries/day | Product analytics without a third-party tracker. |
| Cloudflare Images | 5k transformations/month; storage/delivery need a paid plan | Not a file-conversion backend. |

**Recommendation:** treat the free plan as the launch budget, not the ceiling.
The first tool that gets traction will exceed 100k requests/day. Budget for
Workers Paid ($5/month) before promoting a server-backed tool, and keep every
page that can be static, static.

---

## 3. What "AI can't do this" actually means

A tool earns its place when at least one of these is true:

1. **It reads the live world.** DNS, RDAP, certificates, redirects, exchange
   rates, package versions, public holidays, website metadata.
2. **It verifies rather than explains.** JWT signature check, JSON Schema,
   SPF/DMARC policy validation, checksum comparison, SSL chain.
3. **It processes real bytes.** Images, CSV, PDF, EXIF, hashes, compression.
4. **It is stateful or scheduled.** Monitors, history, "what changed since
   yesterday", status pages.
5. **It measures the user's environment.** Speed, latency, IP, browser,
   screen, storage, WebGL, time zone.

Pure text transformations (case converter, lorem ipsum, word counter) are
commodity pages: useful for coverage, weak for defensibility. They should link
to the defensible tools, not be the growth bet.

---

## 4. Workstream 0 — platform foundation

Do this before adding server-backed tools at scale.

1. **Migrate Next.js to Cloudflare Workers with `@opennextjs/cloudflare`.**
   Current deployment is `next start` on a Node host. The adapter gives static
   assets, R2 cache, D1/R2 bindings and access to Cron/Queues. Check the
   compressed Worker size against the 3 MiB free limit first.
2. **One shared cache layer.** A `cachedJson(key, ttl, loader)` helper backed by
   the Cache API plus KV for cross-colo reads. DNS/RDAP/HTTP lookups must not
   hit the upstream on every request.
3. **One shared outbound-fetch guard.** Block loopback, private, link-local and
   reserved IPs, re-validate every redirect, cap redirects/bytes/time, and send
   no user cookies. This is mandatory for any "fetch this URL" tool.
4. **Rate limiting without a new vendor.** Use a Durable Object counter per
   IP+route (SQLite backend, free) or D1 with a fixed window. The KV write cap
   (1k/day) makes KV unsuitable for counters.
5. **D1 schema for tool data.** Tables: `lookup_cache` (key, payload, expires),
   `tool_runs` (day, tool, count), `reports` (id, tool, payload, created_at),
   `monitors` (later). Index by key and expiry; batch writes.
6. **Analytics that respect the privacy claim.** Cloudflare Web Analytics or
   Analytics Engine; no third-party trackers. Track tab clicks and tool runs so
   the roadmap is driven by use, not guesses.
7. **Observability.** Workers Logs + an error budget; record upstream 4xx/5xx per
   provider so a dead API is visible before users report it.
8. **Deploy-time smoke test.** Crawl every tool route and assert a 200 plus a
   non-empty tool island; the stale-chunk check already exists at runtime.
9. **Ad layout guardrails.** Keep banners between sections (no 300×250 in
   content), reserve height to protect CLS, and never load an ad before the tool
   is interactive.

---

## 5. Workstream 1 — SEO architecture

### 5.1 Tabbed tools: what is done and what is next

Done:

- Server-rendered tab links with descriptive `title` text (`Temperature
  converter`, `SHA-512 hash generator`, …).
- Query-param deep links (`?category=temperature`, `?mode=discount`,
  `?section=graphics`), shareable and back/forward safe.
- Active tab is a real ARIA tab, keyboard navigable, with a proper tab panel.
- Canonical remains the base tool URL; tab variants are not indexed as
  duplicates.

Next, in priority order:

1. **Give high-intent tabs their own static landing pages** where the query is
   distinct enough to deserve it: `/tools/percentage-calculator/discount`,
   `/tools/hash-generator/sha256`, `/tools/qr-code-generator/wifi`,
   `/tools/unit-converter/temperature`. Each needs unique H1, intro, worked
   examples, 3+ FAQs, and links both ways. Do **not** clone the parent page:
   duplicate shells are the thin-content risk the v1 audit flagged.
2. **Keep `/convert/<category>` as the unit-converter landing family.** It
   already links into the unit converter tab. Add a visible "open in the
   converter" link from every conversion pair page.
3. **Expand conversion pairs from 60 to the top ~200 queries**, each with real
   demand, a formula, a table and unique notes. Do not generate pairs nobody
   searches for.
4. **Tab-aware internal links.** Related-tools cards should point at the most
   relevant tool view where possible (e.g. a temperature guide links to
   `?category=temperature`).
5. **Measure tab usage.** Which tabs are opened, from which page, with which
   query. Promote the winners to landing pages; demote the rest.

### 5.2 Query targeting per tool

Every tool needs one primary query, one secondary cluster, and content that
answers the query above the fold. Example clusters:

| Tool | Primary | Secondary |
| --- | --- | --- |
| Unit converter | unit converter | temperature converter, kg to lbs, cm to inches |
| Percentage | percentage calculator | percent off, percentage increase, markup |
| Hash | sha256 generator | sha512, checksum, hash text |
| QR | qr code generator | wifi qr code, vcard qr, url qr |
| DNS | dns lookup | mx lookup, txt record, dns propagation |
| IP | what is my ip | ip lookup, asn lookup, ip geolocation |
| Speed test | internet speed test | download speed, upload speed, ping test |

### 5.3 Authority work (the real bottleneck)

- Publish original data assets: "DNS TTL survey", "most common SPF mistakes",
  "certificate lifetimes after the 47-day rule". Linkable data earns links;
  tool pages alone rarely do.
- Every server-backed tool should show a **last checked** timestamp and a
  methodology note. Freshness is a trust signal and a reason to return.
- Add author/reviewer identity and a corrections log. The About page already
  describes the methodology; make it visible on tool pages.
- Search Console + Bing Webmaster, sitemap submission, and a monthly query-gap
  review. Track impressions per URL, not just totals.

---

## 6. Workstream 2 — upgrades to the existing 26 tools

Grouped by effort, not by category.

### High value, low effort

| Tool | Upgrade |
| --- | --- |
| DNS lookup | Record-type tabs (A/AAAA/MX/TXT/CNAME/NS), DNSSEC AD flag, "propagation" mode across 5 resolvers. |
| IP lookup | ASN and network name, reverse DNS, map link, "is this IP in a known range" note. |
| JWT decoder | **Verify** HS256/RS256 signatures with a key, not just decode. This is a real AI gap. |
| JSON validator | JSON Schema validation, JSONL mode, duplicate-key detection. |
| Hash generator | File hashing by streaming; BLAKE2/BLAKE3 if a small wasm fits. |
| URL/text tools | Add a proper URL encoder/parser (query params, punycode, IDN). |
| Base64 | File → Base64 with size cap shown, URL-safe decode, data-URI builder. |
| Image compressor | Batch queue + ZIP, EXIF strip toggle, AVIF/PNG output, before/after slider. |
| Markdown editor | Front-matter support, table of contents export, print stylesheet. |
| Diff checker | Word-level diff toggle, ignore-whitespace options, export patch. |
| Color palette | Contrast checker for any pair, export Tailwind/SCSS, image → palette (client). |
| Timestamp converter | Date → timestamp input, timezone picker, batch conversion. |

### Medium effort

| Tool | Upgrade |
| --- | --- |
| Speed test | Multi-stream download, percentile reporting, upload chunking, shareable result image. |
| System information | WebGPU adapter, permissions state, media capabilities, font detection, export JSON. |
| Unit converter | Currency-like precision controls, custom unit entry, copy-all table. |
| Test data generator | Relational datasets (users + orders), locale packs, SQL dialect options. |
| SVG editor | Optimizer (SVGO in browser), accessibility checker, PNG export. |
| Password generator | Passphrase mode (EFF wordlist), policy presets, entropy explanation. |
| QR generator | Logo embedding, frame/label, batch CSV → ZIP, SVG/PDF export. |
| Birthday countdown | Calendar export (.ics), shareable link, timezone-aware midnight. |
| Timezone buddy | Meeting-slot finder with a shareable URL, DST change warnings. |

### New server-backed capabilities on existing pages

- **DNS**: propagation matrix, DNSSEC chain status, "why is my record not
  showing" diagnosis.
- **IP**: abuse/reputation summary only if a licensed source is used; do not
  scrape.
- **Speed test**: server selection by colo, result history in D1 opt-in.
- **System info**: "share this report" URL (encrypted payload in the fragment,
  never stored server-side).

---

## 7. Workstream 3 — new tools (the growth bet)

Each row names the query, why an LLM cannot answer it, the data source, and the
Cloudflare primitive that makes it affordable. Effort: S (≤2 days), M (3–5),
L (1–2 weeks).

### Wave 1 — launch next (all fit the free tier with caching)

| Tool | Query | Why AI can't | Source | CF blocks | Effort |
| --- | --- | --- | --- | --- | --- |
| DNS propagation checker | dns propagation checker | Needs today's answers from multiple resolvers | Cloudflare/Google/Quad9 DoH | Worker fetch + Cache API (5–8 subrequests) | M |
| SPF / DKIM / DMARC checker | dmarc checker, spf checker | Reads live TXT records and validates policy syntax | DoH TXT (`_dmarc`, selector `_domainkey`) | Worker + cache + parser tests | M |
| WHOIS / RDAP lookup | whois lookup, domain owner | Registry data changes daily; RDAP is authoritative | rdap.org + IANA bootstrap; 10 req/10 s | Worker + KV/D1 cache 24 h | M |
| HTTP header & redirect checker | http header checker, redirect checker | Must fetch the URL and see the real chain | Direct fetch, manual redirects | Worker + SSRF guard + cache 5 min | S–M |
| Open Graph preview | open graph preview, link preview | Fetches live metadata and renders a card image | Target HTML + `ImageResponse` | Worker + R2/cache for images | M |
| Currency converter | currency converter | Rates change; an LLM's answer is stale | ECB daily XML or exchangerate.host | Worker + cache 1 h + D1 history | S–M |
| Website security headers grader | security headers checker | Grades actual response headers | Direct fetch | Worker + cache + report URL | M |
| robots.txt & sitemap validator | robots txt checker | Parses the live file and reports conflicts | Target site | Worker + parser + cache | S–M |

### Wave 2 — after the first traffic signal

| Tool | Query | Why AI can't | Source | CF blocks | Effort |
| --- | --- | --- | --- | --- | --- |
| SSL certificate / CT lookup | ssl checker, certificate transparency | Live certificate data and CT logs | SSLMate CT API (100/h free) or crt.sh (best-effort) | Worker + cache + D1 | L |
| PageSpeed / Core Web Vitals | pagespeed test, core web vitals | Runs a real audit against the URL | PageSpeed Insights API (key) | Worker + queue + cache | M–L |
| Website screenshot | website screenshot | Renders the live page | Browser Run (10 min/day free) | Worker + Queue + R2 | M |
| Broken link checker | broken link checker | Crawls and verifies each link | Direct fetch | Queue + D1 + strict caps | L |
| Uptime monitor | uptime monitor | Scheduled checks over time | Direct fetch + Cron | Cron + D1 + email provider | L |
| JWT signature verifier | jwt verify signature | Real cryptographic verification | WebCrypto in browser | None (client) | S |
| JSON Schema validator | json schema validator | Deterministic validation | Ajv in browser | None (client) | S |
| Package version checker | npm package latest version | Registry state changes daily | npm registry | Worker + cache 6 h | S |
| Currency + crypto portfolio? | — | Skip until the single-rate tool proves demand | — | — | — |

### Wave 3 — only with paid Workers or a clear sponsor

| Tool | Why it needs more | Constraint |
| --- | --- | --- |
| Image format conversion / PDF merge | CPU-heavy, large files | 10 ms CPU, 128 MB, 3 MiB bundle; move to client wasm or paid |
| Bulk screenshot / monitoring | Browser Run | 10 min/day is demo-scale |
| Email deliverability / inbox placement | SMTP port 25 blocked | Requires a mail vendor |
| Domain availability + registration | Registrar partnership | Not a free API |
| Live website crawler / SEO audit | Many subrequests | 50 subrequests, 100k requests/day |

### Client-only tools worth adding (no backend, no limits)

- URL encoder / parser, cron expression explainer, regex tester.
- JSON ↔ YAML/TOML/XML (extend the existing converter), JSON Schema.
- EXIF viewer/remover, image metadata, favicon extractor (fetch via Worker).
- IBAN / SWIFT / phone number validators (checksum + library, no API).
- Loan/amortization, tip split, VAT, salary calculators (deterministic math).
- Color blindness simulator, contrast checker from an uploaded image.
- Subnet calculator (IPv4/IPv6), CIDR range visualiser.
- Timestamp batch converter, ISO 8601 duration parser.

---

## 8. Sequenced plan

### Now → 4 weeks

1. Platform: OpenNext migration spike, cache helper, fetch guard, D1 schema,
   rate limiter, analytics events.
2. SEO: landing pages for the top 4 tab intents (temperature, discount,
   sha256, wifi QR); internal links from `/convert` into unit-converter tabs.
3. Tools: DNS propagation, HTTP header/redirect checker, RDAP lookup.
4. Measurement: Search Console, sitemap resubmission, tab-usage dashboard.

### 4 → 8 weeks

1. SPF/DMARC checker, OG preview generator, currency converter.
2. Existing-tool upgrades: JSON Schema and the remaining per-tool backlog;
   JWT HMAC verification and file hashing are already shipped.
3. Authority: first original data post, methodology page, corrections log.
4. Expand top conversion pairs from 60 to ~120 with real demand.

### 8 → 12 weeks

1. CT/SSL lookup, PageSpeed audit, screenshot (rate-limited, paid if needed).
2. Uptime monitor as a waitlist feature.
3. Conversion-pair expansion to ~200; programmatic pages only where the query
   exists and the content is genuinely different.
4. Review whether Workers Paid is required by traffic; publish the decision.

### Acceptance criteria for any new tool

- One primary query, one H1, a direct answer above the fold.
- Unique data or processing that an LLM cannot reproduce.
- A visible "last checked" and a methodology/limits note.
- Cached response with a stated TTL; upstream failures handled explicitly.
- Rate limit and input caps; no SSRF, no open proxy.
- Internal links in and out; included in sitemap; structured data where valid.
- Works without JavaScript for the static explanation; the tool itself must
  work on mobile and with the keyboard.

---

## 9. Metrics

- Organic impressions/clicks per URL (Search Console), not just site totals.
- Tool runs per 1,000 visits; tab click-through per tool.
- Server-backed tools: cache hit rate, upstream error rate, p95 latency.
- Return visits in 7/30 days — the signal that a tool is a habit, not a one-off.
- Core Web Vitals on tool pages (LCP < 2.5 s, CLS < 0.1, INP < 200 ms).
- Revenue per 1,000 sessions with ad layout held constant.

---

## 10. Risks and limits

- **Free-tier cliffs.** 100k requests/day and 10 ms CPU are easy to hit. Cache,
  and price the paid plan into any promotion.
- **Third-party dependency.** RDAP, DoH, SSLMate and PageSpeed can rate-limit
  or change terms. Cache, degrade gracefully, and show the source and time.
- **Abuse.** Any "fetch this URL" tool is an SSRF and proxy target. The guard
  and rate limiter are prerequisites, not polish.
- **Thin programmatic pages.** More pairs and more views only help if each has
  unique, useful content. The v1 audit's warning still applies.
- **Screenshot/PDF/video expectations.** The free plan cannot be a general
  file-conversion backend. Be explicit about limits, or don't ship the tool.
- **Ads vs. trust.** Keep the existing format rules: banners between sections,
  none inside the tool panel, reserved space, no layout shift.

---

## 11. Sources

Platform limits:

- Workers limits — https://developers.cloudflare.com/workers/platform/limits/
- Workers pricing — https://developers.cloudflare.com/workers/platform/pricing/
- D1 limits — https://developers.cloudflare.com/d1/platform/limits/
- D1 pricing — https://developers.cloudflare.com/d1/platform/pricing/
- D1 free-tier enforcement (2026-09-01) — https://developers.cloudflare.com/changelog/post/2026-09-01-d1-free-tier-limit-enforcement/
- R2 pricing — https://developers.cloudflare.com/r2/pricing/
- KV limits — https://developers.cloudflare.com/kv/platform/limits/
- Queues pricing — https://developers.cloudflare.com/queues/platform/pricing/
- Cron Triggers — https://developers.cloudflare.com/workers/configuration/cron-triggers/
- Durable Objects pricing — https://developers.cloudflare.com/durable-objects/platform/pricing/
- Browser Run limits — https://developers.cloudflare.com/browser-run/limits/
- Workers AI pricing — https://developers.cloudflare.com/workers-ai/platform/pricing/
- OpenNext on Cloudflare — https://opennext.js.org/cloudflare

Data sources and terms:

- RDAP.org — https://about.rdap.org/
- IANA RDAP bootstrap — https://www.iana.org/assignments/rdap-dns
- Cloudflare DoH JSON — https://developers.cloudflare.com/1.1.1.1/encryption/dns-over-https/make-api-requests/dns-json/
- Google DoH — https://developers.google.com/speed/public-dns/docs/doh/json
- SSLMate CT API — https://sslmate.com/ct_search_api/
- PageSpeed Insights — https://developers.google.com/speed/docs/insights/v5/get-started
- CrUX API — https://developer.chrome.com/docs/crux/api
- ipwho.is — https://ipwhois.io/documentation
- IPinfo Lite — https://ipinfo.io/lite
- ScreenshotOne — https://screenshotone.com/pricing/
- Workers TCP sockets (port 25 restriction) — https://developers.cloudflare.com/workers/runtime-apis/tcp-sockets/
