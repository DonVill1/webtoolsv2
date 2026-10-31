"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { Icon } from "@/components/ui/Icon";
import { convertUnit, formatNumber, type UnitCategoryId } from "@/lib/units/registry";

export function PairConverter({
  category,
  fromId,
  toId,
  fromSymbol,
  toSymbol,
  fromName,
  toName,
  formula,
  defaultValue = 1,
}: {
  category: UnitCategoryId;
  fromId: string;
  toId: string;
  fromSymbol: string;
  toSymbol: string;
  fromName: string;
  toName: string;
  formula: string;
  defaultValue?: number;
}) {
  const [value, setValue] = useState(String(defaultValue));
  const [swapped, setSwapped] = useState(false);
  const [pageUrl, setPageUrl] = useState("");
  const id = useId();

  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  const parsed = Number.parseFloat(value);
  const result = useMemo(() => {
    if (!Number.isFinite(parsed)) return null;
    return convertUnit(category, parsed, swapped ? toId : fromId, swapped ? fromId : toId);
  }, [category, fromId, toId, parsed, swapped]);

  const a = swapped ? toSymbol : fromSymbol;
  const b = swapped ? fromSymbol : toSymbol;
  const aName = swapped ? toName : fromName;
  const bName = swapped ? fromName : toName;

  return (
    <div className="tool-panel">
      <div className="row-wrap" style={{ alignItems: "end" }}>
        <div className="field grow">
          <label htmlFor={id}>Value in {aName.toLowerCase()}</label>
          <input
            id={id}
            className="input"
            type="number"
            inputMode="decimal"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            step="any"
          />
        </div>
        <button
          type="button"
          className="btn"
          style={{ height: 44 }}
          onClick={() => setSwapped((current) => !current)}
          aria-label={`Swap ${a} and ${b}`}
          title="Swap direction"
        >
          <Icon name="swap" size={18} />
        </button>
        <div className="field grow">
          <span className="field-label">Result in {bName.toLowerCase()}</span>
          <div className="input" style={{ display: "flex", alignItems: "center", fontWeight: 500 }}>
            {result === null ? "—" : `${formatNumber(result)} ${b}`}
          </div>
        </div>
      </div>

      <div className="readout" role="status" aria-live="polite">
        <div>
          <span className="readout-value">
            {result === null ? "—" : formatNumber(parsed)} {a}
          </span>
          <span className="readout-unit">= {result === null ? "—" : formatNumber(result)}</span>
          <span className="readout-unit">{b}</span>
        </div>
        <div className="readout-formula">{formula}</div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
        <CopyButton
          value={result === null ? "" : `${parsed} ${a} = ${result} ${b}`}
          label="Copy result"
        />
        <CopyButton value={pageUrl} label="Copy link" copiedLabel="Link copied" className="btn btn-sm" />
      </div>
    </div>
  );
}
