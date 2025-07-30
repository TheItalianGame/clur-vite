import React, { useState } from "react";
import type { EmployeeData, LeadRecord } from "../types";
import { format } from "date-fns";

interface Props {
  employees: EmployeeData[];
  onSubmit: (emp: string, rec: LeadRecord) => void;
  onCancel: () => void;
}

const LeadForm: React.FC<Props> = ({ employees, onSubmit, onCancel }) => {
  const [employee, setEmployee] = useState(employees[0]?.employee ?? "");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const record: LeadRecord = {
      firstname,
      lastname,
      create: format(new Date(), "MM/dd/yyyy h:mma"),
    };
    onSubmit(employee, record);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Lead</h3>
      <select value={employee} onChange={(e) => setEmployee(e.target.value)}>
        {employees.map((emp) => (
          <option key={emp.employee} value={emp.employee}>
            {emp.employee}
          </option>
        ))}
      </select>
      <input
        required
        placeholder="First Name"
        value={firstname}
        onChange={(e) => setFirstname(e.target.value)}
      />
      <input
        required
        placeholder="Last Name"
        value={lastname}
        onChange={(e) => setLastname(e.target.value)}
      />
      <div className="modal-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit">Add</button>
      </div>
    </form>
  );
};

export default LeadForm;
