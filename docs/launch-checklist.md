# Production launch checklist — webtools.diy

**Origin:** `https://webtools.diy` (the v1 domain)
**Target:** v2 on a Node host. Static export is not supported: `/api/*` and the generated OG images need a runtime.
**Scope:** this runbook takes v2 from a green local build to a verified, crawlable production site. It does not
cover content expansion or ad sales.

> **Domain status — checked 2026-10-28.** `webtools.diy` returns **NXDOMAIN**. It is the v1 origin in the
> code and old docs, but it is not currently registered or resolving. Renew/register it before §2, or replace
> `webtools.diy` with the actual launch domain throughout this file. The app is domain-neutral: one
> `NEXT_PUBLIC_SITE_URL` change and a rebuild.

> **Domain decision.** `webtools.diy` is the only real origin this project has, and all 18 of its real tool pages
> already have the same path in v2. That makes it the low-risk launch target. If v2 moves to a new domain,
> treat it as a second migration: deploy v2 there, set `NEXT_PUBLIC_SITE_URL`, then 301 every v1 path from the
> old host. Never leave v1 and v2 indexable on two hosts with the same content.

---

## Stop-ship criteria

Do not announce the launch if any of these is true:

- A real v2 page (`text-analyzer`, `markdown-editor`, `qr-code-generator`) returns a 301 from an old Netlify rule.
- `/sitemap.xml` does not contain **124** URLs, or contains a redirect, 404 or `noindex` URL.
- Production returns `X-Robots-Tag: noindex`, or a page has `<meta name="robots" content="noindex">`.
- A canonical points at `localhost`, a preview host, or the wrong domain.
- `npm run audit:seo -- https://webtools.diy` fails.
- Search Console or Bing verification cannot be completed.

---

## 1. Code and content gate (T-7 to T-1)

Run from `webtools-v2`.

- [ ] Node 20+ and the lockfile are in use: `npm ci`, not `npm install`.
- [ ] `npm run typecheck` is clean.
- [ ] `npm test` passes. This includes the redirect regression tests: no live tool may be shadowed, and no
      redirect may point at another redirect.
- [ ] Production env is set for the build:

  | Variable | Value |
  | --- | --- |
  | `NEXT_PUBLIC_SITE_URL` | `https://webtools.diy` — no trailing slash |
  | `NEXT_PUBLIC_SITE_NAME` | Final brand name |
  | `NEXT_PUBLIC_CONTACT_EMAIL` | A monitored address (also fixes the `/about` and `/privacy` fallbacks) |
  | `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Only if using the URL-prefix property; otherwise leave empty |
  | `NEXT_PUBLIC_BING_SITE_VERIFICATION` | Only if verifying Bing by meta tag; otherwise leave empty |

- [ ] Build with the production origin, not localhost:

  ```bash
  NEXT_PUBLIC_SITE_URL=https://webtools.diy npm run build
  ```

  Expected: **133 static pages**, no prerender errors.

- [ ] Serve that build and run the rendered-HTML audit:

  ```bash
  NEXT_PUBLIC_SITE_URL=https://webtools.diy npm start
  npm run audit:seo -- http://localhost:3000
  ```

  Expected: **PASS — 124 URLs**. The audit replays the production sitemap paths on `localhost`, so it checks
  the same HTML without needing the domain to be live.

- [ ] Replace the launch placeholders in `app/about/page.tsx`: the ad-enquiries line and the contact fallback both
      still say the production domain is not final.
- [ ] Confirm no `.env*` file, secret, or Sanity token is in the build output.
- [ ] Decide ads: leave the house plate (no request) for launch. Do not enable a network on day one.

### Why the public env vars need a rebuild

`NEXT_PUBLIC_*` values are inlined at build time. Setting them in the host dashboard after a build does not
change canonicals, verification tags or the sitemap. Build once with the final values, or redeploy after changing
them.

---

## 2. Host and DNS (T-1)

- [ ] Confirm the launch domain is registered, renewed, and under your control. `webtools.diy` is NXDOMAIN as of
      the date above; do not start a cutover until this is resolved or the domain is replaced.
- [ ] Lower the DNS TTL to 300 seconds at least 24 hours before cutover.
- [ ] Apex (`webtools.diy`) points at the v2 host; `www` is a CNAME to the same host.
- [ ] `http://` redirects to `https://` in one hop.
- [ ] `https://www.webtools.diy/*` redirects to `https://webtools.diy/*` in one hop.
- [ ] The certificate covers both `webtools.diy` and `www.webtools.diy`.
- [ ] Keep the v1 deployment running and note its host target for rollback until v2 passes the 72-hour check.
- [ ] Do not enable HSTS preload yet. Add HSTS only after every subdomain is HTTPS-only.

### If v2 reuses the v1 Netlify site

