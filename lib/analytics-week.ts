const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function startOfWeekMonday(date: Date): Date {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function formatShortDate(date: Date): string {
  return `${MONTH_SHORT[date.getMonth()]} ${date.getDate()}`;
}

export function getWeekDateRange(year: number, weekNumber: number): { weekStartDate: Date; weekEndDate: Date } {
  const jan1 = new Date(year, 0, 1);
  const firstWeekMonday = startOfWeekMonday(jan1);
  const weekStartDate = addDays(firstWeekMonday, (weekNumber - 1) * 7);
  const weekEndDate = addDays(weekStartDate, 6);

  return { weekStartDate, weekEndDate };
}

export function formatStandardWeekLabel(year: number, weekNumber: number): string {
  const { weekStartDate, weekEndDate } = getWeekDateRange(year, weekNumber);
  return `${year} Week ${weekNumber} (${formatShortDate(weekStartDate)}–${formatShortDate(weekEndDate)})`;
}

export function getCanonicalWeekData(year: number, weekNumber: number): {
  year: number;
  weekNumber: number;
  month: number;
  weekLabel: string;
  weekStartDate: Date;
  weekEndDate: Date;
} {
  const { weekStartDate, weekEndDate } = getWeekDateRange(year, weekNumber);

  return {
    year,
    weekNumber,
    month: weekStartDate.getMonth() + 1,
    weekLabel: formatStandardWeekLabel(year, weekNumber),
    weekStartDate,
    weekEndDate,
  };
}