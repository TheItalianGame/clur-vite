import React, { useEffect, useState } from 'react';

interface Field {
  id: number;
  name: string;
  type: string;
  ord: number;
  readonly: number;
  subtab?: string;
}

interface Props {
  record: string;
  formType: 'quickadd' | 'hover' | 'main';
  data?: Record<string, unknown>;
  onSubmit?: (values: Record<string, string>) => void;
}

const DynamicForm: React.FC<Props> = ({ record, formType, data, onSubmit }) => {
  const [fields, setFields] = useState<Field[]>([]);
  const [values, setValues] = useState<Record<string, string>>(data ? (data as Record<string, string>) : {});

  useEffect(() => {
    fetch(`/api/form/${record}/${formType}`)
      .then((r) => r.json())
      .then((d) => {
        setFields(d.fields);
        if (data) setValues(data as Record<string, string>);
      });
  }, [record, formType, data]);

  const handleChange = (name: string, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
  };

  const submit = () => {
    if (onSubmit) onSubmit(values);
  };

  if (!fields.length) return null;

  return (
    <div>
      {fields.map((f) => (
        <div key={f.id} style={{ marginBottom: '4px' }}>
          {onSubmit ? (
            <input
              placeholder={f.name}
              value={values[f.name] || ''}
              onChange={(e) => handleChange(f.name, e.target.value)}
            />
          ) : (
            <span>{values[f.name]}</span>
          )}
        </div>
      ))}
      {onSubmit && <button onClick={submit}>Submit</button>}
    </div>
  );
};

export default DynamicForm;
