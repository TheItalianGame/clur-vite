import React, { useState, useEffect } from "react";
import WeeklyCalendar from "./components/WeeklyCalendar";
import CalendarControls from "./components/CalendarControls";
import DynamicForm from "./components/DynamicForm";
import AddEventModal from "./components/AddEventModal";
import AddCheckinModal from "./components/AddCheckinModal";
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
  const [leadOpen, setLeadOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [checkinOpen, setCheckinOpen] = useState(false);

  useEffect(() => {
    fetch('/api/employees')
      .then((r) => r.json())
      .then((d) => setEmployees(d))
      .catch(() => {
        // fall back to bundled data
        setEmployees(initial);
      });
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

  const submitLead = async (emp: string, rec: LeadRecord) => {
    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employee: emp, firstname: rec.firstname, lastname: rec.lastname }),
    });
    addRecord(emp, 'Lead', rec);
  };

  const submitEvent = async (emps: string[], rec: EventRecord) => {
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: rec.title, start: rec.start, end: rec.end, employees: emps }),
    });
    emps.forEach((e) => addRecord(e, 'Event', rec));
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
        onAddLead={() => setLeadOpen(true)}
        onAddEvent={() => setEventOpen(true)}
        onAddCheckin={() => setCheckinOpen(true)}
      />
      <WeeklyCalendar data={employees} weekStart={weekStart} />
      {leadOpen && (
        <DynamicForm
          record="Lead"
          onSubmit={(vals) =>
            submitLead(vals.employee, {
              firstname: vals.firstname,
              lastname: vals.lastname,
              create: format(new Date(), 'MM/dd/yyyy h:mma'),
            })
          }
          onClose={() => setLeadOpen(false)}
        />
      )}
      {eventOpen && (
        <AddEventModal
          employees={employees.map((e) => e.employee)}
          onSubmit={submitEvent}
          onClose={() => setEventOpen(false)}
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
