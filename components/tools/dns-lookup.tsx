"use client";

import { useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { DNS_TYPES, type DnsRecordType } from "@/lib/network/dns";

interface DnsRecord {
  name: string;
  type: string;
  ttl: number;
  data: string;
  raw: string;
}

interface DnsResponse {
  name: string;
  type: string;
  status: number;
  statusLabel: string;
  records: DnsRecord[];
  authority: DnsRecord[];
  checkedAt: string;
  resolver: string;
  error?: string;
}

type Outcome = "records" | "nodata" | "nxdomain" | "error";

function outcomeOf(data: DnsResponse): Outcome {
  if (data.status === 3) return "nxdomain";
  if (data.status !== 0) return "error";
  return data.records.length > 0 ? "records" : "nodata";
}

const FAILURE_ADVICE: Record<string, string> = {
  SERVFAIL:
    "SERVFAIL means the resolver could not get an answer — usually a broken delegation or unreachable authoritative nameserver, not a missing record.",
  REFUSED: "REFUSED means the nameserver declined the query, which is common for zones that block public recursion.",
  FORMERR: "FORMERR means the query was rejected as malformed, which is rare for a normal name and type.",
};

export default function DnsLookup() {
  const [name, setName] = useState("");
  const [type, setType] = useState<DnsRecordType>("A");
  const [data, setData] = useState<DnsResponse | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [hasQueried, setHasQueried] = useState(false);

  async function lookup(target = name, recordType = type, fresh = false) {
    const query = target.trim();
    if (!query) {
      setError("Enter a domain name, for example example.com.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const params = new URLSearchParams({ name: query, type: recordType });
      if (fresh) params.set("fresh", "1");

      const response = await fetch(`/api/dns?${params.toString()}`, {
        headers: { accept: "application/json" },
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => ({}))) as DnsResponse;
      setHasQueried(true);

      if (!response.ok) {
        setData(null);
        setError(payload.error ?? "The lookup failed.");
        return;
      }

      setData(payload);
      setName(payload.name);
    } catch {
      setData(null);
      setError("The request could not be completed. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const outcome = data ? outcomeOf(data) : null;
  const report = data
    ? [
        `${data.name} · ${data.type} · ${data.statusLabel} (${data.status})`,
        ...data.records.map((record) => `${record.name}\t${record.ttl}\t${record.type}\t${record.data}`),
      ].join("\n")
    : "";

  return (
    <div className="tool-panel">
      <form
        className="row-wrap"
        onSubmit={(event) => {
          event.preventDefault();
          void lookup();
        }}
      >
        <div className="field grow">
          <label htmlFor="dns-name">Domain or URL</label>
          <input
            id="dns-name"
            className="input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="example.com"
            autoComplete="off"
            spellCheck={false}
            inputMode="url"
          />
        </div>
        <div className="field" style={{ width: 120 }}>
          <label htmlFor="dns-type">Record</label>
          <select
            id="dns-type"
            className="select"
            value={type}
            onChange={(event) => {
              const next = event.target.value as DnsRecordType;
              setType(next);
              if (hasQueried) void lookup(name, next);
            }}
          >
            {DNS_TYPES.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary" style={{ height: 44 }} disabled={busy}>
          {busy ? "Looking up…" : "Look up"}
        </button>
      </form>

      <p className="micro" style={{ marginTop: 8 }}>
        Paste a full URL if that is easier: the scheme, path, port and trailing dot are removed before the query.
      </p>

      <div style={{ marginTop: 12 }}>
        {error ? (
          <p className="error-text" role="alert">
            {error}
          </p>
        ) : null}

        {data ? (
          <>
            <p className="micro" style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <span>
                <strong>{data.name}</strong> · {data.type}
              </span>
              <span className={data.status === 0 ? "ok-text" : "warning-text"}>
                {data.statusLabel} ({data.status})
              </span>
              <span>
                {data.records.length} answer{data.records.length === 1 ? "" : "s"}
              </span>
              <span>via {data.resolver}</span>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => void lookup(data.name, data.type as DnsRecordType, true)}
                disabled={busy}
              >
                Re-check
              </button>
              {data.records.length > 0 ? <CopyButton value={report} label="Copy records" /> : null}
            </p>

            {outcome === "nxdomain" ? (
              <div className="callout" style={{ marginTop: 12 }}>
                <strong>NXDOMAIN — this name does not exist.</strong> Check the spelling. A domain registered
                in the last few hours may not be delegated to nameservers yet.
              </div>
            ) : null}

            {outcome === "error" ? (
              <div className="callout" style={{ marginTop: 12 }}>
                <strong>The resolver returned {data.statusLabel}.</strong>{" "}
                {FAILURE_ADVICE[data.statusLabel] ??
                  "That is a resolver-side failure, not evidence that the record is missing."}
              </div>
            ) : null}

            {outcome === "nodata" ? (
              <div className="callout" style={{ marginTop: 12 }}>
                <strong>The name exists but publishes no {data.type} record.</strong> That is a NODATA
                answer, not NXDOMAIN. Try another type:
                <span className="row-wrap" style={{ gap: 6, marginTop: 8 }}>
                  {DNS_TYPES.filter((entry) => entry !== data.type).map((entry) => (
                    <button
                      key={entry}
                      type="button"
                      className="btn btn-sm"
                      onClick={() => {
                        setType(entry);
                        void lookup(data.name, entry);
                      }}
                      disabled={busy}
                    >
                      {entry}
                    </button>
                  ))}
                </span>
              </div>
            ) : null}

            {data.records.length > 0 ? (
              <div className="table-wrap" style={{ marginTop: 12 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Name</th>
                      <th className="num">TTL</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.records.map((record, index) => (
                      <tr key={`${record.type}-${index}`}>
                        <td className="mono">{record.type}</td>
                        <td className="mono">{record.name}</td>
                        <td className="num">{record.ttl}</td>
                        <td className="mono" style={{ overflowWrap: "anywhere" }}>
                          {record.data}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {data.authority.length > 0 ? (
              <div className="table-wrap" style={{ marginTop: 18 }}>
                <table className="table">
                  <caption>Authority section — the zone that answered, and when its serial last changed</caption>
                  <tbody>
                    {data.authority.map((record, index) => (
                      <tr key={`auth-${index}`}>
                        <td className="mono">{record.type}</td>
                        <td className="mono">{record.name}</td>
                        <td className="mono" style={{ overflowWrap: "anywhere" }}>
                          {record.data}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            <p className="micro" style={{ marginTop: 12 }}>
              Checked at {new Date(data.checkedAt).toLocaleTimeString("en-US")}. Answers are cached for up to
              a minute; use Re-check to query the resolver again.
            </p>
          </>
        ) : null}
      </div>

      <p className="micro" style={{ marginTop: 16 }}>
        Queries go through this site&apos;s server to Cloudflare&apos;s DNS-over-HTTPS resolver, which is a
        recursive cache rather than an authoritative nameserver. Private zones and names that only exist on
        your local network cannot be queried from here.
      </p>
    </div>
  );
}
