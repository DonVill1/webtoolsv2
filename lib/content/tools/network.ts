import type { ToolDefinition } from "../types";

const date = "2026-10-28";

export const networkTools: ToolDefinition[] = [
  {
    slug: "dns-lookup",
    name: "DNS lookup",
    category: "network",
    intent: "look up dns records for a domain",
    seo: {
      title: "DNS Lookup — A, AAAA, MX, TXT, NS, CNAME",
      description:
        "Look up A, AAAA, MX, TXT, NS, CNAME, SOA and CAA records for any domain over DNS-over-HTTPS, with the resolver and TTL shown.",
    },
    content: {
      intro:
        "Query the records that decide where a domain points and how its mail is handled. Results come from a DNS-over-HTTPS resolver and include the TTL for each answer.",
      howItWorks: [
        "The page normalises what you paste — a full URL, a path, a port, a trailing dot, uppercase or an internationalised name — then sends the bare domain and record type to this site's server route, which queries Cloudflare's DNS-over-HTTPS resolver. Answers are cached for 60 seconds, and Re-check bypasses that cache.",
        "The selected record type is shown with its TTL and an authority section when the resolver returns one. SOA and NS are separate choices, not automatic additions. NXDOMAIN (the name does not exist) and NODATA (the name exists without that record type) are reported as different results, because they mean different things.",
      ],
      examples: [
        { input: "example.com · A", output: "93.184.215.14 · TTL 3600" },
        { input: "example.com · MX", output: "0 .", note: "a null MX means no mail" },
      ],
      limits:
        "The answer reflects one resolver's cache, so it can differ from a resolver on the other side of the world during propagation. The tool does not query authoritative nameservers directly, and single-label names that only exist on a local network cannot be resolved from here.",
      faqs: [
        {
          q: "Why do different DNS tools disagree?",
          a: "Each resolver caches answers for the record's TTL. Until that TTL expires, some resolvers still hold the old value. Comparing two resolvers during a migration is expected to show a difference.",
        },
        {
          q: "What is a TTL?",
          a: "Time to live: how many seconds a resolver may keep the answer cached. A low TTL speeds up changes but increases query volume.",
        },
        {
          q: "Can I look up any domain?",
          a: "Any publicly resolvable domain. Private zones and names that only exist on your local network cannot be queried from here.",
        },
      ],
    },
    related: ["ip-lookup", "speed-test", "system-info"],
    og: { kicker: "Network & system", value: "A · AAAA · MX · TXT" },
    status: "live",
    added: "2023-05-05",
    updated: date,
  },
  {
    slug: "ip-lookup",
    name: "IP lookup",
    category: "network",
    intent: "find the location and network of an ip address",
    seo: {
      title: "IP Lookup — Location, ISP and Network",
      description:
        "Look up an IP address to see its approximate location, ISP and network. Your own address is detected automatically; no account needed.",
    },
    content: {
      intro:
        "See the approximate location, ISP and network behind an IP address, or check what the web sees for your own connection.",
      howItWorks: [
        "Your own address is read in the browser from the public ipwho.is endpoint, so it is the address the internet sees for your connection rather than the server's. An address you type goes through this site's server route, where answers are cached for a day.",
        "City-level location is inferred from the ISP's allocation and is often wrong for mobile networks and VPNs. The provider is named on the page instead of hidden, and private, loopback and reserved ranges are refused because they have no public location.",
      ],
      examples: [
        { input: "8.8.8.8", output: "San Jose, US · Google LLC" },
        { input: "your connection", output: "read in the browser, then geolocated" },
      ],
      limits:
        "Geolocation is approximate, not a tracking method. VPNs, carrier-grade NAT and privacy relays will report the relay's location, not the person's. Private, loopback, link-local and reserved addresses return an explanation instead of a result.",
      faqs: [
        {
          q: "How accurate is IP geolocation?",
          a: "Country is usually reliable; city is a guess based on network allocation and can be off by hundreds of kilometres. Do not use it to confirm someone's physical location.",
        },
        {
          q: "Is my IP stored?",
          a: "Your own address is looked up directly from your browser, so it never reaches this site's logs. Typed addresses pass through the server route, which keeps only a short cache; ipwho.is applies its own retention policy.",
        },
        {
          q: "Why does it show the wrong city?",
          a: "Mobile carriers and VPNs route traffic through regional gateways. The IP belongs to the gateway, so the city shown is the gateway's, not the device's.",
        },
      ],
    },
    related: ["dns-lookup", "speed-test", "system-info"],
    og: { kicker: "Network & system", value: "IP → location · ISP" },
    status: "live",
    added: "2023-05-05",
    updated: date,
  },
  {
    slug: "speed-test",
    name: "Internet speed test",
    category: "network",
    intent: "test internet download and upload speed",
    seo: {
      title: "Internet Speed Test — Download and Upload",
      description:
        "Measure download speed, upload speed and latency in the browser against this site's own endpoint. No Flash, no plugin, no account.",
    },
    content: {
      intro:
        "Measure the throughput this browser actually gets: a warm-up request, a timed download, an upload, and a latency sample, all against the same origin.",
      howItWorks: [
        "The test sends five small requests for latency, then downloads a 750 kB warm-up that is thrown away, followed by the 4 MB run that is actually reported. Measuring the second request keeps DNS, TCP and TLS setup out of the figure. Upload posts 1 MB of random data and uses the byte count the server confirms receiving.",
        "Results are shown in megabits per second, the unit ISPs advertise. Latency is the median of the five pings, jitter is the average change between consecutive pings, and the data figure counts every byte the run transferred. Each request is abandoned after 20 seconds rather than leaving the page waiting.",
      ],
      examples: [
        {
          input: "Start test on a 500 Mbit/s fibre line over Wi-Fi",
          output: "≈ 280 Mbit/s down · 95 Mbit/s up · 18 ms latency",
          note: "One TCP stream and Wi-Fi overhead cap the figure well below the plan.",
        },
      ],
      limits:
        "A browser test measures one connection, not your line's capacity. Wi-Fi, a busy device or a distant origin will lower the number, and a single stream under-reports fast links. If one transfer stalls for more than 20 seconds the run stops with an error instead of reporting a partial figure. This is not a replacement for an ISP-grade test with multiple servers.",
      faqs: [
        {
          q: "Why is my result lower than my plan?",
          a: "A single TCP connection rarely saturates a fast line, and Wi-Fi adds its own overhead. Try a wired connection and close other tabs before treating the number as your line speed.",
        },
        {
          q: "Does this test use third-party servers?",
          a: "No. It measures against this site's own endpoint, so the result includes the distance to this server. That is disclosed rather than presented as a universal figure.",
        },
        {
          q: "How much data does a test use?",
          a: "About 5.75 MB per run: 750 kB plus 4 MB downloaded and 1 MB uploaded, plus tiny latency requests. There is no size selector, so avoid repeated runs on a metered connection.",
        },
      ],
    },
    related: ["dns-lookup", "ip-lookup", "system-info"],
    og: { kicker: "Network & system", value: "Mbps · ms" },
    status: "live",
    added: "2023-02-10",
    updated: date,
  },
  {
    slug: "system-info",
    name: "System information",
    category: "network",
    intent: "show device browser and display information",
    seo: {
      title: "System Information — Device and Browser Report",
      description:
        "See your browser, engine, platform, screen, GPU renderer, memory and storage estimates in one report. Nothing is uploaded.",
    },
    content: {
      intro:
        "A live report of what the browser exposes about the device: browser and engine, platform, screen in CSS and device pixels, pixel ratio, GPU renderer, memory hints and storage estimates.",
      howItWorks: [
        "Values come from navigator, screen, media queries, Client Hints and the WebGL debug renderer info. The report distinguishes what is reliable from what is a hint: deviceMemory and hardwareConcurrency are coarse, native resolution is estimated from the pixel ratio, and the GPU string is often masked by the browser.",
        "The report updates as the window, colour scheme or zoom changes, and groups values by browser, platform, display, graphics and storage so a support conversation can start from facts. A copy button produces a plain-text report stamped with the time it was refreshed.",
      ],
      examples: [
        { input: "Chrome on Windows 11 at 125% scaling", output: "1536×864 CSS px · 1920×1080 device px · 1.25×" },
        { input: "GPU string", output: "ANGLE (NVIDIA …)", note: "often masked" },
      ],
      limits:
        "Browsers deliberately limit fingerprinting surface. Missing values are reported as unavailable rather than filled with a guess, and the report is not a hardware inventory.",
      faqs: [
        {
          q: "Is this report unique enough to identify me?",
          a: "A combination of screen, GPU and platform details can be fairly distinctive. That is why browsers reduce precision and why this page does not add fingerprinting signals such as fonts or canvas hashes.",
        },
        {
          q: "Why is my GPU masked?",
          a: "Browsers and privacy extensions replace the renderer string with a generic value to reduce fingerprinting. There is no reliable way to unmask it from JavaScript.",
        },
        {
          q: "Does the page store the report?",
          a: "No. It exists in the tab and is copied only if you press copy. Nothing is sent to the server.",
        },
      ],
    },
    related: ["speed-test", "ip-lookup", "dns-lookup"],
    og: { kicker: "Network & system", value: "device · browser · GPU" },
    status: "live",
    added: "2023-10-01",
    updated: date,
  },
];
