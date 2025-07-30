import React, { useState } from 'react';

interface Props {
  employees: string[];
  onSave: (data: { title: string; start: string; end: string; employees: string[] }) => void;
  onClose: () => void;
}

const AddEventModal: React.FC<Props> = ({ employees, onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (name: string) => {
    setSelected((prev) => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, start, end, employees: selected.length ? selected : [employees[0]] });
  };

  return (
    <dialog open>
      <form onSubmit={submit}>
        <h3>Add Event</h3>
        <label>
          Title
          <input value={title} onChange={e => setTitle(e.target.value)} required />
        </label>
        <label>
          Start
          <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} required />
        </label>
        <label>
          End
          <input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} required />
        </label>
        <div>
          {employees.map(emp => (
            <label key={emp} style={{ display: 'block' }}>
              <input type="checkbox" checked={selected.includes(emp)} onChange={() => toggle(emp)} /> {emp}
            </label>
          ))}
        </div>
        <div>
          <button type="submit">Add</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </dialog>
  );
};

export default AddEventModal;
