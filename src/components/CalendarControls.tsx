import React from "react";

interface Props {
  onPrev: () => void;
  onNext: () => void;
  onAddLead: () => void;
  onAddEvent: () => void;
  onAddCheckin: () => void;
}

const CalendarControls: React.FC<Props> = ({
  onPrev,
  onNext,
  onAddLead,
  onAddEvent,
  onAddCheckin,
}) => (
  <div className="calendar-controls">
    <button onClick={onPrev}>Prev Week</button>
    <button onClick={onNext}>Next Week</button>
    <button onClick={onAddLead}>Add Lead</button>
    <button onClick={onAddEvent}>Add Event</button>
    <button onClick={onAddCheckin}>Add Checkin</button>
  </div>
);

export default CalendarControls;
