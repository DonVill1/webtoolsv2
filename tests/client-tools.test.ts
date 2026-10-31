import { describe, expect, it } from "vitest";
import { contrastRatio, contrastVerdicts, parseColor, suggestPassing, toHex } from "@/lib/tools/color";
import { cronMatches, explainCron, nextRuns, parseCron } from "@/lib/tools/cron";
import { durationFromSeconds, parseIsoDuration } from "@/lib/tools/duration";
import { loan, tip, validateBic, validateIban, vat } from "@/lib/tools/finance";
import { testRegex } from "@/lib/tools/regex";
import { subnet } from "@/lib/tools/subnet";
import { decodeUrl, encodeUrl, parseUrl } from "@/lib/tools/url-encode";

describe("url encoder", () => {
  it("encodes a component and a whole URL differently", () => {
    expect(encodeUrl("a&b=c", "component")).toBe("a%26b%3Dc");
    expect(encodeUrl("https://x.test/a b?q=1", "whole")).toBe("https://x.test/a%20b?q=1");
    expect(encodeUrl("hello world", "component")).toBe("hello%20world");
  });

  it("decodes once and reports a broken escape instead of throwing", () => {
    expect(decodeUrl("hello%20world")).toEqual({ value: "hello world", error: null });
    expect(decodeUrl("100%25")).toEqual({ value: "100%", error: null });
    expect(decodeUrl("100%").error).not.toBeNull();
  });

  it("parses a full URL into its request parts", () => {
    const { parsed, error } = parseUrl("https://user@example.com:8443/a/b?q=1&q=2#top");
    expect(error).toBeNull();
    expect(parsed?.scheme).toBe("https");
    expect(parsed?.port).toBe("8443");
    expect(parsed?.path).toBe("/a/b");
    expect(parsed?.fragment).toBe("#top");
    expect(parsed?.params).toEqual([
      { key: "q", value: "1" },
      { key: "q", value: "2" },
    ]);
    expect(parseUrl("not a url").error).not.toBeNull();
  });
});

describe("ISO 8601 durations", () => {
  it("parses date and time components with the right M meaning", () => {
    const parsed = parseIsoDuration("P3Y6M4DT12H30M5S");
    expect(parsed.error).toBeNull();
    expect(parsed.parts).toMatchObject({ years: 3, months: 6, days: 4, hours: 12, minutes: 30, seconds: 5 });
    expect(parseIsoDuration("PT1M").parts.minutes).toBe(1);
    expect(parseIsoDuration("P1M").parts.months).toBe(1);
    expect(parseIsoDuration("PT1H30M").seconds).toBe(5400);
  });

  it("builds a duration from seconds and round-trips", () => {
    expect(durationFromSeconds(5400)).toBe("PT1H30M");
    expect(durationFromSeconds(0)).toBe("PT0S");
    expect(parseIsoDuration(durationFromSeconds(90_061)).seconds).toBe(90_061);
  });

  it("rejects malformed durations", () => {
    expect(parseIsoDuration("1H").error).not.toBeNull();
    expect(parseIsoDuration("P").error).not.toBeNull();
    expect(parseIsoDuration("PT").error).not.toBeNull();
  });
});

describe("cron", () => {
  it("validates five fields and their ranges", () => {
    expect(parseCron("0 9 * * 1-5").valid).toBe(true);
    expect(parseCron("61 9 * * *").error).toContain("minute");
    expect(parseCron("0 9 * *").error).toContain("five fields");
    expect(parseCron("0 9 * * MON").error).not.toBeNull();
  });

  it("finds the next weekday runs at the requested time", () => {
    const parsed = parseCron("0 9 * * 1-5");
    const runs = nextRuns(parsed, new Date(2026, 9, 28, 12, 0, 0), 5);
    expect(runs).toHaveLength(5);
    for (const run of runs) {
      expect(run.getHours()).toBe(9);
      expect(run.getMinutes()).toBe(0);
      expect(run.getDay()).not.toBe(0);
      expect(run.getDay()).not.toBe(6);
    }
  });

  it("applies an OR when both day fields are restricted", () => {
    const parsed = parseCron("0 0 1 * 1");
    expect(cronMatches(parsed, new Date(2026, 10, 2))).toBe(true);
    expect(explainCron(parsed)).toContain("or Monday");
  });

  it("summarises common schedules in English", () => {
    expect(explainCron(parseCron("* * * * *"))).toBe("Every minute, every day.");
    expect(explainCron(parseCron("*/15 * * * *"))).toContain("minute 0, 15, 30 and 45");
    expect(explainCron(parseCron("0 9 * * 1-5"))).toContain("Monday, Tuesday, Wednesday, Thursday and Friday");
  });
});

