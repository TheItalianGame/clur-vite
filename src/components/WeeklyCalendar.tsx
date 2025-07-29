import React, { useMemo } from "react";
import type {
  EmployeeData,
  EventRecord,
  RecordKind,
  AnyRecord,
  LeadRecord,
  PatientCheckinRecord,
} from "../types.ts";
import {
  toDate,
  inSameWeek,
  normalizeWeekStart,
  dayIndexFromWeekStart,
  minutesFromDayStart,
} from "../utils/date";
import LeadBox from "./LeadBox";
import EventBox from "./EventBox";
import PatientCheckinBox from "./PatientCheckinBox";
import "./WeeklyCalendar.css";

const HOUR_HEIGHT = 40; // px per hour

const palette: Record<RecordKind, string> = {
  Lead: "#2563eb",
  Event: "#16a34a",
  "Patient Checkin": "#ea580c",
};

type Positioned = {
  col: number;
  top: number;
  height: number;
  kind: "circle" | "pill";
  color: string;
  rec: AnyRecord;
  type: RecordKind;
};

interface Props {
  data: EmployeeData[];
  /** Start of the week (defaults to current week/Sunday) */
  weekStart?: Date;
}

const WeeklyCalendar: React.FC<Props> = ({ data, weekStart }) => {
  const base = weekStart
    ? normalizeWeekStart(weekStart)
    : normalizeWeekStart(new Date());
  const empCount = data.length;

  const items = useMemo<Positioned[]>(() => {
    const out: Positioned[] = [];

    data.forEach((emp, empIdx) => {
      emp.records.forEach((grp) => {
        grp.records.forEach((r) => {
          if (grp.type === "Event") {
            const ev = r as EventRecord;
            if (!inSameWeek(ev.start, base)) return;

            const st = toDate(ev.start);
            const en = toDate(ev.end);

            const day = dayIndexFromWeekStart(st, base);

            out.push({
              col: day * empCount + empIdx + 1,
              top: minutesFromDayStart(st) * (HOUR_HEIGHT / 60),
              height: Math.max(
                (en.getTime() - st.getTime()) / 60000 * (HOUR_HEIGHT / 60),
                HOUR_HEIGHT / 2
              ),
              kind: "pill",
              color: palette.Event,
              rec: r,
              type: "Event",
            });
          } else {
            const ts =
              grp.type === "Patient Checkin"
                ? (r as PatientCheckinRecord).checkin
                : (r as LeadRecord).create;

            if (!inSameWeek(ts, base)) return;

            const d = toDate(ts);
            const day = dayIndexFromWeekStart(d, base);

            out.push({
              col: day * empCount + empIdx + 1,
              top: minutesFromDayStart(d) * (HOUR_HEIGHT / 60) - 6,
              height: 12,
              kind: "circle",
              color: palette[grp.type],
              rec: r,
              type: grp.type,
            });
          }
        });
      });
    });

    return out;
  }, [data, base, empCount]);

  const weekHeight = 7 * 24 * HOUR_HEIGHT;
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const renderBox = (it: Positioned) => {
    switch (it.type) {
      case "Lead":
        return <LeadBox data={it.rec as LeadRecord} />;
      case "Event":
        return <EventBox data={it.rec as EventRecord} />;
      default:
        return <PatientCheckinBox data={it.rec as PatientCheckinRecord} />;
    }
  };

  return (
    <>
      <div className="calendar">
        <div
          className="calendar-grid"
          style={{
            gridTemplateColumns: `repeat(${data.length * 7}, 1fr)`,
            height: weekHeight,
          }}
        >
          {items.map((it, i) => (
            <div
              key={i}
              className={`item ${it.kind}`}
              style={{
                gridColumnStart: it.col,
                top: `${it.top}px`,
                height: it.kind === "circle" ? 12 : it.height,
                background: it.color,
              }}
            >
              <div className="hover">{renderBox(it)}</div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="day-labels"
        style={{ gridTemplateColumns: `repeat(${empCount * 7}, 1fr)` }}
      >
        {dayNames.map((d) => (
          <div key={d} className="label" style={{ gridColumn: `span ${empCount}` }}>
            {d}
          </div>
        ))}
      </div>

      <div
        className="employee-labels"
        style={{ gridTemplateColumns: `repeat(${empCount * 7}, 1fr)` }}
      >
        {Array.from({ length: 7 }).map((_, day) =>
          data.map((emp) => (
            <div key={`${day}-${emp.employee}`} className="label">
              {emp.employee}
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default WeeklyCalendar;
