import React, { useState } from "react";
import { format } from "date-fns";
import type { PatientCheckinRecord } from "../types";
import Modal from "./Modal";

interface Props {
  open: boolean;
  employees: string[];
  onClose: () => void;
  onSave: (emp: string, rec: PatientCheckinRecord) => void;
}

const CheckinModal: React.FC<Props> = ({ open, employees, onClose, onSave }) => {
  const [emp, setEmp] = useState(employees[0] ?? "");
  const [patient, setPatient] = useState("");
  const [notes, setNotes] = useState("");
  const [checkin, setCheckin] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkin) return;
    onSave(emp, {
      patient,
      notes,
      checkin: format(new Date(checkin), "MM/dd/yyyy h:mma"),
      create: format(new Date(), "MM/dd/yyyy h:mma"),
    });
    onClose();
    setPatient("");
    setNotes("");
    setCheckin("");
  };

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={submit} className="form">
        <h3>Patient Check-in</h3>
        <label>
          Employee
          <select value={emp} onChange={(e) => setEmp(e.target.value)}>
            {employees.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          Patient
          <input value={patient} onChange={(e) => setPatient(e.target.value)} />
        </label>
        <label>
          Notes
          <input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
        <label>
          Check-in
          <input
            type="datetime-local"
            value={checkin}
            onChange={(e) => setCheckin(e.target.value)}
          />
        </label>
        <button type="submit">Save</button>
      </form>
    </Modal>
  );
};

export default CheckinModal;
