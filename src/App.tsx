import React, { useState, useEffect } from "react";
import WeeklyCalendar from "./components/WeeklyCalendar";
import CalendarControls from "./components/CalendarControls";
import AddCheckinModal from "./components/AddCheckinModal";
import QuickAdd from "./components/QuickAdd";
import type {
  EmployeeData,
  LeadRecord,
  EventRecord,
  PatientCheckinRecord,
} from "./types";
import { normalizeWeekStart } from "./utils/date";
import data from "./data/fake_data.json";
import { addDays, format } from "date-fns";
import "./components/WeeklyCalendar.css";
import "./components/RecordBox.css";

const initial = data as unknown as EmployeeData[];

const App: React.FC = () => {
  const [weekStart, setWeekStart] = useState(normalizeWeekStart(new Date()));
  const [employees, setEmployees] = useState<EmployeeData[]>(initial);
  const [recordsList, setRecordsList] = useState<string[]>([]);
  const [quickAdd, setQuickAdd] = useState<string | null>(null);
  const [checkinOpen, setCheckinOpen] = useState(false);

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
      .then((d) => setRecordsList(d));
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
      const rec: LeadRecord = {
        firstname: data.firstname,
        lastname: data.lastname,
        create: format(new Date(), 'MM/dd/yyyy h:mma'),
      };
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee: data.employee, firstname: rec.firstname, lastname: rec.lastname }),
      });
      addRecord(data.employee, 'Lead', rec);
    } else if (record === 'Event') {
      const employees = (data.employees || '').split(',').map((s) => s.trim()).filter(Boolean);
      const rec: EventRecord = {
        title: data.title,
        start: data.start,
        end: data.end,
        create: format(new Date(), 'MM/dd/yyyy h:mma'),
        employees,
      };
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: rec.title, start: rec.start, end: rec.end, employees }),
      });
      employees.forEach((e) => addRecord(e, 'Event', rec));
    }
  };

  const submitCheckin = async (emp: string, rec: PatientCheckinRecord) => {
    await fetch('/api/checkins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employee: emp, patient: rec.patient, notes: rec.notes, checkin: rec.checkin }),
    });
    addRecord(emp, 'Patient Checkin', rec);
  };

  const nextWeek = () => setWeekStart((w) => addDays(w, 7));
  const prevWeek = () => setWeekStart((w) => addDays(w, -7));

  return (
    <div>
      <CalendarControls
        onPrev={prevWeek}
        onNext={nextWeek}
        records={recordsList.filter((r) => r !== 'Employee')}
        onAdd={(rec) => {
          if (rec === 'Patient Checkin') setCheckinOpen(true);
          else setQuickAdd(rec);
        }}
      />
      <WeeklyCalendar data={employees} weekStart={weekStart} />
      {quickAdd && (
        <QuickAdd
          record={quickAdd}
          onSubmit={(d) => submitRecord(quickAdd, d)}
          onClose={() => setQuickAdd(null)}
        />
      )}
      {checkinOpen && (
        <AddCheckinModal
          employees={employees.map((e) => e.employee)}
          onSubmit={submitCheckin}
          onClose={() => setCheckinOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
