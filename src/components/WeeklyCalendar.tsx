import React, { useMemo } from "react";
import type {
  EmployeeData,
  EventRecord,
  LeadRecord,
  PatientCheckinRecord,
  RecordKind,
  AnyRecord,
} from "../types.ts";
import {
  toDate,
  inSameWeek,
  normalizeWeekStart,
  minutesFromDayStart,
  dayIndexFromWeekStart,
} from "../utils/date";
import { format, addDays } from "date-fns";
import EmployeeColumn, { ColumnItem } from "./EmployeeColumn";
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
          <div
            className="day-grid"
            style={{ gridTemplateColumns: `repeat(${data.length}, 1fr)`, height: dayHeight }}
          >
            {data.map((emp, ei) => (
              <EmployeeColumn
                key={emp.employee}
                label={abbr(emp.employee)}
                dayHeight={dayHeight}
                items={items
                  .filter((it) => it.day === di && it.col === ei + 1)
                  .map(({ top, height, kind, color, rec, type }) => ({
                    top,
                    height,
                    kind,
                    color,
                    rec,
                    type,
                  })) as ColumnItem[]}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WeeklyCalendar;
