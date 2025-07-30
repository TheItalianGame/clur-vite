import React, { useEffect, useState } from 'react';

interface Field {
  id: number;
  name: string;
  label: string;
}

interface Props {
  record: string;
  data: Record<string, unknown>;
}

const HoverCard: React.FC<Props> = ({ record, data }) => {
  const [fields, setFields] = useState<Field[]>([]);
  useEffect(() => {
    fetch(`/api/forms/${record}/hover`)
      .then((r) => r.json())
      .then((d) => setFields(d.fields));
  }, [record]);

  return (
    <div className="record-box">
      <strong>{record}</strong>
      {fields.map((f) => (
        <div key={f.id}>{String(data[f.name] ?? '')}</div>
      ))}
    </div>
  );
};

export default HoverCard;
