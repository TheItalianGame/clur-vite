import {
  parse,
  differenceInMinutes,
  isSameWeek,
  startOfWeek,
} from "date-fns";

const FORMAT = "MM/dd/yyyy h:mma";

export const toDate = (s: string): Date => parse(s, FORMAT, new Date());

export const minutesFromWeekStart = (d: Date, weekStart: Date): number =>
  differenceInMinutes(d, weekStart);

export const normalizeWeekStart = (d: Date): Date =>
  startOfWeek(d, { weekStartsOn: 0 });

export const inSameWeek = (ds: string, weekStart: Date): boolean =>
  isSameWeek(toDate(ds), weekStart, { weekStartsOn: 0 });

/** Index of the day within the week starting at `weekStart` (0-6). */
export const dayIndexFromWeekStart = (d: Date, weekStart: Date): number =>
  Math.floor(minutesFromWeekStart(d, weekStart) / (60 * 24));

/** Minutes from the start of the day for the given date. */
export const minutesFromDayStart = (d: Date): number =>
  d.getHours() * 60 + d.getMinutes();
