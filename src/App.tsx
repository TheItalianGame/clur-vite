import React, { useState } from "react";
import WeeklyCalendar from "./components/WeeklyCalendar";
import type {
  EmployeeData,
  AnyRecord,
  RecordKind,
  LeadRecord,
  EventRecord,
  PatientCheckinRecord,
} from "./types";
import { normalizeWeekStart } from "./utils/date";
import { format, addDays } from "date-fns";
import data from "./data/fake_data.json";
import "./components/WeeklyCalendar.css";
import "./components/RecordBox.css";

const initial = data as unknown as EmployeeData[];
const fmt = "MM/dd/yyyy h:mma";

const App: React.FC = () => {
  const [weekStart, setWeekStart] = useState(normalizeWeekStart(new Date()));
  const [employees, setEmployees] = useState<EmployeeData[]>(initial);

  const addRecord = (empName: string, type: RecordKind, rec: AnyRecord) => {
    setEmployees((prev) => {
      const out = prev.map((e) => ({
        ...e,
        records: e.records.map((g) => ({ ...g, records: [...g.records] })),
      }));
      let emp = out.find((e) => e.employee === empName);
      if (!emp) {
        emp = { employee: empName, records: [] };
        out.push(emp);
      }
      let grp = emp.records.find((g) => g.type === type);
      if (!grp) {
        grp = { type, records: [] };
        emp.records.push(grp);
      }
      grp.records.push(rec);
      return out;
    });
  };

  const handleAddEvent = () => {
    const title = window.prompt("Event title?") || "New Event";
    const start =
      window.prompt("Start (MM/DD/YYYY h:mma)", format(new Date(), fmt)) ||
      format(new Date(), fmt);
    const end =
      window.prompt("End (MM/DD/YYYY h:mma)", format(new Date(), fmt)) ||
      start;
    const emps =
      window.prompt(
        "Employees (comma separated)",
        employees.map((e) => e.employee).join(", ")
      ) || "";
    const rec: EventRecord = {
      title,
      start,
      end,
      employees: emps.split(/\s*,\s*/).filter(Boolean),
      create: format(new Date(), fmt),
    };
    rec.employees.forEach((emp) => addRecord(emp, "Event", rec));
  };

  const handleAddLead = () => {
    const employee =
      window.prompt("Employee", employees[0]?.employee || "") ||
      employees[0]?.employee ||
      "";
    const firstname = window.prompt("First name") || "First";
    const lastname = window.prompt("Last name") || "Last";
    const rec: LeadRecord = {
      firstname,
      lastname,
      create: format(new Date(), fmt),
    };
    addRecord(employee, "Lead", rec);
  };

  const handleAddCheckin = () => {
    const employee =
      window.prompt("Employee", employees[0]?.employee || "") ||
      employees[0]?.employee ||
      "";
    const patient = window.prompt("Patient name") || "Patient";
    const notes = window.prompt("Notes") || "";
    const rec: PatientCheckinRecord = {
      patient,
      notes,
      checkin: format(new Date(), fmt),
      create: format(new Date(), fmt),
    };
    addRecord(employee, "Patient Checkin", rec);
  };

  return (
    <div>
      <div className="toolbar">
        <button onClick={() => setWeekStart(addDays(weekStart, -7))}>Prev</button>
        <button onClick={() => setWeekStart(addDays(weekStart, 7))}>Next</button>
        <button onClick={handleAddEvent}>Add Event</button>
        <button onClick={handleAddLead}>Add Lead</button>
        <button onClick={handleAddCheckin}>Add Checkin</button>
      </div>
      <WeeklyCalendar data={employees} weekStart={weekStart} />
    </div>
  );
};

export default App;
