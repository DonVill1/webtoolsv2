# webtools v2 — blueprint

**Thesis:** be the reference site for a small set of web tasks, not the biggest tool directory.
Accuracy, a fast server-rendered page, and one URL per task. Everything else is secondary.

Shipped in this repository: 26 tools, 60 curated conversion pages, 18 hubs, 9 guides, 133 static pages,
one ad slot, zero client-only metadata.

---

## 1. Positioning

| v1 | v2 |
| --- | --- |
| "Ultimate platform for web tools" | "Reference-grade tools for conversions, encoding and inspection" |
| App shell with a tool launcher | Document site with tool islands |
| One URL per tool | One URL per task (tool, pair, hub, guide) |
| Metadata as an afterthought | Metadata generated from the same typed content |
| Breadth as the goal | Depth on tasks with recurring demand |

The niche is not "all tools". It is the tasks where a wrong answer is costly: unit conversion, data
sizes, encoding, hashing, timestamps, DNS, IP, colour contrast. Those reward precision and explanation.

---

## 2. Information architecture

```
/                                   home: search, six categories, featured tools
/tools                              full index, filterable
/tools/[slug]                       26 tool pages
/categories/[category]              6 category hubs
/convert                            12 measurement families
/convert/[category]                 12 conversion hubs
/convert/[category]/[pair]          60 curated pair pages
/blog                                blog index (guides and explainers)
/blog/[slug]                        9 long-form guides
/blog/topics/[topic]                4 topic pages
/about /privacy /terms              trust pages
/sitemap.xml /robots.txt /llms.txt  machine surfaces
```

### URL rules

- A tool owns one intent: `/tools/unit-converter` is the general converter, not "every conversion".
- A pair owns one task: `/convert/length/feet-to-inches`. Category first so the hierarchy is legible and
  the hub can link down with context.
- Pairs are **curated**, not generated. Sixty ordered pairs, each with real demand and a distinct
  explanation. The reverse direction is a separate page only when it is separately searched.
- Blog guides own questions, not tools: `/blog/kb-vs-kib`, not `/tools/unit-converter/kb-vs-kib`.
- No parameterised duplicates, no `/tools/x/function/y` nesting, no empty combinations.

### Internal linking contract

Every page has one job in the link graph:

- **Home** → categories, featured tools, top pairs, latest guides.
- **Tool** → its category, its conversion family, 3 related tools, up to 4 guides.
- **Pair** → its family hub, both unit tools, the reverse pair when curated, 6 sibling pairs, the relevant guide.
- **Hub** → all tools or pairs in the family, plus the relevant guide.
- **Guide** → the tools and pairs it explains.

Breadcrumbs appear on every non-home page and emit `BreadcrumbList`. Related blocks are capped at
three so they stay useful instead of becoming a link dump.

---

## 3. Content model

One source of truth per concern:

| Concern | File | Invariant |
| --- | --- | --- |
| Tool identity + copy | `lib/content/tools/*.ts` | `ToolDefinition`, validated at test time |
| Categories | `lib/content/categories.ts` | six categories, stable slugs |
| Guides | `lib/content/guides.ts` | body > 800 chars, related tools must exist |
| Maths | `lib/units/registry.ts` | exact factors, functions, no copy |
| Curated pairs | `lib/units/registry.ts` | 60 ordered pairs, unique slugs |
| Site identity | `lib/site.ts` | one env change renames the site |

A `ToolDefinition` carries:

- `slug`, `name`, `category`, `intent`
- `seo.title` (≤ 60 chars), `seo.description` (110–160 chars)
- `content.intro`, `howItWorks[]`, `examples[]`, `limits`, `faqs[3+]`
- `related[2+]`, `og`, `status`, `added`, `updated`

`validateTools()` runs in tests and fails on: duplicate slugs, long titles, out-of-range descriptions,
fewer than three FAQs, missing examples, missing limits, unknown related slugs, self-links.

The unit registry stores conversion **functions**, not prose. An editor cannot make a conversion wrong by
editing copy, and a copy change cannot silently alter a factor.

---

## 4. SEO engineering

### 4.1 Metadata

`lib/seo/metadata.ts` is the only place a page assembles title, description, canonical, robots and
social tags. Titles are absolute so the layout template cannot push them past the display limit.
Descriptions are never auto-truncated from body copy.

Every page exports `metadata` from `buildMetadata()`. Tool and pair pages also generate OG images at the
edge from the same definition (`opengraph-image.tsx`), so there are no missing `/images/og-*.jpg` files.

### 4.2 Structured data matrix

| Page | Types |
| --- | --- |
| All | `BreadcrumbList` |
| Home | `Organization`, `WebSite` |
| Tool | `SoftwareApplication`, `FAQPage` |
| Pair | `WebApplication`, `FAQPage`, `BreadcrumbList` |
| Guide | `Article` |
| Category / index | `ItemList` |

