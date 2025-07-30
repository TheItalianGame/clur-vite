import React, { useState } from 'react';

interface Props {
  employees: string[];
  onSave: (emp: string, patient: string, notes: string, checkin: string) => void;
  onClose: () => void;
}

const AddCheckinModal: React.FC<Props> = ({ employees, onSave, onClose }) => {
  const [employee, setEmployee] = useState(employees[0] || '');
  const [patient, setPatient] = useState('');
  const [notes, setNotes] = useState('');
  const [checkin, setCheckin] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(employee, patient, notes, checkin);
  };

  return (
    <dialog open>
      <form onSubmit={submit}>
        <h3>Add Patient Checkin</h3>
        <label>
          Employee
          <select value={employee} onChange={e => setEmployee(e.target.value)}>
            {employees.map(emp => (
              <option key={emp} value={emp}>{emp}</option>
            ))}
          </select>
        </label>
        <label>
          Patient
          <input value={patient} onChange={e => setPatient(e.target.value)} required />
        </label>
        <label>
          Notes
          <input value={notes} onChange={e => setNotes(e.target.value)} />
        </label>
        <label>
          Checkin Time
          <input type="datetime-local" value={checkin} onChange={e => setCheckin(e.target.value)} required />
        </label>
        <div>
          <button type="submit">Add</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </dialog>
  );
};

export default AddCheckinModal;
