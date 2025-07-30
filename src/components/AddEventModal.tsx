import React, { useState } from 'react';
import Modal from './Modal';
import type { EventRecord } from '../types';
import { format } from 'date-fns';
import DynamicForm from './DynamicForm';

interface Props {
  employees: string[];
  onSubmit: (emps: string[], rec: EventRecord) => void;
  onClose: () => void;
}

const AddEventModal: React.FC<Props> = ({ employees, onSubmit, onClose }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});

  const submit = () => {
    const record: EventRecord = {
      title: values.title || '',
      start: format(new Date(values.start), 'MM/dd/yyyy h:mma'),
      end: format(new Date(values.end), 'MM/dd/yyyy h:mma'),
      create: format(new Date(), 'MM/dd/yyyy h:mma'),
      employees: selected,
    };
    onSubmit(selected, record);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h3>Add Event</h3>
      <DynamicForm record="Event" formType="quickadd" onChange={setValues} />
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
