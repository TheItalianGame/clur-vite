import React from "react";
import  type { EventRecord } from "../types";
import "./RecordBox.css";

interface Props {
  data: EventRecord;
}

const EventBox: React.FC<Props> = ({ data }) => (
  <div className="record-box event">
    <strong>{data.title}</strong>
    <div>{data.start} → {data.end}</div>
    <div className="meta">created {data.create}</div>
    <div className="meta">{data.employees.join(", ")}</div>
  </div>
);

export default EventBox;
