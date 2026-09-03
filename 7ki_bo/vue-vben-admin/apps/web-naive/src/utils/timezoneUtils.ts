/**
 * Display timezone utilities.
 * Header selector is the source of truth; API timestamps stay UTC.
 */

import { ref } from 'vue';

export const DEFAULT_DISPLAY_TIMEZONE = 'America/Sao_Paulo';
export const DEFAULT_TIMEZONE_KEY = 'brazil';

export const TIMEZONE_KEY_MAP = {
  brazil: 'America/Sao_Paulo',
  vietnam: 'Asia/Ho_Chi_Minh',
  china: 'Asia/Shanghai',
} as const;

export type TimezoneKey = keyof typeof TIMEZONE_KEY_MAP;

export const IANA_TO_TIMEZONE_KEY: Record<string, TimezoneKey> = {
  'America/Sao_Paulo': 'brazil',
  'Asia/Ho_Chi_Minh': 'vietnam',
  'Asia/Shanghai': 'china',
};

const PREFERRED_STORAGE_KEY = 'preferred_timezone';
const DISPLAY_STORAGE_KEY = 'display_timezone';

export type DateTimeFormatKind = 'date' | 'datetime' | 'time';

function canUseStorage(): boolean {
  return typeof localStorage !== 'undefined';
}

function readStoredIanaTimezone(): string {
  if (!canUseStorage()) {
    return DEFAULT_DISPLAY_TIMEZONE;
  }

  const preferredKey = localStorage.getItem(PREFERRED_STORAGE_KEY);
  if (preferredKey && preferredKey in TIMEZONE_KEY_MAP) {
    return TIMEZONE_KEY_MAP[preferredKey as TimezoneKey];
  }

  const storedIana = localStorage.getItem(DISPLAY_STORAGE_KEY);
  if (storedIana) {
    return storedIana;
  }

  return DEFAULT_DISPLAY_TIMEZONE;
}

/** Shared reactive IANA timezone. Header + formatters + pickers all read this. */
export const displayTimezoneRef = ref(readStoredIanaTimezone());

export const getDisplayTimezone = (): string => displayTimezoneRef.value;

export const getPreferredTimezoneKey = (): string =>
  IANA_TO_TIMEZONE_KEY[displayTimezoneRef.value] || DEFAULT_TIMEZONE_KEY;

export const setDisplayTimezone = (timezone: string): void => {
  if (!timezone) return;

  displayTimezoneRef.value = timezone;

  if (canUseStorage()) {
    localStorage.setItem(DISPLAY_STORAGE_KEY, timezone);
    const key = IANA_TO_TIMEZONE_KEY[timezone];
    if (key) {
      localStorage.setItem(PREFERRED_STORAGE_KEY, key);
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('timezone-changed', { detail: { timezone } }),
    );
  }
};

export const setDisplayTimezoneByKey = (key: string): void => {
  const typedKey = key as TimezoneKey;
  const iana = TIMEZONE_KEY_MAP[typedKey] || DEFAULT_DISPLAY_TIMEZONE;
  if (canUseStorage()) {
    localStorage.setItem(
      PREFERRED_STORAGE_KEY,
      typedKey in TIMEZONE_KEY_MAP ? key : DEFAULT_TIMEZONE_KEY,
    );
  }
  setDisplayTimezone(iana);
};

// Get today's date string in display timezone (YYYY-MM-DD format)
export const getTodayInTimezone = (timezone?: string): string => {
  const tz = timezone || getDisplayTimezone();
  const now = new Date();

  // Format date in timezone
  const dateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  return dateStr; // Returns YYYY-MM-DD format
};

export const formatDateTimeInTimezone = (
  dateString: Date | number | string | null | undefined,
  timezone?: string,
  format: DateTimeFormatKind = 'datetime',
): string => {
  if (dateString === null || dateString === undefined || dateString === '') {
    return '-';
  }

  const date =
    dateString instanceof Date ? dateString : new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  const tz = timezone || getDisplayTimezone();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: tz,
    hour12: false,
  };

  if (format === 'date') {
    options.year = 'numeric';
    options.month = '2-digit';
    options.day = '2-digit';
  } else if (format === 'time') {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.second = '2-digit';
  } else {
    options.year = 'numeric';
    options.month = '2-digit';
    options.day = '2-digit';
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.second = '2-digit';
  }

  return new Intl.DateTimeFormat('zh-CN', options).format(date);
};

