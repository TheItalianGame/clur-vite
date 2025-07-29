import {
  parse,
  differenceInMinutes,
  differenceInCalendarDays,
  isSameWeek,
  startOfWeek,
  startOfDay,
  format,
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

export const formatTime = (s: string): string =>
  format(toDate(s), "h:mma").toLowerCase();

export const formatRange = (s: string, e: string): string =>
  `${formatTime(s)}-${formatTime(e)}`;
