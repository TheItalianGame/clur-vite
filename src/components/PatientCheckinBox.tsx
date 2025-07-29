import React from "react";
import type { PatientCheckinRecord } from "../types";
import "./RecordBox.css";

interface Props {
  data: PatientCheckinRecord;
}

const PatientCheckinBox: React.FC<Props> = ({ data }) => (
  <div className="record-box pcheck">
    <strong>Patient Check‑in</strong>
    <div>{data.patient}</div>
    <div className="meta">{data.notes}</div>
    <div className="meta">{data.checkin}</div>
  </div>
);

export default PatientCheckinBox;
