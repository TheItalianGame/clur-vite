import React, { useState, useEffect } from "react";
import WeeklyCalendar from "./components/WeeklyCalendar";
import CalendarControls from "./components/CalendarControls";
import QuickAdd from "./components/QuickAdd";
import type {
  EmployeeData,
  LeadRecord,
  EventRecord,
  PatientCheckinRecord,
} from "./types";
import { normalizeWeekStart } from "./utils/date";
import data from "./data/fake_data.json";
import { addDays } from "date-fns";
import "./components/WeeklyCalendar.css";
import "./components/RecordBox.css";

const initial = data as unknown as EmployeeData[];

const App: React.FC = () => {
  const [weekStart, setWeekStart] = useState(normalizeWeekStart(new Date()));
  const [employees, setEmployees] = useState<EmployeeData[]>(initial);
  const [records, setRecords] = useState<string[]>([]);
  const [activeRecord, setActiveRecord] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/employees')
      .then((r) => r.json())
      .then((d) => setEmployees(d))
      .catch(() => {
        // fall back to bundled data
        setEmployees(initial);
      });
    fetch('/api/records')
      .then((r) => r.json())
      .then((d) => setRecords(d));
  }, []);

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

  const submitRecord = async (record: string, data: Record<string, string>) => {
    if (record === 'Lead') {
      const rec: LeadRecord = { firstname: data.firstname, lastname: data.lastname, create: data.create || '' };
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee: data.employee, firstname: rec.firstname, lastname: rec.lastname }),
      });
      addRecord(data.employee, 'Lead', rec);
    } else if (record === 'Event') {
      const employeesList = data.employees ? data.employees.split(',').map((s) => s.trim()) : [];
      const rec: EventRecord = { title: data.title, start: data.start, end: data.end, create: data.create || '', employees: employeesList };
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: rec.title, start: rec.start, end: rec.end, employees: employeesList }),
      });
      employeesList.forEach((e) => addRecord(e, 'Event', rec));
    } else if (record === 'Patient Checkin') {
      const rec: PatientCheckinRecord = { patient: data.patient, notes: data.notes, checkin: data.checkin, create: data.create || '' };
      await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee: data.employee, patient: rec.patient, notes: rec.notes, checkin: rec.checkin }),
      });
      addRecord(data.employee, 'Patient Checkin', rec);
    }
  };

  const nextWeek = () => setWeekStart((w) => addDays(w, 7));
  const prevWeek = () => setWeekStart((w) => addDays(w, -7));

  return (
    <div>
      <CalendarControls
        onPrev={prevWeek}
        onNext={nextWeek}
        records={records}
        onAdd={(r) => setActiveRecord(r)}
      />
      <WeeklyCalendar data={employees} weekStart={weekStart} />
      {activeRecord && (
        <QuickAdd
          record={activeRecord}
          onSubmit={(d) => {
            submitRecord(activeRecord, d);
            setActiveRecord(null);
          }}
          onClose={() => setActiveRecord(null)}
        />
      )}
    </div>
  );
};

export default App;
