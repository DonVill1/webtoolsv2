"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { testRegex } from "@/lib/tools/regex";

const FLAGS = [
  ["g", "global"],
  ["i", "ignore case"],
  ["m", "multiline"],
  ["s", "dotall"],
  ["u", "unicode"],
  ["y", "sticky"],
] as const;

export default function RegexTester() {
  const [pattern, setPattern] = useState("\\b\\w+@\\w+\\.\\w+\\b");
  const [flags, setFlags] = useState("gi");
  const [text, setText] = useState("Write to ada@example.com or grace@example.org.\nSupport is at help@example.net.");
  const [replacement, setReplacement] = useState("[redacted]");

  const result = useMemo(() => testRegex(pattern, flags, text, replacement), [pattern, flags, text, replacement]);
  const showReplacement = replacement !== "";

  function toggleFlag(flag: string) {
    setFlags((current) =>
      current.includes(flag) ? current.replace(flag, "") : `${current}${flag}`,
    );
  }

  return (
    <div className="tool-panel">
      <label className="field-label" htmlFor="regex-pattern">
        Pattern
      </label>
      <div style={{ display: "flex", gap: 8, alignItems: "stretch", marginTop: 6 }}>
        <span className="mono" style={{ alignSelf: "center", color: "var(--wt-color-ink-soft)" }}>
          /
        </span>
        <input
          id="regex-pattern"
          className="input mono grow"
          value={pattern}
          onChange={(event) => setPattern(event.target.value)}
          spellCheck={false}
        />
        <span className="mono" style={{ alignSelf: "center", color: "var(--wt-color-ink-soft)" }}>
          /{flags}
        </span>
      </div>

      <div className="row-wrap" style={{ marginTop: 10 }}>
        {FLAGS.map(([flag, label]) => (
          <label key={flag} style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13 }}>
            <input type="checkbox" checked={flags.includes(flag)} onChange={() => toggleFlag(flag)} />
            <span className="mono">{flag}</span>
            <span className="micro">{label}</span>
          </label>
        ))}
      </div>

      <label className="field-label" htmlFor="regex-text" style={{ display: "block", marginTop: 14 }}>
        Test text
      </label>
      <textarea
        id="regex-text"
        className="textarea"
        style={{ minHeight: 120, marginTop: 6 }}
        value={text}
        onChange={(event) => setText(event.target.value)}
        spellCheck={false}
      />

      <label className="field-label" htmlFor="regex-replacement" style={{ display: "block", marginTop: 12 }}>
        Replacement (optional)
      </label>
      <input
        id="regex-replacement"
        className="input mono"
        style={{ marginTop: 6 }}
        value={replacement}
        onChange={(event) => setReplacement(event.target.value)}
        spellCheck={false}
        placeholder="$1, $<name> or $&"
      />

      <div className="row-wrap" style={{ justifyContent: "space-between", marginTop: 16 }}>
        <span className="field-label">
          {result.matches.length} match{result.matches.length === 1 ? "" : "es"}
          {result.truncated ? " (stopped at 1,000)" : ""}
        </span>
        <CopyButton value={showReplacement ? result.replaced : result.matches.map((match) => match.value).join("\n")} label="Copy" />
      </div>

      {result.error ? (
        <p className="error-text" role="alert">
          {result.error}
        </p>
      ) : (
        <div className="table-wrap" style={{ marginTop: 8 }}>
          <table>
            <caption>Every match, with its start index</caption>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Index</th>
                <th scope="col">Match</th>
                <th scope="col">Groups</th>
              </tr>
            </thead>
            <tbody>
              {result.matches.length === 0 ? (
                <tr>
                  <td colSpan={4} className="micro">
                    No matches.
                  </td>
                </tr>
              ) : (
                result.matches.map((match, index) => (
                  <tr key={`${match.index}-${index}`}>
                    <td>{index + 1}</td>
                    <td>{match.index}</td>
                    <td className="mono">{match.value || "(empty)"}</td>
                    <td className="mono">
                      {match.groups.length === 0
                        ? "—"
                        : match.groups.map((group) => group ?? "undefined").join(" · ")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showReplacement ? (
        <>
          <div className="row-wrap" style={{ justifyContent: "space-between", marginTop: 18 }}>
            <span className="field-label">Replaced</span>
            <CopyButton value={result.replaced} label="Copy result" />
          </div>
          <pre className="output">{result.replaced || "—"}</pre>
        </>
      ) : null}

      <p className="micro" style={{ marginTop: 14 }}>
        JavaScript regular expressions. Lookbehind depends on the browser, and the tab stops after 1,000 matches so a
        broad pattern cannot lock it.
      </p>
    </div>
  );
}
