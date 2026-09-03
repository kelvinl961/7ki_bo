/**
 * 🛠️ Form Helpers Composable
 * Provides utilities for search inputs and date ranges
 */

import type { Ref } from 'vue';

import { computed, ref, watch } from 'vue';

import {
  formatPickerWallClock,
  pickerDateRangeToUtcTimestamps,
} from '#/utils/timezoneUtils';

/**
 * Auto-trim search input
 * Usage: const trimmedSearch = useAutoTrim(searchInput);
 */
export function useAutoTrim(input: Ref<string>) {
  return computed({
    get: () => input.value,
    set: (value: string) => {
      // Auto-trim on input
      input.value = value?.trim() || '';
    },
  });
}

/**
 * Create a debounced auto-trim search input
 * Usage: const { value, trimmed } = useTrimmedSearch(initialValue);
 */
export function useTrimmedSearch(initialValue = '') {
  const value = ref(initialValue);
  const trimmed = computed(() => value.value.trim());

  return {
    value,
    trimmed,
  };
}

/**
 * Format date range with time display in the selected timezone
 * Shows: "2024-01-01 00:00:00 ~ 2024-01-31 23:59:59"
 */
export function formatDateRangeWithTime(
  startDate: Date | null | number | string,
  endDate: Date | null | number | string,
): string {
  if (!startDate || !endDate) return '';

  return `${formatPickerWallClock(new Date(startDate).getTime())} ~ ${formatPickerWallClock(new Date(endDate).getTime())}`;
}

/**
 * Normalize a Naive picker range for API calls.
 * Picker values are display-TZ wall clocks; convert those to UTC ISO.
 */
export function normalizeDateRangeForAPI(dateRange: [number, number] | null): {
  endDate?: string;
  startDate?: string;
} {
  if (!dateRange || dateRange.length !== 2) {
    return {};
  }

  const [startMs, endMs] = pickerDateRangeToUtcTimestamps(dateRange);

  return {
    startDate: new Date(startMs).toISOString(),
    endDate: new Date(endMs).toISOString(),
  };
}

/**
 * Get date range label with time
 * Usage in template: {{ getDateRangeLabel(dateRange) }}
 */
export function getDateRangeLabel(dateRange: [number, number] | null): string {
  if (!dateRange) return '选择日期范围';

  return formatDateRangeWithTime(dateRange[0], dateRange[1]);
}

/**
 * Watch and auto-trim input value
 * Usage: watchAndTrim(searchRef);
 */
export function watchAndTrim(input: Ref<string>) {
  watch(
    input,
    (newValue) => {
      if (newValue && typeof newValue === 'string') {
        const trimmed = newValue.trim();
        if (trimmed !== newValue) {
          input.value = trimmed;
        }
      }
    },
    { immediate: false },
  );
}
