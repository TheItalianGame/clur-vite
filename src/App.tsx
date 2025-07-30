import React, { useState } from "react";
import WeeklyCalendar from "./components/WeeklyCalendar";
import type {
  EmployeeData,
  RecordGroup,
  EventRecord,
  LeadRecord,
  PatientCheckinRecord,
} from "./types";
import { normalizeWeekStart } from "./utils/date";
import data from "./data/fake_data.json";
import { format, addHours, addDays } from "date-fns";
import "./components/WeeklyCalendar.css";
import "./components/RecordBox.css";

const initialEmployees = data as unknown as EmployeeData[];

const App: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeData[]>([...initialEmployees]);
  const [weekStart, setWeekStart] = useState<Date>(normalizeWeekStart(new Date()));

  const randomEmp = () => employees[Math.floor(Math.random() * employees.length)];

  const ensureGroup = (emp: EmployeeData, type: RecordGroup["type"]): RecordGroup => {
    let g = emp.records.find((r) => r.type === type);
    if (!g) {
      g = { type, records: [] };
      emp.records.push(g);
    }
    return g;
  };

  const addEvent = () => {
    const emp = randomEmp();
    const now = new Date();
    const start = addHours(now, 1);
    const end = addHours(start, 1);
    const rec: EventRecord = {
      title: "New Event",
      create: format(now, "MM/dd/yyyy h:mma"),
      start: format(start, "MM/dd/yyyy h:mma"),
      end: format(end, "MM/dd/yyyy h:mma"),
      employees: [emp.employee],
    };
    ensureGroup(emp, "Event").records.push(rec);
    setEmployees([...employees]);
  };

  const addLead = () => {
    const emp = randomEmp();
    const now = new Date();
    const rec: LeadRecord = {
      firstname: "New",
      lastname: "Lead",
      create: format(now, "MM/dd/yyyy h:mma"),
    };
    ensureGroup(emp, "Lead").records.push(rec);
    setEmployees([...employees]);
  };

  const addCheckin = () => {
    const emp = randomEmp();
    const now = new Date();
    const rec: PatientCheckinRecord = {
      patient: "New Patient",
      checkin: format(now, "MM/dd/yyyy h:mma"),
      notes: "",
      create: format(now, "MM/dd/yyyy h:mma"),
    };
    ensureGroup(emp, "Patient Checkin").records.push(rec);
    setEmployees([...employees]);
  };

  return (
    <div className="app">
      <div className="toolbar">
        <button onClick={() => setWeekStart(addDays(weekStart, -7))}>Prev Week</button>
        <button onClick={() => setWeekStart(addDays(weekStart, 7))}>Next Week</button>
        <button onClick={addLead}>Add Lead</button>
        <button onClick={addEvent}>Add Event</button>
        <button onClick={addCheckin}>Add Checkin</button>
      </div>
      <WeeklyCalendar data={employees} weekStart={weekStart} />
    </div>
  );
};

export default App;