v1's `netlify.toml` contains `force = true` redirects that run **before** the Next.js handler. Three of them now
shadow real v2 pages:

| Rule to delete | Why |
| --- | --- |
| `/tools/text-analyzer` → `/tools/unit-converter` | `text-analyzer` is a real v2 page |
| `/tools/markdown-editor` → `/tools/text-converter` | `markdown-editor` is a real v2 page |
| `/tools/qr-code-generator` → `/tools` | `qr-code-generator` is a real v2 page |

Also remove `/_next/static/*` → `/static/:splat` (it breaks the Next asset path) and `/studio/*` (the Sanity
Studio is not part of v2). Do not copy v1's catch-all or legacy sitemap into the new deployment.

Keep the two redirects for tools that still do not exist; v2 implements them in `next.config.ts`:

- `/tools/code-formatter` → `/tools/json-validator`
- `/tools/cron-scheduler` → `/tools`

---

## 3. Cutover verification (T-0, first 30 minutes)

Run these against the live origin, not localhost.

### 3.1 Real pages must be 200

```bash
for p in / /tools /tools/unit-converter /convert /blog \
         /tools/text-analyzer /tools/markdown-editor /tools/qr-code-generator \
         /tools/password-generator; do
  printf '%-34s ' "$p"
  curl -sS -o /dev/null -w '%{http_code}\n' "https://webtools.diy$p"
done
```

Expected: every line `200`.

### 3.2 Retired paths must be one-hop 301s

```bash
for p in /guides /guides/km-to-miles /guides/topics/conversions \
         /test-enhanced-system-info /tools/code-formatter /tools/cron-scheduler; do
  printf '%-34s ' "$p"
  curl -sS -o /dev/null -w '%{http_code} -> %{redirect_url}\n' "https://webtools.diy$p"
done
```

Expected:

| Request | Status | Location |
| --- | --- | --- |
| `/guides` | 301 | `https://webtools.diy/blog` |
| `/guides/km-to-miles` | 301 | `https://webtools.diy/blog/km-to-miles` |
| `/guides/topics/conversions` | 301 | `https://webtools.diy/blog/topics/conversions` |
| `/test-enhanced-system-info` | 301 | `https://webtools.diy/tools/system-info` |
| `/tools/code-formatter` | 301 | `https://webtools.diy/tools/json-validator` |
| `/tools/cron-scheduler` | 301 | `https://webtools.diy/tools` |

If any line is `308`, the rule was written with `permanent: true` instead of `statusCode: 301`. Google treats
both as permanent, but this runbook standardises on 301; change it before launch.

### 3.3 Machine surfaces

```bash
curl -sS https://webtools.diy/robots.txt
curl -sS https://webtools.diy/sitemap.xml | grep -c '<loc>'
curl -sS https://webtools.diy/llms.txt | head -5
curl -sSI https://webtools.diy/tools/unit-converter/opengraph-image | head -5
```

Expected:

- `robots.txt` allows `/`, disallows `/api/`, and ends with `Sitemap: https://webtools.diy/sitemap.xml`.
- Sitemap count: **124** (`7` base + `6` categories + `26` tools + `12` unit families + `60` pairs + `9` guides
  + `4` guide topics).
- `llms.txt` starts with the site name and includes the sitemap URL.
- The OG route returns `200` and `content-type: image/png`.

### 3.4 Indexability and canonicals

```bash
curl -sSI https://webtools.diy/ | grep -i 'x-robots-tag'          # expected: no output
curl -sS https://webtools.diy/tools/unit-converter | grep -o '<link rel="canonical"[^>]*>'
curl -sS https://webtools.diy/ | grep -Eo '<meta name="(google-site-verification|msvalidate\.01)"[^>]*>'
```

Expected: no `noindex` header, a canonical on `https://webtools.diy/tools/unit-converter`, and the verification
tags only if the corresponding env vars were set. The built-in `X-Robots-Tag` guard only knows about
`VERCEL_ENV`; on another host, add an explicit noindex to preview deployments.

### 3.5 Full audit

```bash
npm run audit:seo -- https://webtools.diy
```

Expected: **PASS — 124 URLs**, no failures. Warnings about a different canonical origin should not appear in
production.

---

## 4. Google Search Console

Do this after the origin serves 200s and the sitemap is live.

### 4.1 Add the property

Use a **Domain property** for `webtools.diy` (recommended). It covers `http`/`https` and every subdomain, so a
later host or protocol change does not require re-verification.

1. Search Console → **Add property** → **Domain**.
2. Copy the `google-site-verification=…` TXT value.
3. Add it as a TXT record at the DNS provider for `webtools.diy` (not `www`).
4. Return to Search Console and click **Verify**. DNS can take a few minutes; re-check until it passes.

