import React from "react";
import WeeklyCalendar from "./components/WeeklyCalendar";
import type { EmployeeData } from "./types";
import { normalizeWeekStart } from "./utils/date";
import data from "./data/fake_data.json";
import "./components/WeeklyCalendar.css";
import "./components/RecordBox.css";

const employees = data as unknown as EmployeeData[];

const App: React.FC = () => (
  <WeeklyCalendar
    data={employees}
    weekStart={normalizeWeekStart(new Date())}
  />
);

export default App;
