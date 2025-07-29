import React from "react";
import type { AnyRecord, RecordKind } from "../types";

export interface ColumnItem {
  top: number;
  height: number;
  kind: "circle" | "pill";
  color: string;
  rec: AnyRecord;
  type: RecordKind;
}

interface Props {
  employee: string;
  items: ColumnItem[];
  renderBox: (rec: AnyRecord, type: RecordKind) => React.ReactNode;
}

const EmployeeColumn: React.FC<Props> = ({ employee, items, renderBox }) => {
  const abbr = employee
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <div className="emp-col">
      <div className="emp-label">{abbr}</div>
      {items.map((it, i) => (
        <div
          key={i}
          className={`item ${it.kind}`}
          style={{
            top: `${it.top}px`,
            "--item-height": it.kind === "circle" ? "12px" : `${it.height}px`,
            "--bg-color": it.color,
          } as React.CSSProperties}
        >
          <div className="item-content">{renderBox(it.rec, it.type)}</div>
        </div>
      ))}
    </div>
  );
};

export default EmployeeColumn;
