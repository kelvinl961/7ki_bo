<template>
  <n-date-picker
    :value="modelValue"
    type="datetimerange"
    clearable
    :style="{ width: width }"
    :start-placeholder="startPlaceholder || '开始日期'"
    :end-placeholder="endPlaceholder || '结束日期'"
    format="yyyy-MM-dd HH:mm:ss"
    :shortcuts="dateShortcuts"
    @update:value="handleDateChange"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { NDatePicker } from 'naive-ui';

import {
  displayCalendarRangeToPicker,
  getNowInTimezone,
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

withDefaults(defineProps<Props>(), {
  width: '400px',
  startPlaceholder: undefined,
  endPlaceholder: undefined,
});

const emit = defineEmits<Emits>();

function shiftDays(
  year: number,
  month: number,
  day: number,
  delta: number,
): { day: number; month: number; year: number } {
  const shifted = new Date(year, month - 1, day + delta);
  return {
    year: shifted.getFullYear(),
    month: shifted.getMonth() + 1,
    day: shifted.getDate(),
  };
}

function mondayOfWeek(year: number, month: number, day: number) {
  const now = new Date(year, month - 1, day);
  const weekday = now.getDay();
  const diff = now.getDate() - weekday + (weekday === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  return {
    year: monday.getFullYear(),
    month: monday.getMonth() + 1,
    day: monday.getDate(),
  };
}

const dateShortcuts = computed(() => {
  const build = () => {
    const tzNow = getNowInTimezone();
    return tzNow;
  };

  return {
    今天: (): [number, number] => {
      const n = build();
      return displayCalendarRangeToPicker(
        n.year,
        n.month,
        n.day,
        n.year,
        n.month,
        n.day,
      );
    },
    昨天: (): [number, number] => {
      const n = build();
      const y = shiftDays(n.year, n.month, n.day, -1);
      return displayCalendarRangeToPicker(
        y.year,
        y.month,
        y.day,
        y.year,
        y.month,
        y.day,
      );
    },
    本周: (): [number, number] => {
      const n = build();
      const mon = mondayOfWeek(n.year, n.month, n.day);
      return displayCalendarRangeToPicker(
        mon.year,
        mon.month,
        mon.day,
        n.year,
        n.month,
        n.day,
      );
    },
    上周: (): [number, number] => {
      const n = build();
      const thisMon = mondayOfWeek(n.year, n.month, n.day);
      const lastMon = shiftDays(thisMon.year, thisMon.month, thisMon.day, -7);
      const lastSun = shiftDays(lastMon.year, lastMon.month, lastMon.day, 6);
      return displayCalendarRangeToPicker(
        lastMon.year,
        lastMon.month,
        lastMon.day,
        lastSun.year,
        lastSun.month,
        lastSun.day,
      );
    },
    本月: (): [number, number] => {
      const n = build();
      const lastDay = new Date(n.year, n.month, 0).getDate();
      return displayCalendarRangeToPicker(n.year, n.month, 1, n.year, n.month, lastDay);
    },
    上月: (): [number, number] => {
      const n = build();
      const lastMonth = n.month === 1 ? 12 : n.month - 1;
      const lastMonthYear = n.month === 1 ? n.year - 1 : n.year;
      const lastDay = new Date(lastMonthYear, lastMonth, 0).getDate();
      return displayCalendarRangeToPicker(
        lastMonthYear,
        lastMonth,
        1,
        lastMonthYear,
        lastMonth,
        lastDay,
      );
    },
    最近7天: (): [number, number] => {
      const n = build();
      const start = shiftDays(n.year, n.month, n.day, -7);
      return displayCalendarRangeToPicker(
        start.year,
        start.month,
        start.day,
        n.year,
        n.month,
        n.day,
      );
    },
    最近30天: (): [number, number] => {
      const n = build();
      const start = shiftDays(n.year, n.month, n.day, -30);
      return displayCalendarRangeToPicker(
        start.year,
        start.month,
        start.day,
        n.year,
        n.month,
        n.day,
      );
    },
  };
});

const handleDateChange = (value: [number, number] | null) => {
  emit('update:modelValue', value);
};
</script>
