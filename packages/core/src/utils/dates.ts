// Wall-clock dates and times for the pickers: YYYY-MM-DD and HH:mm strings,
// never Date objects, so nothing shifts with time zones. All math runs on UTC.

const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME = /^(\d{2}):(\d{2})$/;

const pad = (n: number) => String(n).padStart(2, '0');

/** True for a real YYYY-MM-DD date. */
export function isDate(value: string | null | undefined): value is string {
  const m = value ? DATE.exec(value) : null;
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}

/** True for a real HH:mm time. */
export function isTime(value: string | null | undefined): value is string {
  const m = value ? TIME.exec(value) : null;
  return !!m && +m[1] < 24 && +m[2] < 60;
}

const utc = (date: string) => Date.UTC(+date.slice(0, 4), +date.slice(5, 7) - 1, +date.slice(8, 10));
const fromUtc = (ms: number) => {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
};

/** The date `n` days later (or earlier). */
export const addDays = (date: string, n: number) => fromUtc(utc(date) + n * 86_400_000);

/** The same day `n` months later, or that month's last day when it's shorter. */
export function addMonths(date: string, n: number): string {
  const y = +date.slice(0, 4);
  const m = +date.slice(5, 7) - 1 + n;
  const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return fromUtc(Date.UTC(y, m, Math.min(+date.slice(8, 10), last)));
}

/** The first day of the date's month. */
export const monthStart = (date: string) => `${date.slice(0, 7)}-01`;

/** 0 = Sunday … 6 = Saturday. */
export const weekday = (date: string) => new Date(utc(date)).getUTCDay();

/** Today in the browser's zone. */
export function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** The weeks of a month as dates, each week starting on `weekStart` (0 = Sunday); days of the months around fill the edges. */
export function monthWeeks(month: string, weekStart: number): string[][] {
  const first = monthStart(month);
  const start = addDays(first, -((weekday(first) - weekStart + 7) % 7));
  const next = addMonths(first, 1);
  const weeks: string[][] = [];
  for (let day = start; day < next; ) {
    const week: string[] = [];
    for (let i = 0; i < 7; i++, day = addDays(day, 1)) week.push(day);
    weeks.push(week);
  }
  return weeks;
}

type LocaleInfo = { getWeekInfo?: () => { firstDay: number }; weekInfo?: { firstDay: number } };

/** The locale's first day of the week (0 = Sunday); Monday where the browser can't say. */
export function weekStartOf(locale?: string): number {
  try {
    const l = new Intl.Locale(locale ?? new Intl.DateTimeFormat().resolvedOptions().locale) as unknown as LocaleInfo;
    const first = (l.getWeekInfo?.() ?? l.weekInfo)?.firstDay;
    return first ? first % 7 : 1;
  } catch {
    return 1;
  }
}

export type HourCycle = 'h12' | 'h23';

/** Whether the locale writes 12- or 24-hour times. */
export function hourCycleOf(locale?: string): HourCycle {
  try {
    const cycle = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hourCycle;
    return cycle === 'h11' || cycle === 'h12' ? 'h12' : 'h23';
  } catch {
    return 'h23';
  }
}

/** A date in the locale's words: formatDate('2026-11-16', 'en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) → "Mon 16 Nov". */
export function formatDate(date: string, locale: string | undefined, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(utc(date));
}

/** A time in the locale's words: "14:30" or "2:30 PM". */
export function formatTime(time: string, locale: string | undefined, hourCycle: HourCycle): string {
  const ms = Date.UTC(2000, 0, 1, +time.slice(0, 2), +time.slice(3, 5));
  return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', hourCycle, timeZone: 'UTC' }).format(ms);
}

/** Minutes since midnight. */
export const minutes = (time: string) => +time.slice(0, 2) * 60 + +time.slice(3, 5);

/** HH:mm from minutes since midnight (wraps past midnight). */
export const fromMinutes = (n: number) => `${pad(Math.floor(n / 60) % 24)}:${pad(n % 60)}`;

/** The times a picker offers: `times` as given, else every `step` minutes (default 30) from `min` to `max` (default the whole day). */
export function offeredTimes({ times, step = 30, min = '00:00', max = '23:59' }: { times?: string[]; step?: number; min?: string; max?: string }): string[] {
  return times ?? timesBetween(min, max, step);
}

/** Every `step` minutes from `min` to `max`, both included when they land on a step. */
export function timesBetween(min: string, max: string, step: number): string[] {
  const out: string[] = [];
  const end = minutes(max);
  for (let n = minutes(min); n <= end; n += Math.max(1, step)) out.push(fromMinutes(n));
  return out;
}
