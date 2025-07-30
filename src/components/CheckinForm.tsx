import React, { useState } from "react";
import type { EmployeeData, PatientCheckinRecord } from "../types";
import { format, parseISO } from "date-fns";

interface Props {
  employees: EmployeeData[];
  onSubmit: (emp: string, rec: PatientCheckinRecord) => void;
  onCancel: () => void;
}

const CheckinForm: React.FC<Props> = ({ employees, onSubmit, onCancel }) => {
  const [employee, setEmployee] = useState(employees[0]?.employee ?? "");
  const [patient, setPatient] = useState("");
  const [notes, setNotes] = useState("");
  const [checkin, setCheckin] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const record: PatientCheckinRecord = {
      patient,
      notes,
      checkin: format(parseISO(checkin), "MM/dd/yyyy h:mma"),
      create: format(new Date(), "MM/dd/yyyy h:mma"),
    };
    onSubmit(employee, record);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Check-in</h3>
      <select value={employee} onChange={(e) => setEmployee(e.target.value)}>
        {employees.map((emp) => (
          <option key={emp.employee} value={emp.employee}>
            {emp.employee}
          </option>
        ))}
      </select>
      <input
        required
        placeholder="Patient"
        value={patient}
        onChange={(e) => setPatient(e.target.value)}
      />
      <input
        required
        type="datetime-local"
        value={checkin}
        onChange={(e) => setCheckin(e.target.value)}
      />
      <textarea
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="modal-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit">Add</button>
      </div>
    </form>
  );
};

export default CheckinForm;
