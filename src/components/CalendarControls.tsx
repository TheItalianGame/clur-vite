import React from "react";

interface Props {
  onPrev: () => void;
  onNext: () => void;
  records: string[];
  onAdd: (record: string) => void;
}

const CalendarControls: React.FC<Props> = ({ onPrev, onNext, records, onAdd }) => (
  <div className="calendar-controls">
    <button onClick={onPrev}>Prev Week</button>
    <button onClick={onNext}>Next Week</button>
    {records.map((r) => (
      <button key={r} onClick={() => onAdd(r)}>
        Add {r}
      </button>
    ))}
  </div>
);

export default CalendarControls;
