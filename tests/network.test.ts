import { describe, expect, it } from "vitest";
import { DNS_TYPES, dnsOutcome, formatRecordData, isDnsRecordType, rcodeLabel } from "@/lib/network/dns";
import { normalizeDomain } from "@/lib/network/domain";
import { explainNonPublic, formatIPv6, parseIpAddress, parseIPv4, parseIPv6 } from "@/lib/network/ip";
import {
  describeHints,
  describePlatform,
  describeUserAgent,
  meaningfulBrands,
  type UaBrand,
} from "@/lib/network/system-info";

describe("IPv4 parsing", () => {
  it("accepts dotted quads", () => {
    expect(parseIPv4("8.8.8.8")).toEqual([8, 8, 8, 8]);
    expect(parseIPv4("255.255.255.255")).toEqual([255, 255, 255, 255]);
  });

  it("rejects out-of-range, short and zero-padded octets", () => {
    expect(parseIPv4("256.1.1.1")).toBeNull();
    expect(parseIPv4("1.2.3")).toBeNull();
    expect(parseIPv4("1.2.3.4.5")).toBeNull();
    expect(parseIPv4("01.2.3.4")).toBeNull();
    expect(parseIPv4("1.2.3.x")).toBeNull();
  });
});

describe("IPv6 parsing", () => {
  it("expands compressed addresses", () => {
    expect(parseIPv6("::1")?.slice(-1)).toEqual([1]);
    expect(parseIPv6("2001:db8::1")?.length).toBe(16);
    expect(parseIPv6("2001:db8::1")?.slice(0, 4)).toEqual([0x20, 0x01, 0x0d, 0xb8]);
  });

  it("handles embedded IPv4 and zone indexes", () => {
    expect(parseIPv6("::ffff:8.8.8.8")?.slice(-4)).toEqual([8, 8, 8, 8]);
    expect(parseIPv6("fe80::1%eth0")?.length).toBe(16);
    expect(parseIPv6("[::1]")?.length).toBe(16);
  });

  it("rejects malformed input", () => {
    expect(parseIPv6("1::2::3")).toBeNull();
    expect(parseIPv6("2001:db8:1:2:3:4:5:6:7")).toBeNull();
    expect(parseIPv6("12345::1")).toBeNull();
    expect(parseIPv6("not-an-ip")).toBeNull();
  });

  it("formats with RFC 5952 compression", () => {
    expect(formatIPv6(parseIPv6("2001:0db8:0000:0000:0000:0000:0000:0001") ?? [])).toBe("2001:db8::1");
    expect(formatIPv6(parseIPv6("2001:db8:0:1:1:1:1:1") ?? [])).toBe("2001:db8:0:1:1:1:1:1");
    expect(formatIPv6(parseIPv6("::") ?? [])).toBe("::");
  });
});

describe("IP scope classification", () => {
  const cases: Array<[string, string, string?]> = [
    ["8.8.8.8", "public"],
    ["73.89.217.227", "public"],
    ["10.1.2.3", "private"],
    ["172.16.0.1", "private"],
    ["172.32.0.1", "public"],
    ["192.168.1.1", "private"],
    ["127.0.0.1", "loopback"],
    ["169.254.10.1", "link-local"],
    ["100.64.0.1", "cgnat"],
    ["192.0.2.5", "documentation"],
    ["224.0.0.1", "multicast"],
    ["0.0.0.0", "unspecified"],
    ["2606:4700:4700::1111", "public"],
    ["::1", "loopback"],
    ["fe80::1", "link-local"],
    ["fd00::1", "private"],
    ["ff02::1", "multicast"],
    ["2001:db8::1", "documentation"],
    ["::ffff:8.8.8.8", "public"],
    ["::ffff:192.168.1.1", "private"],
  ];

  for (const [input, expected] of cases) {
    it(`classifies ${input} as ${expected}`, () => {
      expect(parseIpAddress(input)?.scope).toBe(expected);
    });
  }

  it("normalises the canonical text form", () => {
    expect(parseIpAddress("2001:0DB8:0000:0000:0000:0000:0000:0001")?.canonical).toBe("2001:db8::1");
    expect(parseIpAddress("008.008.008.008")).toBeNull();
    expect(parseIpAddress(" 8.8.8.8 ")?.canonical).toBe("8.8.8.8");
  });

  it("explains why non-public addresses have no lookup", () => {
    const loopback = parseIpAddress("127.0.0.1");
    expect(loopback).not.toBeNull();
    if (!loopback) return;

    expect(explainNonPublic(loopback)).toContain("loopback");
    expect(explainNonPublic(loopback)).toContain("no public location");

    const publicAddress = parseIpAddress("1.1.1.1");
    expect(publicAddress).not.toBeNull();
    if (!publicAddress) return;
    expect(explainNonPublic(publicAddress)).toBeNull();
  });
});

