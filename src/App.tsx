import React, { useState } from "react";
import WeeklyCalendar from "./components/WeeklyCalendar";
import CalendarControls from "./components/CalendarControls";
import type {
  EmployeeData,
  LeadRecord,
  EventRecord,
  PatientCheckinRecord,
} from "./types";
import { normalizeWeekStart } from "./utils/date";
import data from "./data/fake_data.json";
import { format, addDays } from "date-fns";
import "./components/WeeklyCalendar.css";
import "./components/RecordBox.css";

const initial = data as unknown as EmployeeData[];

const App: React.FC = () => {
  const [weekStart, setWeekStart] = useState(normalizeWeekStart(new Date()));
  const [employees, setEmployees] = useState<EmployeeData[]>(initial);

  const addRecord = (
    empName: string,
    type: "Lead" | "Event" | "Patient Checkin",
    rec: LeadRecord | EventRecord | PatientCheckinRecord,
  ) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.employee !== empName) return emp;
        const groups = [...emp.records];
        const idx = groups.findIndex((g) => g.type === type);
        if (idx >= 0) {
          groups[idx] = {
            ...groups[idx],
            records: [...groups[idx].records, rec],
          };
        } else {
          groups.push({ type, records: [rec] });
        }
        return { ...emp, records: groups };
      }),
    );
  };

  const addLead = () => {
    const emp = employees[0];
    const record: LeadRecord = {
      firstname: "New",
      lastname: "Lead",
      create: format(new Date(), "MM/dd/yyyy h:mma"),
    };
    addRecord(emp.employee, "Lead", record);
  };

  const addEvent = () => {
    const emp = employees[0];
    const st = addDays(weekStart, 1);
    st.setHours(9, 0, 0, 0);
    const en = addDays(weekStart, 1);
    en.setHours(10, 0, 0, 0);
    const record: EventRecord = {
      title: "New Event",
      create: format(new Date(), "MM/dd/yyyy h:mma"),
      start: format(st, "MM/dd/yyyy h:mma"),
      end: format(en, "MM/dd/yyyy h:mma"),
      employees: [emp.employee],
    };
    addRecord(emp.employee, "Event", record);
  };

  const addCheckin = () => {
    const emp = employees[0];
    const d = addDays(weekStart, 1);
    d.setHours(12, 0, 0, 0);
    const record: PatientCheckinRecord = {
      patient: "New Patient",
      notes: "Walk-in",
      checkin: format(d, "MM/dd/yyyy h:mma"),
      create: format(new Date(), "MM/dd/yyyy h:mma"),
    };
    addRecord(emp.employee, "Patient Checkin", record);
  };

  const nextWeek = () => setWeekStart((w) => addDays(w, 7));
  const prevWeek = () => setWeekStart((w) => addDays(w, -7));

  return (
    <div>
      <CalendarControls
        onPrev={prevWeek}
        onNext={nextWeek}
        onAddLead={addLead}
        onAddEvent={addEvent}
        onAddCheckin={addCheckin}
      />
      <WeeklyCalendar data={employees} weekStart={weekStart} />
    </div>
  );
};

export default App;