export const formatDateInTimezone = (
  dateString: Date | number | string | null | undefined,
  timezone?: string,
): string => formatDateTimeInTimezone(dateString, timezone, 'date');

export const formatTimeInTimezone = (
  dateString: Date | number | string | null | undefined,
  timezone?: string,
): string => formatDateTimeInTimezone(dateString, timezone, 'time');

export function getDatePartsInTimezone(
  date: Date,
  timezone?: string,
): {
  day: number;
  hour: number;
  minute: number;
  month: number;
  second: number;
  year: number;
} {
  const tz = timezone || getDisplayTimezone();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const read = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((part) => part.type === type)?.value || 0);

  return {
    year: read('year'),
    month: read('month'),
    day: read('day'),
    hour: read('hour'),
    minute: read('minute'),
    second: read('second'),
  };
}

export function startOfDayInTimezone(
  date: Date,
  timezone?: string,
): Date {
  const tz = timezone || getDisplayTimezone();
  const { year, month, day } = getDatePartsInTimezone(date, tz);
  return convertTimezoneToUTC(year, month, day, 0, 0, 0, tz);
}

export function endOfDayInTimezone(date: Date, timezone?: string): Date {
  const tz = timezone || getDisplayTimezone();
  const { year, month, day } = getDatePartsInTimezone(date, tz);
  return convertTimezoneToUTC(year, month, day, 23, 59, 59, tz);
}

