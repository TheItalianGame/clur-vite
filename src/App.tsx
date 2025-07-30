import React, { useState, useEffect } from "react";
import WeeklyCalendar from "./components/WeeklyCalendar";
import CalendarControls from "./components/CalendarControls";
import type {
  EmployeeData,
  LeadRecord,
  EventRecord,
  PatientCheckinRecord,
} from "./types";
import { normalizeWeekStart } from "./utils/date";
import { format, addDays } from "date-fns";
import "./components/WeeklyCalendar.css";
import "./components/RecordBox.css";

const App: React.FC = () => {
  const [weekStart, setWeekStart] = useState(normalizeWeekStart(new Date()));
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [showLead, setShowLead] = useState(false);
  const [showEvent, setShowEvent] = useState(false);
  const [showCheckin, setShowCheckin] = useState(false);

  useEffect(() => {
    fetch('/data')
      .then(r => r.json())
      .then(setEmployees);
  }, []);

  const addRecord = (
    empName: string,
    type: "Lead" | "Event" | "Patient Checkin",
    rec: LeadRecord | EventRecord | PatientCheckinRecord,
  ) => {
    let url = "";
    let body: Record<string, unknown> = {};
    switch (type) {
      case "Lead":
        url = "/lead";
        body = { employee: empName, lead: rec };
        break;
      case "Event":
        url = "/event";
        body = { event: rec };
        break;
      default:
        url = "/checkin";
        body = { employee: empName, checkin: rec };
    }
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(() => {
      fetch('/data').then(r => r.json()).then(setEmployees);
    });
  };

  const addLead = () => {
    setShowLead(true);
  };

  const addEvent = () => {
    setShowEvent(true);
  };

  const addCheckin = () => {
    setShowCheckin(true);
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

        {showLead && (
          <dialog open>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const data = new FormData(form);
              const rec: LeadRecord = {
                firstname: String(data.get('firstname')),
                lastname: String(data.get('lastname')),
                create: format(new Date(), 'MM/dd/yyyy h:mma'),
              };
              addRecord(String(data.get('employee')), 'Lead', rec);
              setShowLead(false);
              form.reset();
            }}>
              <label>
                Employee
                <select name="employee">
                  {employees.map(e => <option key={e.employee}>{e.employee}</option>)}
                </select>
              </label>
              <label>
                First Name
                <input name="firstname" required />
              </label>
              <label>
                Last Name
                <input name="lastname" required />
              </label>
              <button type="submit">Save</button>
              <button type="button" onClick={() => setShowLead(false)}>Cancel</button>
            </form>
          </dialog>
        )}

        {showEvent && (
          <dialog open>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const data = new FormData(form);
              const rec: EventRecord = {
                title: String(data.get('title')),
                start: String(data.get('start')),
                end: String(data.get('end')),
                create: format(new Date(), 'MM/dd/yyyy h:mma'),
                employees: String(data.get('employees')).split(',').map(s => s.trim()),
              };
              addRecord('', 'Event', rec);
              setShowEvent(false);
              form.reset();
            }}>
              <label>
                Title
                <input name="title" required />
              </label>
              <label>
                Start
                <input name="start" placeholder="MM/DD/YYYY h:mmA" required />
              </label>
              <label>
                End
                <input name="end" placeholder="MM/DD/YYYY h:mmA" required />
              </label>
              <label>
                Employees (comma separated)
                <input name="employees" required />
              </label>
              <button type="submit">Save</button>
              <button type="button" onClick={() => setShowEvent(false)}>Cancel</button>
            </form>
          </dialog>
        )}

        {showCheckin && (
          <dialog open>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const data = new FormData(form);
              const rec: PatientCheckinRecord = {
                patient: String(data.get('patient')),
                notes: String(data.get('notes')),
                checkin: String(data.get('checkin')),
                create: format(new Date(), 'MM/dd/yyyy h:mma'),
              };
              addRecord(String(data.get('employee')), 'Patient Checkin', rec);
              setShowCheckin(false);
              form.reset();
            }}>
              <label>
                Employee
                <select name="employee">
                  {employees.map(e => <option key={e.employee}>{e.employee}</option>)}
                </select>
              </label>
              <label>
                Patient
                <input name="patient" required />
              </label>
              <label>
                Notes
                <input name="notes" required />
              </label>
              <label>
                Checkin Time
                <input name="checkin" placeholder="MM/DD/YYYY h:mmA" required />
              </label>
              <button type="submit">Save</button>
              <button type="button" onClick={() => setShowCheckin(false)}>Cancel</button>
            </form>
          </dialog>
        )}
      </div>
    );
};

export default App;
