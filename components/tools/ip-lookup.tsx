"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { parseIpAddress } from "@/lib/network/ip";
import { mapIpWho, type IpDetails, type IpWhoResponse } from "@/lib/network/ipwho";

const PROVIDER_TIMEOUT_MS = 8000;

function messageFor(error: unknown): string {
  if (error instanceof Error && error.name === "TimeoutError") {
    return "The lookup took too long. Check your connection and try again.";
  }
  if (error instanceof Error && error.message) return error.message;
  return "The lookup could not be completed. Check your connection and try again.";
}

async function lookupAddress(ip: string, signal: AbortSignal): Promise<IpDetails> {
  const response = await fetch(`/api/ip?ip=${encodeURIComponent(ip)}`, {
    headers: { accept: "application/json" },
    cache: "no-store",
    signal,
  });
  const payload = (await response.json().catch(() => ({}))) as IpDetails & { error?: string };
  if (!response.ok) throw new Error(payload.error ?? "The lookup failed.");
  return payload;
}

/**
 * Your own address is read in the browser, then geolocated. Asking the server
 * "who am I?" returns the server's egress address on hosts without a trusted
 * proxy header, which is the wrong answer for the visitor.
 */
async function lookupOwnAddress(signal: AbortSignal): Promise<IpDetails> {
  try {
    const direct = await fetch("https://ipwho.is/", {
      headers: { accept: "application/json" },
      cache: "no-store",
      signal,
    });
    if (direct.ok) {
      const payload = (await direct.json()) as IpWhoResponse;
      if (payload.success !== false && payload.ip) {
        const address = parseIpAddress(payload.ip);
        if (address) return mapIpWho(payload, address);
      }
    }
  } catch {
    // Fall through to the ipify + same-origin path below.
  }

  const echo = await fetch("https://api.ipify.org?format=json", {
    cache: "no-store",
    signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
  });
  if (echo.ok) {
    const payload = (await echo.json()) as { ip?: string };
    if (payload.ip && parseIpAddress(payload.ip)) {
      return lookupAddress(payload.ip, signal);
    }
  }

  const response = await fetch("/api/ip", {
    headers: { accept: "application/json" },
    cache: "no-store",
    signal,
  });
  const payload = (await response.json().catch(() => ({}))) as IpDetails & { error?: string };
  if (!response.ok) throw new Error(payload.error ?? "The lookup failed.");
  return payload;
}

export default function IpLookup() {
  const [data, setData] = useState<IpDetails | null>(null);
  const [self, setSelf] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const requestId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(async (target: string | null) => {
    const id = ++requestId.current;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setBusy(true);
    setError("");

    try {
      const details = target
        ? await lookupAddress(target, controller.signal)
        : await lookupOwnAddress(controller.signal);
      if (id !== requestId.current) return;
      setData(details);
      setSelf(!target);
    } catch (caught) {
      if (id !== requestId.current) return;
      setData(null);
      setError(messageFor(caught));
    } finally {
      if (id === requestId.current) setBusy(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    const id = ++requestId.current;

    void (async () => {
      try {
        const details = await lookupOwnAddress(controller.signal);
        if (id !== requestId.current) return;
        setData(details);
        setSelf(true);
      } catch (caught) {
        if (id !== requestId.current) return;
        setError(messageFor(caught));
      } finally {
        if (id === requestId.current) setBusy(false);
      }
    })();

    return () => {
      requestId.current += 1;
      controller.abort();
    };
  }, []);

  const location = data ? [data.city, data.region, data.country].filter(Boolean).join(", ") : "";
  const checkedAt = data
    ? new Date(data.checkedAt).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "";

  return (
    <div className="tool-panel">
      <form
        className="row-wrap"
        onSubmit={(event) => {
          event.preventDefault();
          const target = query.trim();
          if (target) void run(target);
          else void run(null);
        }}
      >
        <div className="field grow">
          <label htmlFor="ip-query">IP address</label>
          <input
            id="ip-query"
            className="input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Leave blank for your own address"
            autoComplete="off"
            spellCheck={false}
            inputMode="text"
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ height: 44 }} disabled={busy}>
          {busy ? "Looking up…" : "Look up"}
        </button>
        <button
          type="button"
          className="btn"
          style={{ height: 44 }}
          onClick={() => {
            setQuery("");
            void run(null);
          }}
          disabled={busy}
        >
          My address
        </button>
      </form>

      {error ? (
        <p className="error-text" role="alert" style={{ marginTop: 12 }}>
          {error}
        </p>
      ) : null}

      {data ? (
        <>
          <div className="readout" style={{ marginTop: 16 }}>
            <div>
              <span className="readout-value" style={{ fontSize: "calc(var(--nexus-type-xl) * 0.9)" }}>
                {data.ip}
              </span>
              <div className="micro" style={{ marginTop: 6 }}>
                {self ? "Your connection" : "Queried address"} · {location || "location unavailable"} · IPv
                {data.version}
              </div>
            </div>
            <div className="row-wrap" style={{ gap: 8 }}>
              <CopyButton value={data.ip} label="Copy IP" />
              {self ? (
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => void run(null)}
                  disabled={busy}
                >
                  Refresh
                </button>
              ) : null}
            </div>
          </div>

          <dl className="kv" style={{ marginTop: 18 }}>
            <dt>IP version</dt>
            <dd>IPv{data.version}</dd>
            <dt>Country</dt>
            <dd>{data.country ? `${data.country} (${data.countryCode})` : "—"}</dd>
            <dt>Region / city</dt>
            <dd>{[data.region, data.city].filter(Boolean).join(" · ") || "—"}</dd>
            <dt>Continent</dt>
            <dd>{data.continent ?? "—"}</dd>
            <dt>Coordinates</dt>
            <dd>
              {data.latitude !== null && data.longitude !== null
                ? `${data.latitude.toFixed(3)}, ${data.longitude.toFixed(3)}`
                : "—"}
            </dd>
            <dt>Postal code</dt>
            <dd>{data.postal ?? "—"}</dd>
            <dt>ISP</dt>
            <dd>{data.isp ?? "—"}</dd>
            <dt>Organisation</dt>
            <dd>{data.org ?? "—"}</dd>
            <dt>ASN</dt>
            <dd>
              {data.asn ? `AS${data.asn}` : "—"}
              {data.asnDomain ? <span className="micro"> · {data.asnDomain}</span> : null}
            </dd>
            <dt>Time zone</dt>
            <dd>{data.timezone ?? "—"}</dd>
            <dt>Source</dt>
            <dd>{data.source}</dd>
            <dt>Checked</dt>
            <dd>{checkedAt}</dd>
          </dl>

          <p className="micro" style={{ marginTop: 14 }}>
            Geolocation is approximate — usually the city or region of the ISP&apos;s network, not a street
            address. Do not use it to identify a person or to make decisions about them.
          </p>
        </>
      ) : busy ? (
        <p className="micro" style={{ marginTop: 16 }}>
          {self ? "Refreshing…" : "Reading your public address…"}
        </p>
      ) : null}
    </div>
  );
}
