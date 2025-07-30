import React, { useEffect, useState } from 'react';
import Modal from './Modal';

interface FieldDef {
  id: number;
  name: string;
  label: string;
  type: string;
  foreign_table?: string;
  readonly: number;
}

interface Props {
  record: string;
  onSubmit: (values: Record<string, string>) => void;
  onClose: () => void;
}

const DynamicForm: React.FC<Props> = ({ record, onSubmit, onClose }) => {
  const [form, setForm] = useState<{ label: string; fields: FieldDef[] } | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [options, setOptions] = useState<Record<string, { id: number; name: string }[]>>({});

  useEffect(() => {
    fetch(`/api/forms/${encodeURIComponent(record)}/quickadd`)
      .then(r => r.json())
      .then(setForm)
      .catch(() => setForm(null));
  }, [record]);

  useEffect(() => {
    if (!form) return;
    form.fields.forEach(f => {
      if (f.foreign_table) {
        fetch(`/api/options/${f.foreign_table}`)
          .then(r => r.json())
          .then(d => setOptions(o => ({ ...o, [f.name]: d })))
          .catch(() => {});
      }
    });
  }, [form]);

  if (!form) return null;

  const change = (name: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setValues(v => ({ ...v, [name]: e.target.value }));

  const submit = () => {
    onSubmit(values);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h3>{form.label}</h3>
      {form.fields.map(f => {
        const val = values[f.name] || '';
        if (f.foreign_table && options[f.name]) {
          return (
            <select key={f.id} value={val} onChange={change(f.name)}>
              {options[f.name].map(o => (
                <option key={o.id} value={o.name}>{o.name}</option>
              ))}
            </select>
          );
        }
        return (
          <input
            key={f.id}
            placeholder={f.label}
            value={val}
            onChange={change(f.name)}
          />
        );
      })}
      <button onClick={submit}>Add</button>
    </Modal>
  );
};

export default DynamicForm;