All JSON-LD is rendered in the server component. Tests assert the types and required fields.

### 4.3 Crawl surfaces

- `app/sitemap.ts` derives URLs from the same registries as the pages. A page cannot exist without a
  sitemap entry, and a sitemap entry cannot point at a missing page.
- `app/robots.ts` allows everything except `/api/`.
- `app/llms.txt/route.ts` publishes a compact map for AI assistants, with the canonical tool and guide
  URLs and a note that the pages are server-rendered.
- Preview deployments send `X-Robots-Tag: noindex` when `VERCEL_ENV` is not production.

### 4.4 Content rules

- The answer appears above the explanation. Number, formula, limits, then background.
- Every tool states what it does **not** do (BMI is not a diagnosis; base64 is not encryption; geolocation
  is approximate).
- FAQs answer the query, not the brand. No "Why choose us?".
- No keyword lists, no location pages, no generated combinations.
- Guides are 800+ words with a real argument, linked back to the tools they explain.

### 4.5 Measurement

- Search Console + Bing Webmaster, sitemap submitted once, then left alone.
- Index coverage by family (tools, pairs, guides, hubs), not a single site-wide number.
- Query-level impressions for pair pages; CTR for titles; position for hubs.
- Core Web Vitals field data after traffic exists; lab budget before launch.
- No analytics by default. If `NEXT_PUBLIC_ANALYTICS_ID` is set, consent defaults to denied and IP
  anonymisation is on.

---

## 5. UX and design system

The design language is **document mode**: a measured column, a persistent mono label system, hairline
rules, one accent, no cards floating on gradients. Nexus tokens are vendored in
`packages/nexus-uxui`; the site consumes the token families, not raw hex values.

Page skeleton (tool):

1. Breadcrumb + tool code.
2. H1, one-sentence dek, last-updated line.
3. The tool island, in a bordered panel. Input first, result in a readout with a formula.
4. Limits callout.
5. How it works, worked examples, FAQ.
6. One ad plate.
7. Related tools + guides.

Interaction rules:

- Every input has a label, not a placeholder.
- Results are announced with `aria-live="polite"` and are selectable text.
- Copy buttons copy the result and the working, not the whole page.
- Units are text, not spinners; invalid input produces a dash, never `NaN`.
- Keyboard order follows visual order; focus rings use the token ring, not `outline: none`.
- Reduced motion is respected globally.

---

## 6. Advertising

The v1 site had sponsored sections woven through the template. v2 constrains inventory:

- **One banner below the tool, then one between each content section** (728×90 desktop, 320×100
  mobile), so the inventory reads as section breaks rather than interruptions inside a section.
- **Wide screens only:** two 120×600 rails appear at 1400px and up; below that the content column
  keeps its full width and no side inventory renders.
- **Reserved height** from the slot registry, so there is no layout shift.
- **Labelled** `AD` or `SLOT AVAILABLE`, never disguised as a result or a related link.
- **House fallback makes no network request.** Until a sponsor is configured, the plate is a static
  panel that links to the advertising policy.
- **No interstitials, pop-unders, auto-play video, or creative that can navigate the top frame.**
- Results and calculations are never for sale. A sponsor cannot change a number.

The current implementation is `components/ui/AdSlot.tsx` with a `slot` id; the Cascade Ads router can be
wired behind it without changing page code.

---

## 7. Performance budget

| Metric | Budget |
| --- | --- |
| Server HTML per tool page | < 60 KB compressed |
| First-load JS per tool page | < 120 KB compressed |
| LCP (lab, throttled) | < 2.0 s |
| CLS | < 0.02 |
| Fonts | two families, `display: swap`, self-hosted via `next/font` |

Choices that protect the budget:

- Server components render all copy; only the tool island is client-side.
- Tool islands are `next/dynamic` code-split by slug, so visiting the unit converter does not download
  the QR encoder.
- `qrcode` is imported on click, not at module load.
- No icon library; ten inline SVG paths.
- No animation library; CSS transitions on tokens only.
- Images are generated OG routes, not committed JPEGs.

---

## 8. Accessibility

- One `h1` per page; heading levels never skip.
- Landmarks: header, nav, main, footer; skip link first in tab order.
- Contrast: ink on surface and accent on surface meet WCAG AA for body text; the palette is checked in
  the colour tool itself.
- Forms: label + input pairs, `aria-invalid` on error, errors in text not colour alone.
- Tables: captions or `aria-label`, `th` scope where a header exists.
- Motion: `prefers-reduced-motion` disables transitions and smooth scroll.
- The site ships one light theme with `color-scheme: light`, so native controls match the page. No theme toggle; no half-finished dark mode.

---

## 9. Migration and launch

### Redirects

Most v1 tool URLs survive unchanged (`/tools/unit-converter`, `/tools/base64-encoder`, …). Add 301s for:

