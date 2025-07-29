import React, { useMemo, useState } from "react";
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
  minutesFromDayStart,
  dayIndexFromWeekStart,
} from "../utils/date";
import { format, addDays } from "date-fns";
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
  day: number;
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

  const items = useMemo<Positioned[]>(() => {
    const out: Positioned[] = [];

    data.forEach((emp, colIdx) => {
      emp.records.forEach((grp) => {
        grp.records.forEach((r) => {
          if (grp.type === "Event") {
            const ev = r as EventRecord;
            if (!inSameWeek(ev.start, base)) return;

            const st = toDate(ev.start);
            const en = toDate(ev.end);
            const day = dayIndexFromWeekStart(st, base);

            ev.employees.forEach((ename) => {
              const idx = data.findIndex((e) => e.employee === ename);
              if (idx === -1) return;
              out.push({
                day,
                col: idx + 1,
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
              day,
              col: colIdx + 1,
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
  }, [data, base]);

  const [expanded, setExpanded] = useState<number | null>(null);

  const dayHeight = 24 * HOUR_HEIGHT;
  const days = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(base, i)), [base]);
  const hours = useMemo(
    () =>
      Array.from({ length: 25 }, (_, i) =>
        format(new Date(2020, 0, 1, i), "haaa"),
      ),
    [],
  );

  const abbr = (name: string): string =>
    name
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .toUpperCase();

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

  return (
    <div className="calendar">
      <div className="time-col">
        {hours.map((h, i) => (
          <div key={i} className="time-label">
            {h}
          </div>
        ))}
      </div>
      {days.map((day, di) => (
        <div key={di} className="calendar-day">
          <div className="day-header">{format(day, "EEE MM/dd")}</div>
          <div className="employee-labels" style={{ gridTemplateColumns: `repeat(${data.length}, 1fr)` }}>
            {data.map((emp) => (
              <div key={emp.employee} className="label">
                {abbr(emp.employee)}
              </div>
            ))}
          </div>
          <div
            className="day-grid"
            style={{
              gridTemplateColumns: `repeat(${data.length}, 1fr)`,
              height: dayHeight,
            }}
          >
            {items.filter((it) => it.day === di).map((it, i) => {
              const isExp = expanded === i;
              return (
                <div
                  key={i}
                  className={`item ${it.kind}${isExp ? " expanded" : ""}`}
                  style={{
                    gridColumnStart: it.col,
                    top: `${it.top}px`,
                    height: isExp ? "auto" : it.kind === "circle" ? 12 : it.height,
                    background: isExp ? undefined : it.color,
                    width: isExp
                      ? 180
                      : it.kind === "circle"
                        ? 12
                        : "80%",
                    left: isExp ? 0 : it.kind === "circle" ? "50%" : "10%",
                  }}
                  onMouseEnter={() => setExpanded(i)}
                  onMouseLeave={() => setExpanded(null)}
                >
                  {isExp ? renderBox(it.rec, it.type) : null}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WeeklyCalendar;
