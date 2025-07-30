import React, { useState } from "react";
import { format } from "date-fns";
import type { LeadRecord } from "../types";
import Modal from "./Modal";

interface Props {
  open: boolean;
  employees: string[];
  onClose: () => void;
  onSave: (emp: string, rec: LeadRecord) => void;
}

const LeadModal: React.FC<Props> = ({ open, employees, onClose, onSave }) => {
  const [emp, setEmp] = useState(employees[0] ?? "");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(emp, {
      firstname,
      lastname,
      create: format(new Date(), "MM/dd/yyyy h:mma"),
    });
    onClose();
    setFirstname("");
    setLastname("");
  };

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={submit} className="form">
        <h3>New Lead</h3>
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
          First Name
          <input value={firstname} onChange={(e) => setFirstname(e.target.value)} />
        </label>
        <label>
          Last Name
          <input value={lastname} onChange={(e) => setLastname(e.target.value)} />
        </label>
        <button type="submit">Save</button>
      </form>
    </Modal>
  );
};

export default LeadModal;
