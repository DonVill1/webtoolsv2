"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { subnet } from "@/lib/tools/subnet";

const samples = ["192.168.1.10/24", "10.0.0.0/30", "172.16.0.0/12", "2001:db8::/48"];

export default function SubnetCalculator() {
  const [input, setInput] = useState("192.168.1.10/24");
  const { result, error } = useMemo(() => subnet(input), [input]);

  const summary = result
    ? `${result.network}/${result.prefix} · ${result.family} · ${result.usable.toLocaleString("en-US")} usable`
    : "";

  return (
    <div className="tool-panel">
      <label className="field-label" htmlFor="subnet-input">
        Address and prefix
      </label>
      <div className="row-wrap" style={{ marginTop: 6 }}>
        <div className="field grow">
          <input
            id="subnet-input"
            className="input mono"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            spellCheck={false}
            placeholder="192.168.1.10/24"
            aria-invalid={Boolean(error)}
          />
        </div>
        <CopyButton value={result ? `${result.network}/${result.prefix}` : ""} label="Copy network" />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        {samples.map((sample) => (
          <button key={sample} type="button" className="tab" onClick={() => setInput(sample)}>
            <span className="mono">{sample}</span>
          </button>
        ))}
      </div>

      <div className="readout" role="status" aria-live="polite">
        <div>
          <span className="readout-value mono" style={{ fontSize: "calc(var(--nexus-type-xl) * 0.6)" }}>
            {result ? `${result.network}/${result.prefix}` : "—"}
          </span>
          <div className="micro" style={{ marginTop: 6 }}>
            {result ? `${result.family} · ${result.usable.toLocaleString("en-US")} usable hosts` : "Enter a CIDR block"}
          </div>
        </div>
        <div className="readout-formula">
          network = address AND mask
          <br />
          {result ? result.mask : "—"}
        </div>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      {result ? (
        <dl className="kv" style={{ marginTop: 18 }}>
          <dt>Network address</dt>
          <dd className="mono">{result.network}</dd>
          <dt>Subnet mask</dt>
          <dd className="mono">{result.mask}</dd>
          <dt>Wildcard mask</dt>
          <dd className="mono">{result.wildcard}</dd>
          <dt>First usable</dt>
          <dd className="mono">{result.first}</dd>
          <dt>Last usable</dt>
          <dd className="mono">{result.last}</dd>
          {result.broadcast ? (
            <>
              <dt>Broadcast</dt>
              <dd className="mono">{result.broadcast}</dd>
            </>
          ) : null}
          <dt>Total addresses</dt>
          <dd>{result.total.toLocaleString("en-US")}</dd>
          <dt>Usable hosts</dt>
          <dd>{result.usable.toLocaleString("en-US")}</dd>
          {result.family === "IPv4" ? (
            <>
              <dt>Network in binary</dt>
              <dd className="mono" style={{ overflowWrap: "anywhere" }}>
                {result.binary.slice(0, result.prefix)} {result.binary.slice(result.prefix)}
              </dd>
            </>
          ) : null}
        </dl>
      ) : null}

      <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
        <CopyButton value={summary} label="Copy summary" />
      </div>

      <p className="micro" style={{ marginTop: 14 }}>
        IPv4 reserves the network and broadcast addresses, so a /24 has 254 usable hosts; /31 and /32 are the
        point-to-point and single-host exceptions. IPv6 has no broadcast address and subtracts nothing.
      </p>
    </div>
  );
}