/** Calendar date (YYYY-MM-DD) of an instant in the display timezone. */
export function formatIsoDateInTimezone(
  date: Date | number | string,
  timezone?: string,
): string {
  const { year, month, day } = getDatePartsInTimezone(new Date(date), timezone);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Naive DatePicker has no IANA time-zone prop — it always formats timestamps in
 * the browser's local zone. Store the selected timezone's wall clock as a local
 * Date so "today" shows 00:00:00–23:59:59 instead of a UTC-shifted range.
 */
export function wallClockToPickerTimestamp(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
): number {
  return new Date(year, month - 1, day, hour, minute, second).getTime();
}

export function displayCalendarRangeToPicker(
  startYear: number,
  startMonth: number,
  startDay: number,
  endYear: number,
  endMonth: number,
  endDay: number,
  endHour = 23,
  endMinute = 59,
  endSecond = 59,
): [number, number] {
  return [
    wallClockToPickerTimestamp(startYear, startMonth, startDay, 0, 0, 0),
    wallClockToPickerTimestamp(
      endYear,
      endMonth,
      endDay,
      endHour,
      endMinute,
      endSecond,
    ),
  ];
}

/** Treat a Naive picker timestamp's local Y-M-D H:M:S as display-TZ wall clock, then UTC. */
export function pickerTimestampToUtc(
  timestamp: number,
  timezone?: string,
): Date {
  const date = new Date(timestamp);
  return convertTimezoneToUTC(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    timezone,
  );
}

export function pickerRangeToUtcIso(
  range: [number, number],
  timezone?: string,
): { endDate: string; startDate: string } {
  return {
    startDate: pickerTimestampToUtc(range[0], timezone).toISOString(),
    endDate: pickerTimestampToUtc(range[1], timezone).toISOString(),
  };
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** Format a Naive picker timestamp as the wall clock shown in the input. */
export function formatPickerWallClock(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

/** YYYY-MM-DD of a Naive picker timestamp (the calendar day shown in the input). */
export function pickerTimestampToYmd(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Date-only picker range → UTC instants for 00:00:00–23:59:59 in the display TZ. */
export function pickerDateRangeToUtcTimestamps(
  range: [number, number],
  timezone?: string,
): [number, number] {
  const start = new Date(range[0]);
  const end = new Date(range[1]);
  return [
    convertTimezoneToUTC(
      start.getFullYear(),
      start.getMonth() + 1,
      start.getDate(),
      0,
      0,
      0,
      timezone,
    ).getTime(),
    convertTimezoneToUTC(
      end.getFullYear(),
      end.getMonth() + 1,
      end.getDate(),
      23,
      59,
      59,
      timezone,
    ).getTime(),
  ];
}

// Get current date/time components in display timezone
export const getNowInTimezone = (
  timezone?: string,
): {
  day: number;
  hour: number;
  minute: number;
  month: number;
  second: number;
  year: number;
} => {
  const tz = timezone || getDisplayTimezone();
  const now = new Date();

  // Get timezone time string
  const tzTimeString = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(now);

  // Parse: "12/08/2025, 14:30:00"
  const [datePart, timePart] = tzTimeString.split(', ');
  if (!datePart || !timePart) {
    // Fallback to current local time
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds(),
    };
  }

  const [month, day, year] = datePart.split('/');
  const [hour, minute, second] = timePart.split(':');

  if (!month || !day || !year || !hour || !minute) {
    // Fallback
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds(),
    };
  }

  return {
    year: Number.parseInt(year),
    month: Number.parseInt(month),
    day: Number.parseInt(day),
    hour: Number.parseInt(hour),
    minute: Number.parseInt(minute),
    second: Number.parseInt(second || '0'),
  };
};

// Convert a date/time in timezone to UTC Date object
// Uses a simple binary search approach to find the correct UTC time
export const convertTimezoneToUTC = (
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timezone?: string,
): Date => {
  const tz = timezone || getDisplayTimezone();

  // Validate inputs
  if (
    isNaN(year) ||
    isNaN(month) ||
    isNaN(day) ||
    isNaN(hour) ||
    isNaN(minute) ||
    isNaN(second)
  ) {
    console.error('Invalid date components:', {
      year,
      month,
      day,
      hour,
      minute,
      second,
    });
    return new Date(); // Return current date as fallback
  }

  // Validate ranges
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59 ||
    second < 0 ||
    second > 59
  ) {
    console.error('Date components out of range:', {
      year,
      month,
      day,
      hour,
      minute,
      second,
    });
    return new Date(); // Return current date as fallback
  }

  // ✅ FIX: Use iterative search to find the correct UTC time
  // This is more reliable than trying to calculate offsets
  // Search within ±24 hours to account for all possible timezone offsets
  for (let offsetHours = -24; offsetHours <= 24; offsetHours++) {
    const testUTC = new Date(
      Date.UTC(year, month - 1, day, hour + offsetHours, minute, second),
    );
    if (isNaN(testUTC.getTime())) continue;

    let formatted: string;
    try {
      formatted = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(testUTC);
    } catch {
      continue;
    }

    const [fDate, fTime] = formatted.split(', ');
    if (fDate && fTime) {
      const [fM, fD, fY] = fDate.split('/');
      const [fH, fMin, fSec] = fTime.split(':');
      if (
        fM &&
        fD &&
        fY &&
        fH &&
        fMin &&
        fSec && // Perfect match found
        Number.parseInt(fY) === year &&
        Number.parseInt(fM) === month &&
        Number.parseInt(fD) === day &&
        Number.parseInt(fH) === hour &&
        Number.parseInt(fMin) === minute &&
        Number.parseInt(fSec) === second
      ) {
        return testUTC;
      }
    }
  }

  // If no perfect match found, use a more refined search with smaller increments
  // Start from a reasonable guess (midday UTC)
  const baseUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  let baseFormatted: string;
  try {
    baseFormatted = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(baseUTC);
  } catch {
    // Ultimate fallback: return UTC time (not ideal but won't crash)
    return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  }

  const [bDate, bTime] = baseFormatted.split(', ');
  if (bDate && bTime) {
    const [bM, bD, bY] = bDate.split('/');
    const [bH] = bTime.split(':');
    if (bM && bD && bY && bH) {
      // Calculate approximate offset
      const hourDiff = hour - Number.parseInt(bH);
      const dayDiff = day - Number.parseInt(bD);
      const result = new Date(
        baseUTC.getTime() +
          hourDiff * 3_600_000 +
          dayDiff * 86_400_000 +
          minute * 60_000 +
          second * 1000,
      );

      // Verify and return
      let verify: string;
      try {
        verify = new Intl.DateTimeFormat('en-US', {
          timeZone: tz,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(result);
      } catch {
        return result; // Return even if verification fails
      }

      const [vDate, vTime] = verify.split(', ');
      if (vDate && vTime) {
        const [vM, vD, vY] = vDate.split('/');
        const [vH, vMin, vSec] = vTime.split(':');
        if (
          vM &&
          vD &&
          vY &&
          vH &&
          vMin &&
          vSec &&
          Number.parseInt(vY) === year &&
          Number.parseInt(vM) === month &&
          Number.parseInt(vD) === day &&
          Number.parseInt(vH) === hour &&
          Number.parseInt(vMin) === minute &&
          Number.parseInt(vSec) === second
        ) {
          return result;
        }
      }
      return result; // Return even if not perfect, it's close enough
    }
  }

  // Ultimate fallback: return UTC time (not ideal but won't crash)
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
};
