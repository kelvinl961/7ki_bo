<template>
  <n-date-picker
    :value="modelValue"
    type="datetimerange"
    clearable
    :style="{ width: width }"
    :start-placeholder="
      startPlaceholder || `开始日期 (${getDisplayTimezone()})`
    "
    :end-placeholder="endPlaceholder || `结束日期 (${getDisplayTimezone()})`"
    format="yyyy-MM-dd HH:mm:ss"
    :shortcuts="dateShortcuts"
    @update:value="handleDateChange"
  />
</template>

<script setup lang="ts">
import { NDatePicker } from 'naive-ui';
import {
  getNowInTimezone,
  convertTimezoneToUTC,
  getDisplayTimezone,
} from '#/utils/timezoneUtils';

interface Props {
  modelValue: [number, number] | null;
  width?: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
}

interface Emits {
  (e: 'update:modelValue', value: [number, number] | null): void;
}

const props = withDefaults(defineProps<Props>(), {
  width: '400px',
  startPlaceholder: undefined,
  endPlaceholder: undefined,
});

const emit = defineEmits<Emits>();

// Date picker shortcuts - these appear inside the date picker popup
// All shortcuts use São Paulo timezone and convert to UTC timestamps
const dateShortcuts: Record<string, () => [number, number]> = {
  今天: () => {
    const tz = getDisplayTimezone();
    const tzNow = getNowInTimezone();
    const startUTC = convertTimezoneToUTC(
      tzNow.year,
      tzNow.month,
      tzNow.day,
      0,
      0,
      0,
      tz,
    );
    const endUTC = convertTimezoneToUTC(
      tzNow.year,
      tzNow.month,
      tzNow.day,
      23,
      59,
      59,
      tz,
    );
    return [startUTC.getTime(), endUTC.getTime()];
  },
  昨天: () => {
    const tz = getDisplayTimezone();
    const tzNow = getNowInTimezone();
    const yesterday = new Date(tzNow.year, tzNow.month - 1, tzNow.day);
    yesterday.setDate(yesterday.getDate() - 1);
    const startUTC = convertTimezoneToUTC(
      yesterday.getFullYear(),
      yesterday.getMonth() + 1,
      yesterday.getDate(),
      0,
      0,
      0,
      tz,
    );
    const endUTC = convertTimezoneToUTC(
      yesterday.getFullYear(),
      yesterday.getMonth() + 1,
      yesterday.getDate(),
      23,
      59,
      59,
      tz,
    );
    return [startUTC.getTime(), endUTC.getTime()];
  },
  本周: () => {
    const tz = getDisplayTimezone();
    const tzNow = getNowInTimezone();
    const now = new Date(tzNow.year, tzNow.month - 1, tzNow.day);
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday as week start
    const monday = new Date(now);
    monday.setDate(diff);
    const startUTC = convertTimezoneToUTC(
      monday.getFullYear(),
      monday.getMonth() + 1,
      monday.getDate(),
      0,
      0,
      0,
      tz,
    );
    const endUTC = convertTimezoneToUTC(
      tzNow.year,
      tzNow.month,
      tzNow.day,
      23,
      59,
      59,
      tz,
    );
    return [startUTC.getTime(), endUTC.getTime()];
  },
  上周: () => {
    const tz = getDisplayTimezone();
    const tzNow = getNowInTimezone();
    const now = new Date(tzNow.year, tzNow.month - 1, tzNow.day);
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) - 7;
    const monday = new Date(now);
    monday.setDate(diff);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const startUTC = convertTimezoneToUTC(
      monday.getFullYear(),
      monday.getMonth() + 1,
      monday.getDate(),
      0,
      0,
      0,
      tz,
    );
    const endUTC = convertTimezoneToUTC(
      sunday.getFullYear(),
      sunday.getMonth() + 1,
      sunday.getDate(),
      23,
      59,
      59,
      tz,
    );
    return [startUTC.getTime(), endUTC.getTime()];
  },
  本月: () => {
    const tz = getDisplayTimezone();
    const tzNow = getNowInTimezone();
    const startUTC = convertTimezoneToUTC(
      tzNow.year,
      tzNow.month,
      1,
      0,
      0,
      0,
      tz,
    );
    const lastDay = new Date(tzNow.year, tzNow.month, 0).getDate();
    const endUTC = convertTimezoneToUTC(
      tzNow.year,
      tzNow.month,
      lastDay,
      23,
      59,
      59,
      tz,
    );
    return [startUTC.getTime(), endUTC.getTime()];
  },
  上月: () => {
    const tz = getDisplayTimezone();
    const tzNow = getNowInTimezone();
    const lastMonth = tzNow.month === 1 ? 12 : tzNow.month - 1;
    const lastMonthYear = tzNow.month === 1 ? tzNow.year - 1 : tzNow.year;
    const startUTC = convertTimezoneToUTC(
      lastMonthYear,
      lastMonth,
      1,
      0,
      0,
      0,
      tz,
    );
    const lastDay = new Date(lastMonthYear, lastMonth, 0).getDate();
    const endUTC = convertTimezoneToUTC(
      lastMonthYear,
      lastMonth,
      lastDay,
      23,
      59,
      59,
      tz,
    );
    return [startUTC.getTime(), endUTC.getTime()];
  },
  最近7天: () => {
    const tz = getDisplayTimezone();
    const tzNow = getNowInTimezone();
    const sevenDaysAgo = new Date(tzNow.year, tzNow.month - 1, tzNow.day);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const startUTC = convertTimezoneToUTC(
      sevenDaysAgo.getFullYear(),
      sevenDaysAgo.getMonth() + 1,
      sevenDaysAgo.getDate(),
      0,
      0,
      0,
      tz,
    );
    const endUTC = convertTimezoneToUTC(
      tzNow.year,
      tzNow.month,
      tzNow.day,
      23,
      59,
      59,
      tz,
    );
    return [startUTC.getTime(), endUTC.getTime()];
  },
  最近30天: () => {
    const tz = getDisplayTimezone();
    const tzNow = getNowInTimezone();
    const thirtyDaysAgo = new Date(tzNow.year, tzNow.month - 1, tzNow.day);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startUTC = convertTimezoneToUTC(
      thirtyDaysAgo.getFullYear(),
      thirtyDaysAgo.getMonth() + 1,
      thirtyDaysAgo.getDate(),
      0,
      0,
      0,
      tz,
    );
    const endUTC = convertTimezoneToUTC(
      tzNow.year,
      tzNow.month,
      tzNow.day,
      23,
      59,
      59,
      tz,
    );
    return [startUTC.getTime(), endUTC.getTime()];
  },
};

const handleDateChange = (value: [number, number] | null) => {
  emit('update:modelValue', value);
};
</script>
