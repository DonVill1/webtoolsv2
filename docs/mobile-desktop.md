# Mobile, desktop and local-first plan

The question this answers: **can these tools run on the user's own hardware?**
Yes for every browser-only tool — they already do. The site is a static Next.js
shell plus small client islands; the conversion maths, file handling, hashing,
parsing and formatting all run in the tab. Server routes exist only for DNS, IP,
speed-test and (planned) live-data lookups.

This document covers how to turn that into installable mobile and desktop
products without forking the codebase.

## 1. Principles

1. **Local by default.** A tool that can work without a network must. No upload,
   no account, no server round trip for maths or files.
2. **Disclose the exception.** Server-backed tools say so in the header chip
   ("Server route") and in the limits section.
3. **One core, many shells.** Pure logic lives in `lib/tools/*` and
   `lib/units/*`; React components are presentation; server routes are
   adapters. Tests exercise the core directly.
4. **Static first.** Every page that can be prerendered stays prerendered. The
   desktop shell and PWA should be able to open a tool page from cache with no
   server.
5. **No hidden telemetry.** Offline use must not depend on analytics or ads
   loading.

## 2. What already works locally

| Capability | Runs on device? | Notes |
| --- | --- | --- |
| Unit, percentage, BMI, loan, VAT, tip, ISO duration | Yes | Pure functions, no network |
| JSON, YAML, CSV, XML, Markdown conversion | Yes | Bundled parsers |
| Base64, hash, JWT decode, regex, URL, cron, subnet, IBAN | Yes | WebCrypto and JS only |
| QR generation, image compression, SVG preview | Yes | Canvas / DOM |
| Color palette, contrast | Yes | Canvas / WCAG maths |
| System information | Yes | Browser APIs only |
| Timestamp, time zones, birthday, `.ics` export | Yes | `Intl` and local clock |
| URL parser, cron, regex, subnet, loan, VAT, IBAN, contrast, tip, ISO duration | Yes | Pure functions in `lib/tools/*` |
| DNS, IP, speed test | No | Requires the server routes |

The ten tools added on 2026-10-28 are all in the local row: they import no
server route, no API key and no database. Their tests exercise the core
functions directly, which is the guarantee the desktop and offline shells need.

## 3. Mobile strategy

### Phase M1 — responsive + installable PWA

- Ship a web app manifest (exists) with name, short name, icons, theme colour,
  `display: standalone`, and `start_url: /tools`.
- Add a service worker with an explicit policy:
  - HTML: network-first with a short timeout, cache fallback.
  - `/_next/static/*` and `/tool-icons/*`: cache-first, immutable.
  - Server APIs: never cached by the worker; the app shows an offline message.
  - Cache name includes the build ID so a deploy cannot serve stale chunks; the
    existing stale-chunk error boundary remains the last resort.
- Precache the tool index, the eight most-used tool pages and the shell.
- Add an offline indicator and a "saved on this device" state; do not pretend a
  server tool worked while offline.
- Use the Web Share Target API so "Share → WebTools" can open the URL encoder
  or QR generator with the shared text.

### Phase M2 — mobile ergonomics

- Tab bars already scroll horizontally; keep 44 px touch targets.
- File inputs use `accept` and, where useful, `capture="environment"` for the
  image tools.
- Use `visualViewport` and safe-area insets for the sticky ad/header regions.
- Test matrix: iOS Safari (current + previous), Android Chrome, Samsung
  Internet, Firefox mobile. Check file pickers, canvas memory and `Intl`.
- Budget: LCP < 2.5 s on a mid-range Android over 4G; no layout shift from ads.

### Phase M3 — offline drafts

- Store drafts in IndexedDB keyed by tool and view: QR content, markdown,
  diff inputs, image settings, calculator inputs.
- Never store JWT secrets, IBANs or uploaded files after the tab closes unless
  the user explicitly saves them.
- Provide "clear local data" on the privacy page.

## 4. Desktop strategy

Two viable shells:

| Option | Weight | Pros | Cons |
| --- | --- | --- | --- |
| **Tauri 2** (recommended) | ~3–10 MB | System webview, small binary, Rust sidecar only if needed, good file APIs | WebView2 on Windows, WKWebView on macOS; behaviour differs from Chrome |
| Electron | ~120 MB+ | Identical Chromium everywhere, mature ecosystem | Memory and download size, security hardening required |