describe("subnet calculator", () => {
  it("derives IPv4 ranges and host counts", () => {
    const { result } = subnet("192.168.1.10/24");
    expect(result).toMatchObject({
      family: "IPv4",
      prefix: 24,
      network: "192.168.1.0",
      mask: "255.255.255.0",
      wildcard: "0.0.0.255",
      first: "192.168.1.1",
      last: "192.168.1.254",
      broadcast: "192.168.1.255",
    });
    expect(result?.total).toBe(256n);
    expect(result?.usable).toBe(254n);
  });

  it("treats /31 and /32 as host-preserving exceptions", () => {
    expect(subnet("10.0.0.0/31").result?.usable).toBe(2n);
    expect(subnet("10.0.0.4/32").result?.usable).toBe(1n);
  });

  it("handles IPv6 without a broadcast address", () => {
    const { result } = subnet("2001:db8::/48");
    expect(result?.family).toBe("IPv6");
    expect(result?.network).toBe("2001:db8::");
    expect(result?.broadcast).toBeNull();
    expect(result?.usable).toBe(1n << 80n);
    expect(subnet("2001:db8::/129").error).not.toBeNull();
    expect(subnet("300.1.1.1/24").error).not.toBeNull();
  });
});

describe("finance", () => {
  it("calculates a fixed-rate loan and finishes at zero", () => {
    const result = loan(20_000, 6, 5);
    expect(result?.payment).toBeCloseTo(386.66, 1);
    expect(result?.schedule).toHaveLength(60);
    expect(result?.schedule.at(-1)?.balance).toBe(0);
    expect(result?.totalInterest).toBeGreaterThan(2_000);
    expect(loan(20_000, 0, 5)?.payment).toBeCloseTo(333.33, 2);
  });

  it("adds and removes VAT without subtracting a percentage of the gross", () => {
    expect(vat(100, 20, "add")).toMatchObject({ net: 100, vat: 20, gross: 120 });
    const removed = vat(120, 20, "remove");
    expect(removed?.net).toBeCloseTo(100, 6);
    expect(removed?.vat).toBeCloseTo(20, 6);
  });

  it("splits a tip and applies round-up", () => {
    const split = tip(80, 20, 4, false);
    expect(split?.total).toBeCloseTo(96, 6);
    expect(split?.perPerson).toBeCloseTo(24, 6);
    const rounded = tip(100, 18.5, 3, true);
    expect(rounded?.total).toBe(119);
    expect(rounded?.extra).toBeCloseTo(0.5, 6);
  });

  it("validates IBAN checksums and lengths", () => {
    expect(validateIban("GB82 WEST 1234 5698 7654 32").valid).toBe(true);
    expect(validateIban("DE89 3704 0044 0532 0130 00").valid).toBe(true);
    const wrong = validateIban("DE89 3704 0044 0532 0130 01");
    expect(wrong.valid).toBe(false);
    expect(wrong.error).toContain("checksum");
    expect(validateIban("GB82 WEST 1234").error).toContain("22");
  });

  it("validates BIC structure", () => {
    expect(validateBic("WESTGB2L").valid).toBe(true);
    expect(validateBic("WESTGB2LXXX").valid).toBe(true);
    expect(validateBic("WESTGB").valid).toBe(false);
  });
});

describe("regex tester", () => {
  it("returns every match with indexes and capture groups", () => {
    const result = testRegex("(\\w+)@(\\w+)", "g", "ada@example grace@test", "");
    expect(result.error).toBeNull();
    expect(result.matches).toHaveLength(2);
    expect(result.matches[0]).toMatchObject({ index: 0, value: "ada@example", groups: ["ada", "example"] });
  });

  it("previews a replacement and reports invalid patterns", () => {
    expect(testRegex("(\\d{4})-(\\d{2})", "g", "2026-10", "$2/$1").replaced).toBe("10/2026");
    expect(testRegex("(", "", "text", "").error).not.toBeNull();
  });
});

describe("color contrast", () => {
  it("computes the WCAG ratio for black on white", () => {
    const black = parseColor("#000")!;
    const white = parseColor("#ffffff")!;
    expect(contrastRatio(black, white)).toBeCloseTo(21, 5);
    expect(contrastVerdicts(black, white).aaaNormal).toBe(true);
    expect(toHex(black)).toBe("#000000");
  });

  it("finds a passing text colour without changing the background", () => {
    const teal = parseColor("#2DD4BF")!;
    const white = parseColor("#FFFFFF")!;
    const suggestion = suggestPassing(teal, white);
    expect(suggestion).not.toBeNull();
    expect(contrastRatio(suggestion!, white)).toBeGreaterThanOrEqual(4.5);
  });
});
