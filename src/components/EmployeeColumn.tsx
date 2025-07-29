import React from "react";
import type { AnyRecord, RecordKind, EventRecord, LeadRecord, PatientCheckinRecord } from "../types";
import LeadBox from "./LeadBox";
import EventBox from "./EventBox";
import PatientCheckinBox from "./PatientCheckinBox";
import "./WeeklyCalendar.css";

export interface ColumnItem {
  top: number;
  height: number;
  kind: "circle" | "pill";
  color: string;
  rec: AnyRecord;
  type: RecordKind;
}

interface Props {
  label: string;
  items: ColumnItem[];
  dayHeight: number;
}

const renderBox = (rec: AnyRecord, type: RecordKind) => {
  switch (type) {
    case "Lead":
      return <LeadBox data={rec as LeadRecord} />;
    case "Event":
      return <EventBox data={rec as EventRecord} />;
    default:
      return <PatientCheckinBox data={rec as PatientCheckinRecord} />;
  }
};

const EmployeeColumn: React.FC<Props> = ({ label, items, dayHeight }) => (
  <div className="employee-column">
    <div className="emp-label">{label}</div>
    <div className="emp-grid" style={{ height: dayHeight }}>
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
  </div>
);

export default EmployeeColumn;
