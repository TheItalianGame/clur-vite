import {
  parse,
  differenceInMinutes,
  differenceInCalendarDays,
  isSameWeek,
  startOfWeek,
  startOfDay,
} from "date-fns";

const FORMAT = "MM/dd/yyyy h:mma";

export const toDate = (s: string): Date => parse(s, FORMAT, new Date());

export const minutesFromWeekStart = (d: Date, weekStart: Date): number =>
  differenceInMinutes(d, weekStart);

export const minutesFromDayStart = (d: Date): number =>
  differenceInMinutes(d, startOfDay(d));

export const dayIndexFromWeekStart = (d: Date, weekStart: Date): number =>
  differenceInCalendarDays(d, weekStart);

export const normalizeWeekStart = (d: Date): Date =>
  startOfWeek(d, { weekStartsOn: 0 });

export const inSameWeek = (ds: string, weekStart: Date): boolean =>
  isSameWeek(toDate(ds), weekStart, { weekStartsOn: 0 });
