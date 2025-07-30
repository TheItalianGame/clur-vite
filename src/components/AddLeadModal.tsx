import React, { useState } from 'react';

interface Props {
  employees: string[];
  onSave: (emp: string, first: string, last: string) => void;
  onClose: () => void;
}

const AddLeadModal: React.FC<Props> = ({ employees, onSave, onClose }) => {
  const [employee, setEmployee] = useState(employees[0] || '');
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(employee, first, last);
  };

  return (
    <dialog open>
      <form onSubmit={submit}>
        <h3>Add Lead</h3>
        <label>
          Employee
          <select value={employee} onChange={e => setEmployee(e.target.value)}>
            {employees.map(emp => (
              <option key={emp} value={emp}>{emp}</option>
            ))}
          </select>
        </label>
        <label>
          First Name
          <input value={first} onChange={e => setFirst(e.target.value)} required />
        </label>
        <label>
          Last Name
          <input value={last} onChange={e => setLast(e.target.value)} required />
        </label>
        <div>
          <button type="submit">Add</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </dialog>
  );
};

export default AddLeadModal;
