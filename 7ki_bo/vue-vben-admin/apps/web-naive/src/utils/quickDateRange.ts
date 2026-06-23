import {
  convertTimezoneToUTC,
  getDisplayTimezone,
  getNowInTimezone,
} from '#/utils/timezoneUtils';

export type QuickDateValue = 'day' | 'week' | 'month';

/** 与 all-members 页面一致的日/周/月快捷范围（展示时区 → UTC 时间戳） */
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

  const tz = getDisplayTimezone();
  const startDateUTC = convertTimezoneToUTC(
    startYear,
    startMonth,
    startDay,
    0,
    0,
    0,
    tz,
  );
  const endDateUTC = convertTimezoneToUTC(
    endYear,
    endMonth,
    endDay,
    23,
    59,
    59,
    tz,
  );

  if (Number.isNaN(startDateUTC.getTime()) || Number.isNaN(endDateUTC.getTime())) {
    return [
      new Date(Date.UTC(startYear, startMonth - 1, startDay, 3, 0, 0)).getTime(),
      new Date(Date.UTC(endYear, endMonth - 1, endDay, 2, 59, 59)).getTime(),
    ];
  }

  return [startDateUTC.getTime(), endDateUTC.getTime()];
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