describe("domain normalisation", () => {
  it("reduces URLs to the host name", () => {
    expect(normalizeDomain("https://www.example.com/path?q=1#hash")).toEqual({
      ok: true,
      name: "www.example.com",
    });
    expect(normalizeDomain("example.com/path")).toEqual({ ok: true, name: "example.com" });
    expect(normalizeDomain("user:pass@example.com:8443")).toEqual({ ok: true, name: "example.com" });
  });

  it("lowercases, strips trailing dots and converts IDNs", () => {
    expect(normalizeDomain("EXAMPLE.COM.")).toEqual({ ok: true, name: "example.com" });
    expect(normalizeDomain("bücher.de")).toEqual({ ok: true, name: "xn--bcher-kva.de" });
    expect(normalizeDomain("_dmarc.example.com")).toEqual({ ok: true, name: "_dmarc.example.com" });
  });

  it("answers with an actionable error for the wrong input", () => {
    const empty = normalizeDomain("   ");
    expect(empty.ok).toBe(false);
    if (!empty.ok) expect(empty.error).toContain("Enter a domain");

    const address = normalizeDomain("8.8.8.8");
    expect(address.ok).toBe(false);
    if (!address.ok) expect(address.error).toContain("IP lookup");

    const wildcard = normalizeDomain("*.example.com");
    expect(wildcard.ok).toBe(false);
    if (!wildcard.ok) expect(wildcard.error).toContain("Wildcards");

    const single = normalizeDomain("localhost");
    expect(single.ok).toBe(false);
    if (!single.ok) expect(single.error).toContain("full domain");

    const bad = normalizeDomain("exa mple.com");
    expect(bad.ok).toBe(false);

    const hyphen = normalizeDomain("-bad.example.com");
    expect(hyphen.ok).toBe(false);
  });
});

describe("DNS helpers", () => {
  it("exposes the supported record types", () => {
    expect(DNS_TYPES).toContain("CAA");
    expect(isDnsRecordType("aaaa")).toBe(false);
    expect(isDnsRecordType("AAAA")).toBe(true);
  });

  it("labels response codes", () => {
    expect(rcodeLabel(0)).toBe("NOERROR");
    expect(rcodeLabel(2)).toBe("SERVFAIL");
    expect(rcodeLabel(3)).toBe("NXDOMAIN");
    expect(rcodeLabel(5)).toBe("REFUSED");
    expect(rcodeLabel(99)).toBe("RCODE 99");
  });

  it("joins quoted TXT character-strings but leaves other data alone", () => {
    expect(formatRecordData("TXT", '"v=spf1 include:_spf.example.com " "-all"')).toBe(
      "v=spf1 include:_spf.example.com -all",
    );
    expect(formatRecordData("TXT", '"v=DKIM1; k=rsa; p=MIIB\\;AQ"')).toBe("v=DKIM1; k=rsa; p=MIIB;AQ");
    expect(formatRecordData("MX", "10 mail.example.com.")).toBe("10 mail.example.com.");
  });

  it("separates NXDOMAIN from NODATA", () => {
    expect(dnsOutcome(0, 2)).toBe("records");
    expect(dnsOutcome(0, 0)).toBe("nodata");
    expect(dnsOutcome(3, 0)).toBe("nxdomain");
    expect(dnsOutcome(2, 0)).toBe("error");
  });
});

describe("user agent fallback", () => {
  it("recognises the major engines", () => {
    expect(
      describeUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
      ),
    ).toEqual({ browser: "Chrome 142", engine: "Blink" });

    expect(
      describeUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0",
      ),
    ).toEqual({ browser: "Edge 142", engine: "Blink" });

    expect(
      describeUserAgent("Mozilla/5.0 (X11; Linux x86_64; rv:141.0) Gecko/20100101 Firefox/141.0"),
    ).toEqual({ browser: "Firefox 141", engine: "Gecko" });

    expect(
      describeUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
      ),
    ).toEqual({ browser: "Safari 18", engine: "WebKit" });

    expect(
      describeUserAgent(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/142.0 Mobile/15E148 Safari/604.1",
      ),
    ).toEqual({ browser: "Chrome 142 (iOS)", engine: "WebKit (iOS)" });

    expect(
      describeUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Freebuff/0.0.192 Chrome/130.0.6723.191 Electron/33.4.11 Safari/537.36",
      ),
    ).toEqual({ browser: "Electron 33 (Chromium 130)", engine: "Blink (Electron)" });
  });

  it("translates Client Hints platform versions into release names", () => {
    expect(describePlatform("Windows", "19.0.0")).toBe("Windows 11");
    expect(describePlatform("Windows", "10.0.0")).toBe("Windows 10");
    expect(describePlatform("Windows", "0.0.0")).toBe("Windows");
    expect(describePlatform("macOS", "14.5.0")).toBe("macOS 14.5");
    expect(describePlatform("Android", "14.0.0")).toBe("Android 14");
    expect(describePlatform("Chrome OS", "16093.0.0")).toBe("Chrome OS 16093.0.0");
    expect(describePlatform(undefined, undefined)).toBe("");
  });

  it("ignores placeholder Client Hints brands", () => {
    const brands: UaBrand[] = [
      { brand: "Not A(Brand", version: "99" },
      { brand: "Chromium", version: "142" },
      { brand: "Google Chrome", version: "142" },
    ];
    expect(meaningfulBrands(brands).map((entry) => entry.brand)).toEqual(["Google Chrome"]);
    expect(describeHints(brands)).toBe("Google Chrome 142");
  });
});
