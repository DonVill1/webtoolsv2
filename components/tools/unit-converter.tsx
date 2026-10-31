"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { Icon } from "@/components/ui/Icon";
import {
  categoryBySlug,
  convertUnit,
  formatNumber,
  getUnit,
  unitCategories,
} from "@/lib/units/registry";
import { useToolView } from "./useToolView";

type Direction = "forward" | "reverse";

export default function UnitConverter() {
  const { view } = useToolView("unit-converter");
  const [from, setFrom] = useState("m");
  const [to, setTo] = useState("ft");
  const [value, setValue] = useState("1");
  const [direction, setDirection] = useState<Direction>("forward");

  const category = categoryBySlug.get(view) ?? unitCategories[0]!;
  // The tab can change the family while the stored units belong to the old
  // one, so fall back to the family's defaults instead of throwing.
  const known = (id: string) => category.units.some((unit) => unit.id === id);
  const fromId = known(from) ? from : category.defaultFrom;
  const toId = known(to) ? to : category.defaultTo;
  const fromUnit = getUnit(category.id, fromId);
  const toUnit = getUnit(category.id, toId);
  const activeFrom = direction === "forward" ? fromUnit : toUnit;
  const activeTo = direction === "forward" ? toUnit : fromUnit;

  const parsed = Number(value.trim());
  const valid = value.trim() !== "" && Number.isFinite(parsed);

  const result = useMemo(() => {
    if (!valid) return null;
    return convertUnit(category.id, parsed, activeFrom.id, activeTo.id);
  }, [category.id, parsed, activeFrom.id, activeTo.id, valid]);

  const unitOne = convertUnit(category.id, 1, activeFrom.id, activeTo.id);
  const reverseOne = convertUnit(category.id, 1, activeTo.id, activeFrom.id);

  const tableValue = valid ? parsed : 0;

  return (
    <div className="tool-panel">
      <p className="micro" style={{ marginBottom: 14 }}>
        {category.intro}
      </p>

      <div className="row-wrap">
        <div className="field grow">
          <label htmlFor="unit-value">Value</label>
          <input
            id="unit-value"
            className="input"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            aria-invalid={!valid && value.trim() !== ""}
          />
        </div>

        <div className="field grow">
          <label htmlFor="unit-from">From</label>
          <select id="unit-from" className="select" value={activeFrom.id} onChange={(event) => {
            if (direction === "forward") setFrom(event.target.value);
            else setTo(event.target.value);
          }}>
            {category.units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name} ({unit.symbol})
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="btn"
          style={{ height: 44 }}
          onClick={() => setDirection((current) => (current === "forward" ? "reverse" : "forward"))}
          aria-label="Swap the two units"
          title="Swap units"
        >
          <Icon name="swap" size={18} />
        </button>

        <div className="field grow">
          <label htmlFor="unit-to">To</label>
          <select id="unit-to" className="select" value={activeTo.id} onChange={(event) => {
            if (direction === "forward") setTo(event.target.value);
            else setFrom(event.target.value);
          }}>
            {category.units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name} ({unit.symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="readout" role="status" aria-live="polite">
        <div>
          <span className="readout-value">
            {result === null ? "—" : formatNumber(result)}
            <span className="readout-unit">{activeTo.symbol}</span>
          </span>
          <div className="micro" style={{ marginTop: 6 }}>
            {valid ? `${formatNumber(parsed)} ${activeFrom.symbol} converted` : "Enter a number to convert"}
          </div>
        </div>
        <div className="readout-formula">
          1 {activeFrom.symbol} = {formatNumber(unitOne, 8)} {activeTo.symbol}
          <br />
          1 {activeTo.symbol} = {formatNumber(reverseOne, 8)} {activeFrom.symbol}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
        <CopyButton
          value={result === null ? "" : `${result} ${activeTo.symbol}`}
          label="Copy result"
        />
        <CopyButton
          value={`${parsed} ${activeFrom.symbol} = ${result === null ? "—" : `${result} ${activeTo.symbol}`}`}
          label="Copy working"
        />
      </div>

      <div className="table-wrap" style={{ marginTop: 22 }}>
        <table className="table">
          <caption>
            {category.name} — {valid ? formatNumber(parsed) : "0"} {activeFrom.symbol} in every unit
          </caption>
          <tbody>
            {category.units.map((unit) => {
              const converted = convertUnit(category.id, tableValue, activeFrom.id, unit.id);
              return (
                <tr key={unit.id}>
                  <td>
                    {unit.name} <span className="mono muted">({unit.symbol})</span>
                    {unit.note ? <div className="micro">{unit.note}</div> : null}
                  </td>
                  <td className="num">{formatNumber(converted)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
