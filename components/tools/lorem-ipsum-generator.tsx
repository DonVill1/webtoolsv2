"use client";

import { useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";

const CLASSIC =
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum".split(
    " ",
  );

const EXTRA =
  "aenean massa cum sociis natoque penatibus magnis dis parturient montes nascetur ridiculus mus donec quam felis ultricies nec pellentesque eu pretium quis sem nulla consequat massa quis enim donec pede justo fringilla vel aliquet nec vulputate eget arcu in enim justo rhoncus ut imperdiet vitae iaculis at erat".split(
    " ",
  );

const WORDS = [...CLASSIC, ...EXTRA];

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function sentence(): string {
  const length = 8 + Math.floor(Math.random() * 12);
  const words = Array.from({ length }, () => pick(WORDS));
  const text = words.join(" ");
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

export default function LoremIpsumGenerator() {
  const [paragraphs, setParagraphs] = useState(3);
  const [sentences, setSentences] = useState(4);
  const [classic, setClassic] = useState(true);
  const [text, setText] = useState("");

  function generate() {
    const blocks = Array.from({ length: paragraphs }, (_, paragraphIndex) => {
      if (classic && paragraphIndex === 0) {
        const opening = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. ${Array.from({ length: Math.max(1, sentences - 1) }, sentence).join(" ")}`;
        return opening;
      }
      return Array.from({ length: sentences }, sentence).join(" ");
    });
    setText(blocks.join("\n\n"));
  }

  function download() {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "lorem-ipsum.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="tool-panel">
      <div className="row-wrap">
        <div className="field grow">
          <label htmlFor="lorem-paragraphs">Paragraphs — {paragraphs}</label>
          <input
            id="lorem-paragraphs"
            type="range"
            min="1"
            max="12"
            value={paragraphs}
            onChange={(event) => setParagraphs(Number(event.target.value))}
            style={{ accentColor: "var(--wt-color-accent)" }}
          />
        </div>
        <div className="field grow">
          <label htmlFor="lorem-sentences">Sentences per paragraph — {sentences}</label>
          <input
            id="lorem-sentences"
            type="range"
            min="1"
            max="10"
            value={sentences}
            onChange={(event) => setSentences(Number(event.target.value))}
            style={{ accentColor: "var(--wt-color-accent)" }}
          />
        </div>
        <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13, height: 44 }}>
          <input type="checkbox" checked={classic} onChange={(event) => setClassic(event.target.checked)} />
          Classic opening
        </label>
        <button type="button" className="btn btn-primary" style={{ height: 44 }} onClick={generate}>
          Generate
        </button>
      </div>

      <div className="output" style={{ marginTop: 16, minHeight: 220 }} aria-live="polite">
        {text || "Pick a length and generate placeholder text."}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <CopyButton value={text} label="Copy text" />
        <button type="button" className="btn btn-sm" onClick={download} disabled={!text}>
          Download .txt
        </button>
        <span className="micro" style={{ alignSelf: "center" }} aria-live="polite">
          {text ? `${text.split(/\s+/).filter(Boolean).length} words · ${text.length} characters` : ""}
        </span>
      </div>

      <p className="micro" style={{ marginTop: 14 }}>
        Placeholder text, not Latin prose. It is for layout only — never ship it, and never use it as a stand-in for
        real copy in a review.
      </p>
    </div>
  );
}
