import React, { useState } from "react";
import type { EmployeeData, EventRecord } from "../types";
import { format, parseISO } from "date-fns";

interface Props {
  employees: EmployeeData[];
  onSubmit: (emp: string[], rec: EventRecord) => void;
  onCancel: () => void;
}

const EventForm: React.FC<Props> = ({ employees, onSubmit, onCancel }) => {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const toggleEmployee = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const record: EventRecord = {
      title,
      start: format(parseISO(start), "MM/dd/yyyy h:mma"),
      end: format(parseISO(end), "MM/dd/yyyy h:mma"),
      create: format(new Date(), "MM/dd/yyyy h:mma"),
      employees: selected,
    };
    onSubmit(selected, record);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Event</h3>
      <input
        required
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <label>
        Start
        <input
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          required
        />
      </label>
      <label>
        End
        <input
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          required
        />
      </label>
      <div>
        Employees
        {employees.map((emp) => (
          <label key={emp.employee} style={{ display: "block" }}>
            <input
              type="checkbox"
              checked={selected.includes(emp.employee)}
              onChange={() => toggleEmployee(emp.employee)}
            />
            {emp.employee}
          </label>
        ))}
      </div>
      <div className="modal-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit">Add</button>
      </div>
    </form>
  );
};

export default EventForm;
