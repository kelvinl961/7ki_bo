import {
  displayCalendarRangeToPicker,
  getNowInTimezone,
} from '#/utils/timezoneUtils';

export type QuickDateValue = 'day' | 'week' | 'month';

/** Day/week/month shortcuts as Naive picker timestamps (wall clock 00:00:00–23:59:59). */
export function buildQuickDateRange(value: QuickDateValue): [number, number] {
  const tzNow = getNowInTimezone();

  let startYear: number;
  let startMonth: number;
  let startDay: number;
  let endYear: number;
  let endMonth: number;
  let endDay: number;

  switch (value) {
    case 'day':
      startYear = endYear = tzNow.year;
      startMonth = endMonth = tzNow.month;
      startDay = endDay = tzNow.day;
      break;
    case 'week': {
      const weekAgo = new Date(tzNow.year, tzNow.month - 1, tzNow.day);
      weekAgo.setDate(weekAgo.getDate() - 7);
      startYear = weekAgo.getFullYear();
      startMonth = weekAgo.getMonth() + 1;
      startDay = weekAgo.getDate();
      endYear = tzNow.year;
      endMonth = tzNow.month;
      endDay = tzNow.day;
      break;
    }
    case 'month': {
      const monthAgo = new Date(tzNow.year, tzNow.month - 1, tzNow.day);
      monthAgo.setDate(monthAgo.getDate() - 30);
      startYear = monthAgo.getFullYear();
      startMonth = monthAgo.getMonth() + 1;
      startDay = monthAgo.getDate();
      endYear = tzNow.year;
      endMonth = tzNow.month;
      endDay = tzNow.day;
      break;
    }
    default:
      throw new Error(`Unsupported quick date value: ${String(value)}`);
  }

  return displayCalendarRangeToPicker(
    startYear,
    startMonth,
    startDay,
    endYear,
    endMonth,
    endDay,
  );
}

export function applyDefaultDayQuickRange(): {
  quickSelect: QuickDateValue;
  range: [number, number];
} {
  return {
    quickSelect: 'day',
    range: buildQuickDateRange('day'),
  };
}
