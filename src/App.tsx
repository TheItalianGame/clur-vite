import React, { useState } from "react";
import WeeklyCalendar from "./components/WeeklyCalendar";
import CalendarControls from "./components/CalendarControls";
import Modal from "./components/Modal";
import LeadForm from "./components/LeadForm";
import EventForm from "./components/EventForm";
import CheckinForm from "./components/CheckinForm";
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
  const [modal, setModal] = useState<"lead" | "event" | "checkin" | null>(null);

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

  const addLead = () => setModal("lead");

  const addEvent = () => setModal("event");

  const addCheckin = () => setModal("checkin");

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
      <Modal open={modal === "lead"} onClose={() => setModal(null)}>
        <LeadForm
          employees={employees}
          onCancel={() => setModal(null)}
          onSubmit={(emp, rec) => {
            addRecord(emp, "Lead", rec);
            setModal(null);
          }}
        />
      </Modal>
      <Modal open={modal === "event"} onClose={() => setModal(null)}>
        <EventForm
          employees={employees}
          onCancel={() => setModal(null)}
          onSubmit={(emps, rec) => {
            emps.forEach((e) => addRecord(e, "Event", rec));
            setModal(null);
          }}
        />
      </Modal>
      <Modal open={modal === "checkin"} onClose={() => setModal(null)}>
        <CheckinForm
          employees={employees}
          onCancel={() => setModal(null)}
          onSubmit={(emp, rec) => {
            addRecord(emp, "Patient Checkin", rec);
            setModal(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default App;
