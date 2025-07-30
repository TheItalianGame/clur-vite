export interface BaseRecord {
create: string; // "MM/DD/YYYY h\:mmA"
}


export interface LeadRecord extends BaseRecord {
firstname: string;
lastname: string;
}

export interface EventRecord extends BaseRecord {
title: string;
start: string;
end: string;
employees: string[];
}

export interface PatientCheckinRecord extends BaseRecord {
patient: string;
checkin: string;
notes: string;
}

export type RecordKind = "Lead" | "Event" | "Patient Checkin";
export type AnyRecord = LeadRecord | EventRecord | PatientCheckinRecord;

export interface RecordGroup {
type: RecordKind;
records: AnyRecord[];
}

export interface EmployeeData {
employee: string;
records: RecordGroup[];
}

export interface CalendarItem {
  day: number;
  col: number;
  top: number;
  height: number;
  kind: "circle" | "pill";
  color: string;
  rec: AnyRecord;
  type: RecordKind;
}
