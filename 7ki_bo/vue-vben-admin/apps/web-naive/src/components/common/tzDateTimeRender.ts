import { h } from 'vue';

import TzDateTime from '#/components/common/TzDateTime.vue';
import type { DateTimeFormatKind } from '#/utils/timezoneUtils';

/** Naive table cell renderer that live-updates when the header timezone changes. */
export function renderTzDateTime(
  value?: Date | number | string | null,
  format: DateTimeFormatKind = 'datetime',
  fallback = '-',
) {
  return h(TzDateTime, { fallback, format, value });
}
