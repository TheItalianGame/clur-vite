import React, { useMemo } from "react";
import type {
  EmployeeData,
  EventRecord,
  PatientCheckinRecord,
  LeadRecord,
  RecordKind,
  AnyRecord,
} from "../types.ts";
import {
  toDate,
  minutesFromWeekStart,
  inSameWeek,
  normalizeWeekStart,
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

  const dayMinutes = 24 * 60;

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
            const totalMin = minutesFromWeekStart(st, base);
            const day = Math.floor(totalMin / dayMinutes);
            const offset = totalMin - day * dayMinutes;

            out.push({
              col: day * data.length + empIdx + 1,
              top: offset * (HOUR_HEIGHT / 60),
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
            const totalMin = minutesFromWeekStart(d, base);
            const day = Math.floor(totalMin / dayMinutes);
            const offset = totalMin - day * dayMinutes;

            out.push({
              col: day * data.length + empIdx + 1,
              top: offset * (HOUR_HEIGHT / 60) - 6,
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
  }, [data, base, dayMinutes]);

  const weekHeight = 24 * HOUR_HEIGHT;

  const renderBox = (it: Positioned) => {
    switch (it.type) {
      case "Lead":
        return <LeadBox data={it.rec as LeadRecord} />;
      case "Event":
        return <EventBox data={it.rec as EventRecord} />;
      default:
        return (
          <PatientCheckinBox data={it.rec as PatientCheckinRecord} />
        );
    }
  };

  return (
    <>
      <div
        className="day-labels"
        style={{ gridTemplateColumns: `repeat(${data.length * 7}, 1fr)` }}
      >
        {Array.from({ length: 7 }).map((_, dayIdx) => {
          const d = new Date(base);
          d.setDate(base.getDate() + dayIdx);
          const label = d.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          });
          return (
            <div
              key={dayIdx}
              className="day-label"
              style={{ gridColumn: `span ${data.length}` }}
            >
              {label}
            </div>
          );
        })}
      </div>
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
        className="employee-labels"
        style={{ gridTemplateColumns: `repeat(${data.length * 7}, 1fr)` }}
      >
        {Array.from({ length: 7 }).flatMap((_, dayIdx) =>
          data.map((emp) => (
            <div key={`${dayIdx}-${emp.employee}`} className="label">
              {emp.employee}
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default WeeklyCalendar;
