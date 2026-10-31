"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { validateBic, validateIban } from "@/lib/tools/finance";

export default function IbanValidator() {
  const [iban, setIban] = useState("GB82 WEST 1234 5698 7654 32");
  const [bic, setBic] = useState("WESTGB2L");

  const ibanResult = useMemo(() => validateIban(iban), [iban]);
  const bicResult = useMemo(() => validateBic(bic), [bic]);

  return (
    <div className="tool-panel">
      <label className="field-label" htmlFor="iban-input">
        IBAN
      </label>
      <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
        <input
          id="iban-input"
          className="input mono grow"
          value={iban}
          onChange={(event) => setIban(event.target.value)}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={Boolean(ibanResult.error)}
        />
        <CopyButton value={ibanResult.formatted} label="Copy" />
      </div>

      <p
        className={ibanResult.valid ? "ok-text" : ibanResult.error ? "error-text" : "micro"}
        style={{ marginTop: 8 }}
        role="status"
        aria-live="polite"
      >
        {ibanResult.valid
          ? `Valid · ${ibanResult.country} · ${ibanResult.normalized.length} characters · checksum 1`
          : ibanResult.error ?? "Enter an IBAN to check its structure and checksum."}
      </p>

      {ibanResult.normalized ? (
        <dl className="kv" style={{ marginTop: 14 }}>
          <dt>Formatted</dt>
          <dd className="mono">{ibanResult.formatted || "—"}</dd>
          <dt>Country</dt>
          <dd>{ibanResult.country || "—"}</dd>
          <dt>Check digits</dt>
          <dd className="mono">{ibanResult.checkDigits || "—"}</dd>
          <dt>BBAN</dt>
          <dd className="mono" style={{ overflowWrap: "anywhere" }}>
            {ibanResult.bban || "—"}
          </dd>
          <dt>Expected length</dt>
          <dd>{ibanResult.expectedLength === null ? "No table entry for this country" : `${ibanResult.expectedLength} characters`}</dd>
        </dl>
      ) : null}

      <div className="section-head" style={{ marginTop: 22 }}>
        <h3 className="micro">BIC / SWIFT code</h3>
      </div>
      <input
        id="bic-input"
        className="input mono"
        style={{ marginTop: 6 }}
        value={bic}
        onChange={(event) => setBic(event.target.value)}
        spellCheck={false}
        autoComplete="off"
        aria-label="BIC or SWIFT code"
        aria-invalid={Boolean(bicResult.error)}
      />
      <p
        className={bicResult.valid ? "ok-text" : bicResult.error ? "error-text" : "micro"}
        style={{ marginTop: 8 }}
        role="status"
        aria-live="polite"
      >
        {bicResult.valid
          ? `Valid · bank ${bicResult.bank} · country ${bicResult.country} · ${bicResult.branch ? `branch ${bicResult.branch}` : "head office"}`
          : bicResult.error ?? "Enter a BIC to check its structure."}
      </p>

      <p className="micro" style={{ marginTop: 16 }}>
        A valid checksum means the characters are consistent; it does not prove the account is open or belongs to
        the payee. Nothing here is sent to a server.
      </p>
    </div>
  );
}