If DNS access is unavailable, use a **URL-prefix property** (`https://webtools.diy/`) and the HTML-tag method:
set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` to the token, rebuild, redeploy, then verify. The token is public.

### 4.2 Submit the sitemap

1. **Sitemaps** → enter `sitemap.xml` → **Submit**.
2. The status should move to **Success** within a few hours.
3. **Discovered URLs** should approach 124. A lower number is not automatically a bug; open the sitemap and
   compare the listed URLs before changing anything.

Submit once. Google refetches sitemaps on its own schedule. Resubmit only when the URL set changes, not to
"refresh" a page.

Google retired the sitemap ping endpoint, so there is no cron job or ping URL to add. Search Console is the
supported submission path.

### 4.3 Request indexing for the priority pages

There is an unpublished daily quota. Do the home page and the six category hubs first, then the guides and top
pairs over the next two or three days. Stop when Search Console stops accepting requests.

| Priority | URLs |
| --- | --- |
| Home and indexes | `/`, `/tools`, `/convert`, `/blog` |
| Category hubs | `/categories/converters`, `/categories/calculators`, `/categories/developers`, `/categories/design`, `/categories/text`, `/categories/network` |
| Blog | `/blog/feet-to-inches-exact-factor`, `/blog/km-to-miles`, `/blog/celsius-to-fahrenheit`, `/blog/kg-to-lb`, `/blog/mbps-vs-mbs`, `/blog/kb-vs-kib`, `/blog/base64-is-not-encryption`, `/blog/json-formatting-rules`, `/blog/how-we-test-conversions` |
| Top pairs | `/convert/length/feet-to-inches`, `/convert/length/inches-to-centimetres`, `/convert/length/metres-to-feet`, `/convert/length/kilometres-to-miles`, `/convert/length/miles-to-kilometres`, `/convert/weight/kilograms-to-pounds`, `/convert/weight/pounds-to-kilograms`, `/convert/temperature/celsius-to-fahrenheit`, `/convert/temperature/fahrenheit-to-celsius`, `/convert/data/megabytes-to-gigabytes` |
| Tools with existing links | `/tools/unit-converter`, `/tools/percentage-calculator`, `/tools/json-validator`, `/tools/base64-encoder` |

Do **not** use **Removals** for v1 URLs. The 301s handle retirement. Removals are for urgent de-indexing, not
migration.

### 4.4 Read the coverage report correctly

Check **Page indexing** after 72 hours.

| Reason | What it means | Action |
| --- | --- | --- |
| Discovered — currently not indexed | Queued, normal for a new site | Wait; do not resubmit |
| Crawled — currently not indexed | Google saw it and chose not to index | Improve unique content or internal links; do not resubmit |
| Excluded by `noindex` | A header or meta tag is wrong | Fix the tag; recheck production |
| Alternate page with proper canonical tag | Canonical points elsewhere | Confirm the canonical is intentional |
| Soft 404 | Page looks empty or error-like | Add the answer and explanation above the fold |
| Server error (5xx) | Host/runtime failure | Fix the server before requesting anything |
| Redirect error | Chain or loop | Check `next.config.ts` and Netlify rules |
| Blocked by robots.txt | Rule is too broad | Fix `app/robots.ts`, not the sitemap |

---

## 5. Bing Webmaster Tools

Bing is a smaller source of traffic, but it is cheap to cover and Bing powers some assistant and desktop
surfaces.

- [ ] Go to Bing Webmaster Tools and choose **Import from Google Search Console** (fastest; it imports sites and
      verification). If that is unavailable, add `https://webtools.diy` manually.
- [ ] Verify by DNS or by setting `NEXT_PUBLIC_BING_SITE_VERIFICATION` and redeploying. The meta tag name is
      `msvalidate.01`.
- [ ] **Sitemaps** → submit `https://webtools.diy/sitemap.xml`.
- [ ] Confirm the sitemap reports URLs discovered, not an error.

IndexNow is optional. v2 does not ship an IndexNow key route; Bing will still discover the sitemap. Add IndexNow
later only if you will maintain the key and the submission job.

---

## 6. Sitemap rules

- One sitemap, 124 URLs. No sitemap index is needed below 50,000 URLs.
- Every URL comes from the same registries that render the pages. `tests/seo.test.ts` fails if a page family is
  missing, and `audit:seo` fails if a listed URL is not 200, is noindex, has a broken canonical or is thin.
- `lastmod` values are real content dates. Do not touch them to force a recrawl; Google ignores fake freshness
  and it erodes trust in the file.
- The sitemap must never contain redirects, 404s, `noindex` pages or non-canonical duplicates.
- Keep `robots.txt` pointing at the absolute sitemap URL. Search Console can discover it there, but still submit
  it explicitly so the report has a baseline.
- Re-check the sitemap after adding a tool: the count should rise by one without a code change to `app/sitemap.ts`.

---

## 7. v1 → v2 redirect map

