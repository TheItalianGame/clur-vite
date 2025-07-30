import React, { useEffect, useState } from 'react';

interface Field {
  id: number;
  name: string;
  type: string;
  label: string;
  read_only: number;
}

interface Props {
  record: string;
  formType: 'quickadd' | 'main';
  onSubmit?: (values: Record<string, string>) => void;
  onChange?: (values: Record<string, string>) => void;
}

const DynamicForm: React.FC<Props> = ({ record, formType, onSubmit, onChange }) => {
  const [fields, setFields] = useState<Field[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`/api/forms/${record}/${formType}`)
      .then((r) => r.json())
      .then((d) => {
        setFields(d.fields);
        const init: Record<string, string> = {};
        d.fields.forEach((f: Field) => {
          init[f.name] = '';
        });
        setValues(init);
      });
  }, [record, formType]);

  const update = (name: string, val: string) => {
    setValues((v) => {
      const out = { ...v, [name]: val };
      onChange?.(out);
      return out;
    });
  };

  const submit = () => {
    onSubmit?.(values);
  };

  return (
    <div>
      {fields.map((f) => (
        <div key={f.id}>
          <label>{f.label}</label>
          <input
            value={values[f.name] || ''}
            onChange={(e) => update(f.name, e.target.value)}
            disabled={!!f.read_only}
          />
        </div>
      ))}
      {onSubmit && <button onClick={submit}>Submit</button>}
    </div>
  );
};

export default DynamicForm;
