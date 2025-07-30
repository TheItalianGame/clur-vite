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
import { addDays, format } from "date-fns";
import "./components/WeeklyCalendar.css";
import "./components/RecordBox.css";

const initial = data as unknown as EmployeeData[];

const App: React.FC = () => {
  const [weekStart, setWeekStart] = useState(normalizeWeekStart(new Date()));
  const [employees, setEmployees] = useState<EmployeeData[]>(initial);
  const [recordsList, setRecordsList] = useState<string[]>([]);
  const [activeForm, setActiveForm] = useState<string | null>(null);

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
      .then((d) => setRecordsList(d))
      .catch(() => setRecordsList([]));
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
    switch (record) {
      case 'Lead': {
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
        break;
      }
      case 'Event': {
        const rec: EventRecord = {
          title: data.title,
          start: format(new Date(data.start), 'MM/dd/yyyy h:mma'),
          end: format(new Date(data.end), 'MM/dd/yyyy h:mma'),
          create: format(new Date(), 'MM/dd/yyyy h:mma'),
          employees: data.employees ? data.employees.split(',').map((s) => s.trim()) : [],
        };
        await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: rec.title, start: rec.start, end: rec.end, employees: rec.employees }),
        });
        rec.employees.forEach((e) => addRecord(e, 'Event', rec));
        break;
      }
      case 'Patient Checkin': {
        const rec: PatientCheckinRecord = {
          patient: data.patient,
          notes: data.notes,
          checkin: format(new Date(data.checkin), 'MM/dd/yyyy h:mma'),
          create: format(new Date(), 'MM/dd/yyyy h:mma'),
        };
        await fetch('/api/checkins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employee: data.employee, patient: rec.patient, notes: rec.notes, checkin: rec.checkin }),
        });
        addRecord(data.employee, 'Patient Checkin', rec);
        break;
      }
      default:
        break;
    }
    setActiveForm(null);
  };

  const nextWeek = () => setWeekStart((w) => addDays(w, 7));
  const prevWeek = () => setWeekStart((w) => addDays(w, -7));

  return (
    <div>
      <CalendarControls
        onPrev={prevWeek}
        onNext={nextWeek}
        records={recordsList}
        onAdd={(r) => setActiveForm(r)}
      />
      <WeeklyCalendar data={employees} weekStart={weekStart} />
      {activeForm && (
        <QuickAdd
          record={activeForm}
          onSubmit={(d) => submitRecord(activeForm, d)}
          onClose={() => setActiveForm(null)}
        />
      )}
    </div>
  );
};

export default App;
