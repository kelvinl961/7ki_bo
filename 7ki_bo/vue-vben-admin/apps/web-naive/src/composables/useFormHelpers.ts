/**
 * 🛠️ Form Helpers Composable
 * Provides utilities for search inputs and date ranges
 */

import { computed, type Ref, ref, watch } from 'vue';

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
 * Format date range with time display
 * Shows: "2024-01-01 00:00:00 ~ 2024-01-31 23:59:59"
 */
export function formatDateRangeWithTime(
  startDate: number | string | Date | null,
  endDate: number | string | Date | null,
): string {
  if (!startDate || !endDate) return '';

  const start = new Date(startDate);
  const end = new Date(endDate);

  const formatDateTime = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  return `${formatDateTime(start)} ~ ${formatDateTime(end)}`;
}

/**
 * Normalize date range for API calls
 * Sets startDate to 00:00:00 and endDate to 23:59:59
 */
export function normalizeDateRangeForAPI(dateRange: [number, number] | null): {
  startDate?: string;
  endDate?: string;
} {
  if (!dateRange || dateRange.length !== 2) {
    return {};
  }

  const [start, end] = dateRange;

  // Start of day (00:00:00)
  const startDate = new Date(start);
  startDate.setHours(0, 0, 0, 0);

  // End of day (23:59:59.999)
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
}

/**
 * Get date range label with time
 * Usage in template: {{ getDateRangeLabel(dateRange) }}
 */
export function getDateRangeLabel(dateRange: [number, number] | null): string {
  if (!dateRange) return '选择日期范围';

  const start = new Date(dateRange[0]);
  const end = new Date(dateRange[1]);

  // Set to start/end of day for display
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return `${formatDate(start)} 00:00:00 ~ ${formatDate(end)} 23:59:59`;
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



