import React, { useEffect, useState } from "react";
import WeeklyCalendar from "./components/WeeklyCalendar";
import CalendarControls from "./components/CalendarControls";
import type { EmployeeData } from "./types";
import { normalizeWeekStart } from "./utils/date";
import { format, addDays } from "date-fns";
import AddLeadModal from "./components/AddLeadModal";
import AddEventModal from "./components/AddEventModal";
import AddCheckinModal from "./components/AddCheckinModal";
import "./components/WeeklyCalendar.css";
import "./components/RecordBox.css";

const App: React.FC = () => {
  const [weekStart, setWeekStart] = useState(normalizeWeekStart(new Date()));
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [showLead, setShowLead] = useState(false);
  const [showEvent, setShowEvent] = useState(false);
  const [showCheck, setShowCheck] = useState(false);

  const fetchData = async () => {
    const resp = await fetch('/api/data');
    const json = await resp.json();
    setEmployees(json);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addLead = async (emp: string, first: string, last: string) => {
    await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employee: emp,
        firstname: first,
        lastname: last,
        create: format(new Date(), 'MM/dd/yyyy h:mma'),
      }),
    });
    setShowLead(false);
    fetchData();
  };

  const addEvent = async (data: { title: string; start: string; end: string; employees: string[] }) => {
    await fetch('/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, create: format(new Date(), 'MM/dd/yyyy h:mma') }),
    });
    setShowEvent(false);
    fetchData();
  };

  const addCheckin = async (emp: string, patient: string, notes: string, checkin: string) => {
    await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employee: emp, patient, notes, checkin }),
    });
    setShowCheck(false);
    fetchData();
  };

  const nextWeek = () => setWeekStart((w) => addDays(w, 7));
  const prevWeek = () => setWeekStart((w) => addDays(w, -7));

  return (
    <div>
      <CalendarControls
        onPrev={prevWeek}
        onNext={nextWeek}
        onAddLead={() => setShowLead(true)}
        onAddEvent={() => setShowEvent(true)}
        onAddCheckin={() => setShowCheck(true)}
      />
      <WeeklyCalendar data={employees} weekStart={weekStart} />
      {showLead && (
        <AddLeadModal
          employees={employees.map(e => e.employee)}
          onSave={addLead}
          onClose={() => setShowLead(false)}
        />
      )}
      {showEvent && (
        <AddEventModal
          employees={employees.map(e => e.employee)}
          onSave={addEvent}
          onClose={() => setShowEvent(false)}
        />
      )}
      {showCheck && (
        <AddCheckinModal
          employees={employees.map(e => e.employee)}
          onSave={addCheckin}
          onClose={() => setShowCheck(false)}
        />
      )}
    </div>
  );
};

export default App;
