"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";

const sample =
  "A good tool page answers the question before it explains itself. The number comes first, then the formula, then the caveat. Readers arrive from a search result with one small task and very little patience.";

function syllables(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!clean) return 0;
  if (clean.length <= 3) return 1;
  const groups = clean
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    .replace(/^y/, "")
    .match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups?.length ?? 1);
}

export default function TextAnalyzer() {
  const [text, setText] = useState(sample);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.match(/[\p{L}\p{N}'’-]+/gu) ?? [] : [];
    const sentences = trimmed ? trimmed.split(/[.!?]+(?:\s|$)/).filter((entry) => entry.trim().length > 0) : [];
    const paragraphs = trimmed ? trimmed.split(/\n{2,}/).filter((entry) => entry.trim().length > 0) : [];
    const totalSyllables = words.reduce((sum, word) => sum + syllables(word), 0);
    const avgSentence = sentences.length ? words.length / sentences.length : 0;
    const flesch = sentences.length && words.length
      ? 206.835 - 1.015 * avgSentence - 84.6 * (totalSyllables / words.length)
      : 0;
    const grade = 0.39 * avgSentence + 11.8 * (totalSyllables / Math.max(1, words.length)) - 15.59;

    const counts = new Map<string, number>();
    for (const word of words) {
      const key = word.toLowerCase();
      if (key.length < 3) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const top = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 12);

    const longest = sentences.reduce((best, entry) => (entry.length > best.length ? entry : best), "");

    return {
      words: words.length,
      characters: text.length,
      charactersNoSpaces: text.replace(/\s/g, "").length,
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      avgSentence,
      flesch,
      grade,
      top,
      longest,
      readingTime: Math.max(1, Math.ceil(words.length / 220)),
    };
  }, [text]);

  const readingLabel = (score: number) => {
    if (score >= 80) return "Very easy — around 5th grade";
    if (score >= 70) return "Easy — around 6th–7th grade";
    if (score >= 60) return "Plain — around 8th–9th grade";
    if (score >= 50) return "Fairly difficult — high school";
    if (score >= 30) return "Difficult — college";
    return "Very difficult — graduate level";
  };

  return (
    <div className="tool-panel">
      <div className="field">
        <label htmlFor="analyzer-text">Text</label>
        <textarea
          id="analyzer-text"
          className="textarea"
          style={{ minHeight: 180 }}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="readout" style={{ margin: 0, borderTop: 0, paddingTop: 0 }}>
          <div>
            <span className="readout-value">{stats.words.toLocaleString("en-US")}</span>
            <div className="micro" style={{ marginTop: 4 }}>words</div>
          </div>
          <div className="readout-formula">
            {stats.sentences.toLocaleString("en-US")} sentences
            <br />
            {stats.paragraphs.toLocaleString("en-US")} paragraphs
          </div>
        </div>
        <div className="readout" style={{ margin: 0, borderTop: 0, paddingTop: 0 }}>
          <div>
            <span className="readout-value">{Math.round(stats.flesch)}</span>
            <div className="micro" style={{ marginTop: 4 }}>Flesch reading ease</div>
          </div>
          <div className="readout-formula">
            grade {stats.grade.toFixed(1)}
            <br />~{stats.readingTime} min read
          </div>
        </div>
      </div>

      <p className="micro" style={{ marginTop: 6 }}>{readingLabel(stats.flesch)}</p>

      <dl className="kv" style={{ marginTop: 16 }}>
        <dt>Characters</dt>
        <dd>{stats.characters.toLocaleString("en-US")} ({stats.charactersNoSpaces.toLocaleString("en-US")} without spaces)</dd>
        <dt>Average sentence</dt>
        <dd>{stats.avgSentence.toFixed(1)} words</dd>
        <dt>Longest sentence</dt>
        <dd style={{ maxWidth: "60ch" }}>{stats.longest ? `${stats.longest.trim().slice(0, 160)}${stats.longest.length > 160 ? "…" : ""}` : "—"}</dd>
      </dl>

      <div style={{ marginTop: 18 }}>
        <span className="field-label">Most frequent words</span>
        {stats.top.length ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {stats.top.map(([word, count]) => (
              <span
                key={word}
                className="mono"
                style={{
                  border: "1px solid var(--wt-color-line)",
                  borderRadius: "var(--nexus-radius-sm)",
                  padding: "4px 8px",
                  fontSize: 12,
                }}
              >
                {word} <span className="micro">{count}</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="micro" style={{ marginTop: 6 }}>No words of three letters or more.</p>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
        <CopyButton
          value={`Words: ${stats.words}\nSentences: ${stats.sentences}\nParagraphs: ${stats.paragraphs}\nFlesch reading ease: ${Math.round(stats.flesch)}\nFlesch-Kincaid grade: ${stats.grade.toFixed(1)}`}
          label="Copy statistics"
        />
        <button type="button" className="btn btn-sm" onClick={() => setText("")}>
          Clear
        </button>
      </div>

      <p className="micro" style={{ marginTop: 14 }}>
        Syllables are estimated with a rule-based counter, so the reading scores are approximate. British and
        American spellings can shift a score by a few points.
      </p>
    </div>
  );
}
