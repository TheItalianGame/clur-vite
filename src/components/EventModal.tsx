import React, { useState } from "react";
import { format } from "date-fns";
import type { EventRecord } from "../types";
import Modal from "./Modal";

interface Props {
  open: boolean;
  employees: string[];
  onClose: () => void;
  onSave: (rec: EventRecord) => void;
}

const EventModal: React.FC<Props> = ({ open, employees, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [assigned, setAssigned] = useState<string[]>([]);

  const toggle = (name: string) => {
    setAssigned((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!start || !end || assigned.length === 0) return;
    onSave({
      title,
      start: format(new Date(start), "MM/dd/yyyy h:mma"),
      end: format(new Date(end), "MM/dd/yyyy h:mma"),
      create: format(new Date(), "MM/dd/yyyy h:mma"),
      employees: assigned,
    });
    onClose();
    setTitle("");
    setStart("");
    setEnd("");
    setAssigned([]);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={submit} className="form">
        <h3>New Event</h3>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label>
          Start
          <input
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </label>
        <label>
          End
          <input
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </label>
        <fieldset>
          <legend>Employees</legend>
          {employees.map((name) => (
            <label key={name} style={{ display: "block" }}>
              <input
                type="checkbox"
                checked={assigned.includes(name)}
                onChange={() => toggle(name)}
              />
              {name}
            </label>
          ))}
        </fieldset>
        <button type="submit">Save</button>
      </form>
    </Modal>
  );
};

export default EventModal;
