import React from "react";
import type { LeadRecord } from "../types";
import "./RecordBox.css";

interface Props {
  data: LeadRecord;
}

const LeadBox: React.FC<Props> = ({ data }) => (
  <div className="record-box lead">
    <strong>Lead</strong>
    <div>{data.firstname} {data.lastname}</div>
    <div className="meta">{data.create}</div>
  </div>
);

export default LeadBox;
