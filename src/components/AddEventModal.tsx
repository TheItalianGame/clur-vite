import React, { useState } from 'react';
import Modal from './Modal';
import type { EventRecord } from '../types';
import { format } from 'date-fns';

interface Props {
  employees: string[];
  onSubmit: (emps: string[], rec: EventRecord) => void;
  onClose: () => void;
}

const AddEventModal: React.FC<Props> = ({ employees, onSubmit, onClose }) => {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const submit = () => {
    const record: EventRecord = {
      title,
      start: format(new Date(start), 'MM/dd/yyyy h:mma'),
      end: format(new Date(end), 'MM/dd/yyyy h:mma'),
      create: format(new Date(), 'MM/dd/yyyy h:mma'),
      employees: selected,
    };
    onSubmit(selected, record);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h3>Add Event</h3>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
      <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
      <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
      <select multiple value={selected} onChange={(e) => setSelected(Array.from(e.target.selectedOptions, o => o.value))}>
        {employees.map((e) => (
          <option key={e}>{e}</option>
        ))}
      </select>
      <button onClick={submit}>Add</button>
    </Modal>
  );
};

export default AddEventModal;
