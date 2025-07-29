import { parse, differenceInMinutes, isSameWeek, startOfWeek } from "date-fns";

const FORMAT = "MM/dd/yyyy h:mma";

export const toDate = (s: string): Date => parse(s, FORMAT, new Date());

export const minutesFromWeekStart = (d: Date, weekStart: Date): number =>
  differenceInMinutes(d, weekStart);

export const normalizeWeekStart = (d: Date): Date =>
  startOfWeek(d, { weekStartsOn: 0 });

export const inSameWeek = (ds: string, weekStart: Date): boolean =>
  isSameWeek(toDate(ds), weekStart, { weekStartsOn: 0 });
