"use client";

import { Fragment, useMemo, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { useNow } from "./useNow";

const sample =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

function base64UrlDecode(part: string): string {
  const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

interface Decoded {
  header?: unknown;
  payload?: unknown;
  error?: string;
  validShape: boolean;
}

function decode(token: string): Decoded {
  const trimmed = token.trim();
  if (!trimmed) return { validShape: false };
  const parts = trimmed.split(".");
  if (parts.length !== 3) {
    return { validShape: false, error: `A JWT has three dot-separated parts; this has ${parts.length}.` };
  }
  try {
    return {
      validShape: true,
      header: JSON.parse(base64UrlDecode(parts[0]!)),
      payload: JSON.parse(base64UrlDecode(parts[1]!)),
    };
  } catch {
    return { validShape: false, error: "The header or payload is not valid base64url-encoded JSON." };
  }
}

function timeClaims(payload: unknown): Array<{ label: string; value: string }> {
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  const claims: Array<{ label: string; value: string }> = [];
  for (const [key, label] of [
    ["iat", "Issued at"],
    ["nbf", "Not before"],
    ["exp", "Expires"],
  ] as const) {
    const value = record[key];
    if (typeof value === "number") {
      const date = new Date(value * 1000);
      claims.push({ label, value: `${date.toISOString()} (${date.toUTCString()})` });
    }
  }
  return claims;
}

function base64UrlToBytes(part: string): Uint8Array {
  const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function bytesToBase64Url(bytes: ArrayBuffer): string {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function verifyHmac(token: string, secret: string): Promise<{ ok: boolean; message: string }> {
  const parts = token.trim().split(".");
  if (parts.length !== 3) return { ok: false, message: "A token needs a header, payload and signature." };
  const header = JSON.parse(base64UrlDecode(parts[0]!)) as { alg?: unknown };
  const alg = typeof header.alg === "string" ? header.alg : "";
  if (!/^HS(256|384|512)$/.test(alg)) {
    return { ok: false, message: `This verifier handles HS256, HS384 and HS512; the header names ${alg || "no algorithm"}.` };
  }
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: `SHA-${alg.slice(2)}` },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
  const computed = bytesToBase64Url(signature);
  const actualBytes = base64UrlToBytes(parts[2]!);
  const expectedBytes = base64UrlToBytes(computed);
  const equal =
    actualBytes.length === expectedBytes.length && actualBytes.every((byte, index) => byte === expectedBytes[index]);
  return equal
    ? { ok: true, message: `Signature verified with ${alg}. The token was signed with this secret and has not been altered.` }
    : { ok: false, message: "Signature does not match. The secret is wrong, or the header or payload was changed." };
}

export default function JwtDecoder() {
  const [token, setToken] = useState(sample);
  const [secret, setSecret] = useState("");
  const [verification, setVerification] = useState<{ ok: boolean; message: string } | null>(null);
  const [verifying, setVerifying] = useState(false);
  const decoded = useMemo(() => decode(token), [token]);

  const expClaim =
    decoded.payload && typeof decoded.payload === "object"
      ? (decoded.payload as Record<string, unknown>).exp
      : undefined;
  const expiry = typeof expClaim === "number" ? expClaim * 1000 : null;
  const now = useNow(30_000);
  const expired = expiry !== null && now > 0 && expiry < now;

  return (
    <div className="tool-panel">
      <div className="row-wrap" style={{ justifyContent: "space-between" }}>
        <label className="field-label" htmlFor="jwt-input">
          Token
        </label>
        <button type="button" className="tab" onClick={() => setToken("")} style={{ height: 26 }}>
          Clear
        </button>
      </div>
      <textarea
        id="jwt-input"
        className="textarea"
        style={{ minHeight: 110, marginTop: 6 }}
        spellCheck={false}
        value={token}
        onChange={(event) => {
          setToken(event.target.value);
          setVerification(null);
        }}
        placeholder="eyJhbGciOi…"
        aria-invalid={!decoded.validShape && token.trim() !== ""}
      />

      <div role="status" aria-live="polite" style={{ marginTop: 10 }}>
        {!token.trim() ? (
          <p className="micro">Paste a token; nothing is sent anywhere.</p>
        ) : decoded.validShape ? (
          <p className={expired ? "warning-text" : "ok-text"}>
            {verification?.ok ? "Signature verified" : "Signature not checked"} ·{" "}
            {expired ? "token is expired" : "decoded locally"}
            {expiry ? ` · exp ${new Date(expiry).toISOString()}` : ""}
          </p>
        ) : (
          <p className="error-text">{decoded.error}</p>
        )}
      </div>

      {decoded.header ? (
        <div className="grid-2" style={{ marginTop: 18 }}>
          <section>
            <div className="row-wrap" style={{ justifyContent: "space-between", marginBottom: 6 }}>
              <span className="field-label">Header</span>
              <CopyButton value={JSON.stringify(decoded.header, null, 2)} label="Copy" />
            </div>
            <pre className="output">{JSON.stringify(decoded.header, null, 2)}</pre>
          </section>
          <section>
            <div className="row-wrap" style={{ justifyContent: "space-between", marginBottom: 6 }}>
              <span className="field-label">Payload</span>
              <CopyButton value={JSON.stringify(decoded.payload, null, 2)} label="Copy" />
            </div>
            <pre className="output">{JSON.stringify(decoded.payload, null, 2)}</pre>
          </section>
        </div>
      ) : null}

      {decoded.payload ? (
        <dl className="kv" style={{ marginTop: 18 }}>
          {timeClaims(decoded.payload).map((claim) => (
            <Fragment key={claim.label}>
              <dt>{claim.label}</dt>
              <dd>{claim.value}</dd>
            </Fragment>
          ))}
        </dl>
      ) : null}

      <div className="callout" style={{ marginTop: 18 }}>
        <strong>Decoding is not verification.</strong> This reads the claims without checking the signature, so a
        decoded token proves nothing about who issued it. Verify signatures on your server with the issuer&apos;s
        keys.
      </div>

      <div className="field" style={{ marginTop: 18 }}>
        <label htmlFor="jwt-secret">Verify an HMAC signature (optional)</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            id="jwt-secret"
            className="input grow"
            type="password"
            value={secret}
            onChange={(event) => {
              setSecret(event.target.value);
              setVerification(null);
            }}
            placeholder="HS256/384/512 secret"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="button"
            className="btn btn-primary"
            disabled={!secret || !decoded.validShape || verifying}
            onClick={async () => {
              setVerifying(true);
              try {
                setVerification(await verifyHmac(token, secret));
              } catch {
                setVerification({ ok: false, message: "The signature or secret could not be read." });
              } finally {
                setVerifying(false);
              }
            }}
          >
            {verifying ? "Verifying…" : "Verify locally"}
          </button>
        </div>
        {verification ? (
          <p className={verification.ok ? "ok-text" : "error-text"} role="status" aria-live="polite" style={{ marginTop: 6 }}>
            {verification.message}
          </p>
        ) : (
          <p className="micro" style={{ marginTop: 6 }}>
            Symmetric HMAC only, computed in this tab. RS256 and ES256 need the issuer&apos;s public key and are not
            attempted here. Use a test secret, not a production one.
          </p>
        )}
      </div>
    </div>
  );
}