### Phase D1 — installable PWA first

Chrome and Edge already install any HTTPS site as a desktop app. That covers
most demand with zero packaging. Add shortcuts (`?category=temperature`, QR,
hash) to the manifest.

### Phase D2 — Tauri wrapper

- Reuse the same static export; no UI fork.
- Native capabilities to add deliberately:
  - Open/save files with a real file dialog and recent-files list.
  - Drag files from the OS onto the image compressor / hash / diff tools.
  - File associations for `.svg`, `.json`, `.md` (open in the editor tools).
  - Clipboard read/write and global shortcut for the QR/text tools.
  - Auto-update with signed releases.
- Server-backed tools remain network-only inside the app; do not bundle a
  sidecar server until there is demand.
- Local dev: `npm run dev` plus `tauri dev`; build needs Rust, Node 20+, and
  platform toolchains. Signing is per-platform; budget time for notarisation
  on macOS and code signing on Windows.

### Phase D3 — local data and privacy

- Keep everything in the webview's storage; no background service.
- Optional encrypted export/import of drafts (AES-GCM with a user passphrase).
- Document what the desktop build can do offline in the README.

## 5. Hardware requirements

### Using the tools

- Any modern browser with WebCrypto and Canvas: 2 GB RAM is enough for text
  tools; image compression and large JSON are happier with 4 GB.
- No GPU requirement. WebGL rows in System Information are informational.
- Server-backed tools need network access; everything else runs offline.

### Developing and running locally

- Node.js 20+ (Next.js 16 requires a modern runtime), 8 GB RAM recommended.
- `npm install`, `npm run dev` (or `npm run build && npm start`) — no D1, R2 or
  Cloudflare account needed for client-only tools.
- For the Workers target: `@opennextjs/cloudflare` + Wrangler, plus a free
  Cloudflare account for D1/R2 bindings.
- For Tauri: Rust toolchain + platform build tools (MSVC on Windows, Xcode CLT
  on macOS); ~2–4 GB extra disk.

## 6. Running on local hardware

Yes, and the new batch is the strongest case for it:

- **No runtime dependencies.** The ten client tools are plain TypeScript plus
  React; a static export of the site serves them with no Node server, no D1 and
  no Cloudflare account.
- **Bounded memory.** Subnet uses BigInt, regex stops at 1,000 matches, the
  loan schedule is capped at 600 rows, and file hashing reads one file at a
  time. The only unbounded input is pasted URL/text, which is capped by the
  textarea itself rather than a server.
- **CPU-light.** Everything is well under a second on a laptop or a mid-range
  phone; none of it needs a GPU or a Worker.
- **Offline-compatible.** Once the shell is cached, the tools keep working with
  the network off. Only DNS, IP and the speed test need connectivity.
- **Desktop packaging is optional.** A Tauri shell adds native file dialogs and
  drag-and-drop around the same static export; it is not required to run the
  tools locally, because the browser already does.

## 7. Architecture changes this requires

1. **Extract tool cores.** New tools ship as `lib/tools/<name>.ts` + tests, with
   the React component as a thin shell. This is already the pattern for text
   formats and units.
2. **Capability flags per tool.** Add `runtime: "browser" | "server"` to the tool
   definition so the UI, sitemap and offline shell can reason about it without
   hardcoded lists.
3. **Service-worker policy in one file**, versioned by build ID, with an
   explicit allowlist of cacheable routes.
4. **No layout dependence on ads.** Reserve slot heights; the offline shell
   should not collapse when an ad request fails.
5. **Test the static export.** A desktop/PWA build must not require server
   routes to render a tool page.

## 8. Sequenced plan

- [ ] M1: manifest polish, service worker, offline page, install test on iOS and Android.
- [ ] M1: Web Share Target for text/URL tools.
- [ ] M2: IndexedDB drafts for the five heaviest-input tools.
- [ ] M2: mobile performance pass (fonts, ad slots, CLS).
- [ ] D1: desktop install instructions and manifest shortcuts.
- [ ] D2: Tauri spike — package the static export, open a local file, measure binary size.
- [ ] D2: file associations and drag-and-drop.
- [ ] D3: encrypted draft export/import.
- [ ] Runtime flags on tool definitions + tests that assert browser-only tools never import server routes.
- [ ] CI: build the static export and run the SEO audit against it.