| v1 | v2 |
| --- | --- |
| `/tools` | `/tools` (same) |
| `/guides` and `/guides/*` | `/blog` and matching guides where one exists |
| `/blog` and `/blog/*` | same path; guides are the posts |
| `/tools/password-generator` (404 in v1) | `/tools/password-generator` (now real) |
| `/tools/encryption-tool` (never existed) | remove the link; do not redirect to a lie |
| `/tools/discount-calculator` (never existed) | remove the link |

Do **not** redirect every old matrix URL to the converter home; that is a soft 404. If a v1 URL had no
real page, let it 404 and fix the internal link.

### Launch checklist

1. Set `NEXT_PUBLIC_SITE_URL` to the production origin, no trailing slash.
2. `npm run build`, `npm start`, `npm run audit:seo` — must pass.
3. Verify `robots.txt` allows crawl and the sitemap URL is absolute.
4. Submit sitemap in Google Search Console and Bing Webmaster Tools.
5. Request indexing for the home page, six categories, the top ten pairs and the nine guides.
6. Check `site:` after two weeks; if pages are excluded, read the reason in GSC before changing anything.
7. Add the site to a real analytics property only after consent UX is verified.
8. Earn the first ten links by being useful: answer threads with the pair page, publish the KB vs KiB
   guide, get listed in tool directories that are curated.

### What not to do

- Do not buy backlinks or submit to auto-approve directories.
- Do not generate 380 pair pages to "cover" the matrix. Publish the next ten pairs when each has an
  explanation that differs.
- Do not add a blog for the sake of freshness. A guide ships when it answers a question the tools raise.
- Do not gate results, require sign-up, or interrupt with a modal.

---

## 10. Roadmap

### Phase 0 — shipped in this repo

- 26 tools with typed content and islands.
- 60 curated pairs, 12 conversion hubs, 6 category hubs.
- 9 guides, 4 topic pages.
- Metadata, schema, sitemap, robots, llms.txt, OG routes.
- One ad slot with house fallback.
- 43 tests, SEO audit script, production build of 133 pages, 124 sitemap URLs.

### Phase 1 — prove the model (weeks 1–4)

- Deploy, verify indexing, fix any coverage exclusions.
- Add 10 more curated pairs chosen by Search Console impressions, not by matrix completeness.
- Conversion guides for km/miles, Celsius/Fahrenheit, Mbit/s vs MB/s and kg/lb are shipped; add the next guide only when Search Console shows a question cluster without a page.
- Add a "recently updated" surface only if it can be generated from real dates.

### Phase 2 — authority (weeks 5–12)

- One substantial reference page per measurement family: definitions, SI history, common errors.
- A conversion API endpoint with documented limits, free for low volume; this earns developer links.
- Citations: link to NIST SP 811, BIPM SI brochure, IANA tz database, RFC 4648. Outbound citations are a
  trust signal, not a leak.
- Measure query coverage: how many of the 60 pairs have impressions? Prune or rewrite the rest.

### Phase 3 — revenue (after traffic exists)

- Turn on one sponsor plate per page; keep the house fallback for unsold inventory.
- Sell placements by family (conversion, developer, network), not by page, with a frequency cap.
- Never sell the result area. If a sponsor wants integration, it goes in the labelled plate.
- Revisit ads only when the site has consistent organic sessions; ads before traffic just add weight.

---

## 11. Open decisions

1. **Brand and domain.** The build is brand-neutral (`NEXT_PUBLIC_SITE_NAME`). Choose a domain with a
   clean history; a new TLD is fine if the content earns links, but `.diy` made v1 harder to trust.
2. **CMS.** Content is typed in-repo today. Sanity is wired for revalidation but not required. Keep it
   out until a non-engineer edits copy weekly; otherwise it is another failure surface.
3. **Analytics.** Empty by default. Choose a privacy-first provider or stay with server logs; do not add
   a pixel "to see what happens".
4. **Ad network.** The slot is network-agnostic. Choose one that allows a reserved-size, single-slot
   layout and does not inject pop-ups. The policy is stricter than most networks' defaults.
5. **API.** A public conversion API is the strongest link-earning asset in the plan, but it needs rate
   limiting and a status page. Decide before Phase 2.

---

## 12. Definition of done for a new tool

A tool ships only when all of these are true:

- [ ] `ToolDefinition` complete: title ≤ 60, description 110–160, intro, how-it-works, example, limits,
      three FAQs, two related tools.
- [ ] Island registered in `components/tools/ToolIsland.tsx`.
- [ ] Works with keyboard only; result announced; invalid input handled.
- [ ] Result can be copied; no `NaN` or `undefined` rendered.
- [ ] Server HTML contains the answer, the copy and the schema.
- [ ] Unit or logic test for the maths; content test passes.
- [ ] Added to the sitemap automatically (it is, if `status: "live"`).
- [ ] `npm run audit:seo` passes against a production build.
