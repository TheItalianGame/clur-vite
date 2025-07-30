import React, { useState } from 'react';
import Modal from './Modal';
import type { PatientCheckinRecord } from '../types';
import { format } from 'date-fns';
import DynamicForm from './DynamicForm';

interface Props {
  employees: string[];
  onSubmit: (emp: string, rec: PatientCheckinRecord) => void;
  onClose: () => void;
}

const AddCheckinModal: React.FC<Props> = ({ employees, onSubmit, onClose }) => {
  const [employee, setEmployee] = useState(employees[0] || '');
  const [values, setValues] = useState<Record<string, string>>({});

  const submit = () => {
    const record: PatientCheckinRecord = {
      patient: values.patient || '',
      notes: values.notes || '',
      checkin: format(new Date(values.checkin), 'MM/dd/yyyy h:mma'),
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
      <DynamicForm record="Patient Checkin" formType="quickadd" onChange={setValues} />
      <button onClick={submit}>Add</button>
    </Modal>
  );
};

export default AddCheckinModal;
