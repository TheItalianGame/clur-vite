import React, { useState } from "react";
import WeeklyCalendar from "./components/WeeklyCalendar";
import CalendarControls from "./components/CalendarControls";
import LeadModal from "./components/LeadModal";
import EventModal from "./components/EventModal";
import CheckinModal from "./components/CheckinModal";
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
  const [leadOpen, setLeadOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [checkinOpen, setCheckinOpen] = useState(false);

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

  const saveLead = (emp: string, rec: LeadRecord) => {
    addRecord(emp, "Lead", rec);
  };

  const saveEvent = (rec: EventRecord) => {
    rec.employees.forEach((e) => addRecord(e, "Event", rec));
  };

  const saveCheckin = (emp: string, rec: PatientCheckinRecord) => {
    addRecord(emp, "Patient Checkin", rec);
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
      <LeadModal
        open={leadOpen}
        employees={employees.map((e) => e.employee)}
        onClose={() => setLeadOpen(false)}
        onSave={saveLead}
      />
      <EventModal
        open={eventOpen}
        employees={employees.map((e) => e.employee)}
        onClose={() => setEventOpen(false)}
        onSave={saveEvent}
      />
      <CheckinModal
        open={checkinOpen}
        employees={employees.map((e) => e.employee)}
        onClose={() => setCheckinOpen(false)}
        onSave={saveCheckin}
      />
    </div>
  );
};

export default App;