Implemented in `next.config.ts`. Most v1 URLs need no rule because the path is unchanged.

| v1 path | v2 result | Status | Notes |
| --- | --- | --- | --- |
| 18 real v1 tool pages, e.g. `/tools/unit-converter` | same path | 200 | No redirect; verify canonical is self |
| `/tools` | `/tools` | 200 | Same |
| `/blog` | `/blog` | 200 | v1 blog path is reused by the v2 blog |
| `/blog/*` | matching `/blog/*`, else 404 | 200/404 | Guides are the only posts; see caveat below |
| `/guides`, `/guides/*` | matching `/blog`, `/blog/*` | 301 | v2 preview path; editorial surface is now `/blog` |
| `/test-enhanced-system-info` | `/tools/system-info` | 301 | Development-only route |
| `/tools/code-formatter` | `/tools/json-validator` | 301 | v1 already redirected this dead path |
| `/tools/cron-scheduler` | `/tools` | 301 | v1 already redirected this dead path |
| `/tools/text-analyzer` | same path | 200 | **Delete the v1 Netlify redirect** |
| `/tools/markdown-editor` | same path | 200 | **Delete the v1 Netlify redirect** |
| `/tools/qr-code-generator` | same path | 200 | **Delete the v1 Netlify redirect** |
| `/tools/password-generator` | same path | 200 | Was a 404 in v1; now real |
| `/tools/discount-calculator` | — | 404 | Never existed; only an internal link, now removed |
| `/tools/encryption-tool` | — | 404 | Never existed; only an internal link, now removed |
| `/studio/*` | — | 404/410 | Sanity Studio is not part of v2 |
| Any unknown v1 URL | — | 404 | Never catch-all to the home page |

### v1 `/blog` posts

The v1 audit found no visible Sanity posts, so the `/blog` path is free to serve the v2 blog. If a v1 post URL
surfaces in analytics or Search Console, map it to the closest guide or let it return 410. Do not redirect every
article to the blog index: a catch-all is a soft 404 and will be treated as one.

### Redirect hygiene

- One hop only. A redirect whose destination is another redirect fails the test suite.
- No catch-all redirect. A 404 is more honest than sending every unknown URL to the home page.
- Preserve query strings only if they change the result; otherwise a bare 301 is fine.
- Trailing slashes are normalised by Next with a 308. That is not a migration redirect and needs no rule.
- If v2 launches on a new domain, the old host needs a `_redirects` or `netlify.toml` file with the same map,
  pointing at absolute URLs on the new domain. Do not rely on the v2 app to handle the old host's requests.

---

## 8. Post-launch watch

| When | Check | Pass condition |
| --- | --- | --- |
| +1 hour | Status codes, 5xx rate, TLS, www redirect | No errors; one-hop redirects |
| +24 hours | Search Console verification, sitemap status | Verified; sitemap Success |
| +72 hours | Indexed count by family, coverage reasons | Pages are being discovered; no noindex/canonical errors |
| +7 days | Queries and impressions for pair/tool pages | At least some pair pages have impressions |
| +14 days | Crawled-not-indexed count | Trend is flat or improving; rewrite weak pages if not |
| +28 days | Query coverage of the 60 pairs | Decide the next 10 pairs from impressions, not the matrix |

Do not change URLs, canonicals or the sitemap structure during the first four weeks unless something is broken.
Early churn makes the coverage report unreadable.

Core Web Vitals: run PageSpeed Insights against the home page, one tool page and one pair page after launch. Use
field data only after traffic exists; lab data before then.

---

## 9. Rollback

- Keep the v1 deployment and DNS target until v2 has passed the 72-hour check.
- Rollback is a DNS/alias switch back to v1. If v2 remains reachable, set it to `noindex` first so two versions do
  not compete.
- Do not submit removal requests for v2 URLs during a rollback. They will return 404 when the host changes, and
  removal requests slow re-indexing if you switch forward again.
- After a rollback, fix the cause and repeat §3 before switching forward. Do not "launch again" without the full
  cutover check.

---

## 10. Launch gate — copy/paste

```bash
cd webtools-v2
npm ci
npm run typecheck
npm test
NEXT_PUBLIC_SITE_URL=https://webtools.diy npm run build
NEXT_PUBLIC_SITE_URL=https://webtools.diy npm start
npm run audit:seo -- http://localhost:3000

# after DNS points at v2
npm run audit:seo -- https://webtools.diy
```

- [ ] 133 pages built, 124 sitemap URLs, audit PASS
- [ ] Real v2 tool pages return 200; retired paths return one-hop 301s
- [ ] Canonicals on `https://webtools.diy`; no `noindex` in production
- [ ] Domain property verified in Search Console; sitemap submitted
- [ ] Bing site verified; sitemap submitted
- [ ] v1 deployment retained for 72 hours
