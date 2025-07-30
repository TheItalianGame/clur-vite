import React, { useState } from 'react';
import Modal from './Modal';
import type { PatientCheckinRecord } from '../types';
import { format } from 'date-fns';

interface Props {
  employees: string[];
  onSubmit: (emp: string, rec: PatientCheckinRecord) => void;
  onClose: () => void;
}

const AddCheckinModal: React.FC<Props> = ({ employees, onSubmit, onClose }) => {
  const [employee, setEmployee] = useState(employees[0] || '');
  const [patient, setPatient] = useState('');
  const [notes, setNotes] = useState('');
  const [checkin, setCheckin] = useState('');

  const submit = () => {
    const record: PatientCheckinRecord = {
      patient,
      notes,
      checkin: format(new Date(checkin), 'MM/dd/yyyy h:mma'),
      create: format(new Date(), 'MM/dd/yyyy h:mma'),
    };
    onSubmit(employee, record);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h3>Add Checkin</h3>
      <select value={employee} onChange={(e) => setEmployee(e.target.value)}>
        {employees.map((e) => (
          <option key={e}>{e}</option>
        ))}
      </select>
      <input placeholder="Patient" value={patient} onChange={(e) => setPatient(e.target.value)} />
      <input placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <input type="datetime-local" value={checkin} onChange={(e) => setCheckin(e.target.value)} />
      <button onClick={submit}>Add</button>
    </Modal>
  );
};

export default AddCheckinModal;
