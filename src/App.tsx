import React, { useState } from "react";
import WeeklyCalendar from "./components/WeeklyCalendar";
import type {
  EmployeeData,
  LeadRecord,
  EventRecord,
  PatientCheckinRecord,
  RecordGroup,
} from "./types";
import { normalizeWeekStart } from "./utils/date";
import { addDays, format } from "date-fns";
import data from "./data/fake_data.json";
import "./components/WeeklyCalendar.css";
import "./components/RecordBox.css";

const initial = data as unknown as EmployeeData[];

const nowStamp = () => format(new Date(), "MM/dd/yyyy h:mma");

const ensureGroup = (emp: EmployeeData, type: RecordGroup["type"]): RecordGroup => {
  let g = emp.records.find((gr) => gr.type === type);
  if (!g) {
    g = { type, records: [] };
    emp.records.push(g);
  }
  return g;
};

const App: React.FC = () => {
  const [dataState, setDataState] = useState<EmployeeData[]>([...initial]);
  const [weekStart, setWeekStart] = useState(normalizeWeekStart(new Date()));

  const getEmployee = (name: string): EmployeeData | undefined =>
    dataState.find((e) => e.employee === name);

  const addLead = () => {
    const employee = prompt("Employee for lead?") || "";
    const emp = getEmployee(employee);
    if (!emp) return;
    const firstname = prompt("First name?") || "New";
    const lastname = prompt("Last name?") || "Lead";
    const rec: LeadRecord = { firstname, lastname, create: nowStamp() };
    const grp = ensureGroup(emp, "Lead");
    grp.records.push(rec);
    setDataState([...dataState]);
  };

  const addEvent = () => {
    const employee = prompt("Employee for event?") || "";
    const emp = getEmployee(employee);
    if (!emp) return;
    const title = prompt("Event title?") || "Untitled";
    const start = nowStamp();
    const end = nowStamp();
    const rec: EventRecord = {
      title,
      start,
      end,
      create: nowStamp(),
      employees: [employee],
    };
    const grp = ensureGroup(emp, "Event");
    grp.records.push(rec);
    setDataState([...dataState]);
  };

  const addCheckin = () => {
    const employee = prompt("Employee for checkin?") || "";
    const emp = getEmployee(employee);
    if (!emp) return;
    const patient = prompt("Patient name?") || "Anonymous";
    const notes = prompt("Notes?") || "";
    const rec: PatientCheckinRecord = {
      patient,
      notes,
      checkin: nowStamp(),
      create: nowStamp(),
    };
    const grp = ensureGroup(emp, "Patient Checkin");
    grp.records.push(rec);
    setDataState([...dataState]);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button onClick={() => setWeekStart(addDays(weekStart, -7))}>Prev Week</button>
        <button onClick={() => setWeekStart(addDays(weekStart, 7))}>Next Week</button>
        <button onClick={addEvent}>Add Event</button>
        <button onClick={addLead}>Add Lead</button>
        <button onClick={addCheckin}>Add Patient Checkin</button>
      </div>
      <WeeklyCalendar data={dataState} weekStart={weekStart} />
    </div>
  );
};

export default App;
