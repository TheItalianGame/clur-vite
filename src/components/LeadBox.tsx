import React from "react";
import type { LeadRecord } from "../types";
import Hover from "./Hover";
import "./RecordBox.css";

interface Props {
  data: LeadRecord;
}

const LeadBox: React.FC<Props> = ({ data }) => (
  <div className="record-box lead">
    <Hover record="Lead" data={data as unknown as Record<string, unknown>} />
  </div>
);

export default LeadBox;
