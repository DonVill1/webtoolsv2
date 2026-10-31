# webtools.diy — v1 audit

**Scope:** the Next.js site in `E:\Projects\webtools` and the SEO files in `webtools/docs/seo`.
**Verdict:** this was not primarily an SEO problem. It was an architecture problem that SEO made visible.

The site was built as an app with pages attached: state lived on the client, navigation was a tool
launcher, and every tool shared one umbrella URL. Search engines can index that, but they have nothing
specific to rank and no reason to prefer it over a thousand identical converter pages.

---

## 1. What was actually broken

### 1.1 Dead tool links (confirmed)

`src/data/tools-metadata.ts` defines **22 tools**. `src/pages/tools/` contains **19 pages**.

Metadata exists for tools that have no page:

- `password-generator`
- `text-analyzer`
- `markdown-editor`
- `qr-code-generator`

If those entries appear in the homepage grid or the tool index, every click is a 404. The metadata
also points at two more tools that do not exist at all:

- `discount-calculator` (related tool on `percentage-calculator`)
- `encryption-tool` (related tool on `password-generator`)

This is the clearest sign that content and routes drifted apart: nothing validates the catalog against
the route table.

### 1.2 Structured data was invisible to crawlers

`src/components/shared/SEOMetadata.tsx` renders JSON-LD behind a client-only guard:

```tsx
{isClient && (
  <script type="application/ld+json">{JSON.stringify(seo.schema)}</script>
)}
```

The v1 audit already caught this. It means the schema is absent from the server HTML, which is what
crawlers parse first. Rich results cannot be earned from markup that only exists after hydration.

### 1.3 One URL per tool, no URL per task

The entire unit converter lived at `/tools/unit-converter`. Search demand is not shaped like that.
People search "feet to inches", "kg to lbs", "celsius to fahrenheit" — thousands of distinct tasks.
One page can target the head term, but it cannot be the best result for each tail term.

The v1 `seo-subroutes-plan.md` proposed the right instinct — per-conversion pages — but the execution
would have created **~380 pages** under `/tools/unit-converter/...`, most of them generated from a
matrix with no unique explanation. That is the doorway-page pattern Google explicitly demotes. It also
keeps the tool URL as a folder, which makes the tool page compete with its own children.

### 1.4 App chrome around every tool

`ToolPageTemplate.tsx` is 246 lines of shell: share popups, `window.openShareWithResults`, a
`ClientOnly` wrapper, add-to-home-screen prompts, autoplay share dialogs, sponsored sections. Every tool
inherits it. That has three costs:

- **HTML weight and JS hydration** on pages whose job is one input and one output.
- **Intent dilution**: the page talks about sharing, installing and sponsoring before it answers the
  query.
- **Fragility**: imperative `window` hooks and client-only branches are exactly what breaks prerendering
  and metadata.

### 1.5 Catalog metadata was app-store metadata

The tool records carried `icon`, `color`, `popularity`, `tags`, `keywords`. Those are useful for a
launcher UI and useless for search. Descriptions were one line ("Test your internet connection speed and
performance"), far too short to be a page description and not written around a query. Categories mixed
product surfaces (`web`, `utilities`, `generators`) with topics (`converters`, `calculators`), so no
category page could be a coherent landing page.

### 1.6 Client state carried the content

Tool results, selected units and share state lived in component state. Nothing about a conversion was
addressable, linkable or indexable. Even the useful content that existed was rendered conditionally, so
the crawler saw a shell.

### 1.7 The trust basics were missing

From the v1 audit folder, still true at the time of this review:

- The domain is a `.diy` TLD with no backlink profile.
- Search Console had not been used; indexing was never requested.
- OG image paths were referenced but not generated.
- The blog depended on a Sanity project with no visible content.

Traffic of ~15 views/year is consistent with "not indexed", not with "indexed but ranked badly". Both
were true, but the crawlability problem came first.

---

## 2. What was worth keeping

- **The conversion maths was serious.** `unitConversionService.ts` used exact factors, not rounded
  approximations. That is the seed of a trustworthy reference site.
- **The tool selection was good.** Unit conversion, base64, JSON, DNS, IP, hashing, timestamps, colour,
  image compression — these are durable, recurring tasks with real search volume.
- **The audit was honest.** `docs/seo` correctly identified indexing, schema, H1s and content depth. The
  mistake was treating them as a checklist to bolt onto an app rather than a reason to rebuild.
- **The design ambition.** The Nexus work (measured space, token families, document mode) is a real
  differentiator if it is applied to reading-first pages instead of app dashboards.

---

## 3. Why v2 is a rebuild, not a patch

Patching v1 would mean keeping the URL model, the template, the catalog drift and the client-rendered
metadata — then adding content on top. Each of those is load-bearing. Changing them one at a time costs
more than replacing the shell and porting the parts that work.

The rebuild keeps:

- the tool set, expanded from 19 to 26;
- the exact-factor conversion approach, now a typed registry with tests;
- the Nexus design language, now applied in document mode.

It discards:

- the umbrella-only URL model;
- the 380-page matrix plan;
- the app chrome and share/install machinery;
- catalog metadata that is not content;
- client-only structured data.

---

## 4. The standard v2 is held to

1. **Every indexable page is a document first.** Server HTML contains the title, the answer, the
   explanation, the FAQs and the schema. JavaScript enhances the tool; it does not produce the page.
2. **One URL per task.** Hubs own head terms, curated pair pages own tail terms, guides own questions.
   No generated matrix, no empty combinations.
3. **The catalog cannot drift.** One typed definition per tool; a test asserts every tool has an island,
   a description in range, three FAQs, an example and resolvable related links.
4. **Accuracy is visible.** Factors, formulas, limits and sources are on the page. A wrong number is a
   bug with a test, not a copy edit.
5. **Ads are inventory, not layout.** At most one labelled plate per page, outside the result, with
   reserved height and a house fallback that makes no request.
6. **The site can be audited.** `npm run audit:seo` checks the rendered production HTML for titles,
   descriptions, canonicals, H1s, schema, thin content and sitemap coverage.

See [v2-blueprint.md](v2-blueprint.md) for the implementation that follows from these rules.
