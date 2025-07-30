import React, { useState } from 'react';
import Modal from './Modal';
import type { LeadRecord } from '../types';
import { format } from 'date-fns';

interface Props {
  employees: string[];
  onSubmit: (emp: string, rec: LeadRecord) => void;
  onClose: () => void;
}

const AddLeadModal: React.FC<Props> = ({ employees, onSubmit, onClose }) => {
  const [employee, setEmployee] = useState(employees[0] || '');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');

  const submit = () => {
    const record: LeadRecord = {
      firstname,
      lastname,
      create: format(new Date(), 'MM/dd/yyyy h:mma'),
    };
    onSubmit(employee, record);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h3>Add Lead</h3>
      <select value={employee} onChange={(e) => setEmployee(e.target.value)}>
        {employees.map((e) => (
          <option key={e}>{e}</option>
        ))}
      </select>
      <input
        placeholder="First name"
        value={firstname}
        onChange={(e) => setFirstname(e.target.value)}
      />
      <input
        placeholder="Last name"
        value={lastname}
        onChange={(e) => setLastname(e.target.value)}
      />
      <button onClick={submit}>Add</button>
    </Modal>
  );
};

export default AddLeadModal;
