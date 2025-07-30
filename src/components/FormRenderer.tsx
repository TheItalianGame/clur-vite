import React, { useEffect, useState } from 'react';

export interface FormField {
  id: number;
  name: string;
  type: string;
  label: string;
  readonly: number;
  subtab_id?: number;
}

export interface FormMeta {
  id: number;
  label: string;
  form_type: string;
  fields: FormField[];
  subtabs: { id: number; label: string; ord: number }[];
}

interface Props {
  record: string;
  type: string;
  mode: 'display' | 'edit';
  initial?: Record<string, string>;
  onSubmit?: (values: Record<string, string>) => void;
}

const FormRenderer: React.FC<Props> = ({ record, type, mode, initial = {}, onSubmit }) => {
  const [meta, setMeta] = useState<FormMeta | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`/api/forms/${record}/${type}`)
      .then(r => r.json())
      .then(m => {
        setMeta(m);
        const v: Record<string, string> = {};
        m.fields.forEach((f: FormField) => {
          v[f.name] = initial[f.name] ?? '';
        });
        setValues(v);
      });
  }, [record, type, initial]);

  if (!meta) return null;

  const change = (name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const submit = () => {
    onSubmit?.(values);
  };

  return (
    <div className={`form-renderer ${type}`}>
      {meta.fields.map(f => (
        <div key={f.id} className="form-field">
          {mode === 'edit' && !f.readonly ? (
            <input
              value={values[f.name]}
              onChange={e => change(f.name, e.target.value)}
              placeholder={f.label}
            />
          ) : (
            <div>
              <strong>{f.label}</strong>: {values[f.name]}
            </div>
          )}
        </div>
      ))}
      {mode === 'edit' && onSubmit && (
        <button onClick={submit}>Submit</button>
      )}
    </div>
  );
};

export default FormRenderer;
