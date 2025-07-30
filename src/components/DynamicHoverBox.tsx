import React, { useEffect, useState } from 'react';
import type { AnyRecord } from '../types';
import './RecordBox.css';

interface FieldDef {
  id: number;
  name: string;
  label: string;
}

interface Props {
  record: string;
  data: AnyRecord;
}

const DynamicHoverBox: React.FC<Props> = ({ record, data }) => {
  const [form, setForm] = useState<{ label: string; fields: FieldDef[] } | null>(null);

  useEffect(() => {
    fetch(`/api/forms/${encodeURIComponent(record)}/hover`)
      .then(r => r.json())
      .then(setForm)
      .catch(() => setForm(null));
  }, [record]);

  if (!form) return null;

  return (
    <div className="record-box">
      <strong>{record}</strong>
      {form.fields.map(f => (
        <div key={f.id}>{(data as unknown as Record<string, unknown>)[f.name] as string}</div>
      ))}
    </div>
  );
};

export default DynamicHoverBox;
