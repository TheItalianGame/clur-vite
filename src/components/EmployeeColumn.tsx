import React from "react";
import type { CalendarItem, RecordKind, AnyRecord } from "../types";

interface Props {
  label: string;
  items: CalendarItem[];
  dayHeight: number;
  renderBox: (rec: AnyRecord, type: RecordKind) => React.ReactNode;
}

const EmployeeColumn: React.FC<Props> = ({ label, items, dayHeight, renderBox }) => (
  <div className="employee-col" style={{ height: dayHeight }}>
    <div className="employee-label">{label}</div>
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

export default EmployeeColumn;
