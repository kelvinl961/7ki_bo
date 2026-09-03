<script setup lang="ts">
import { computed } from 'vue';

import {
  displayTimezoneRef,
  formatDateTimeInTimezone,
  type DateTimeFormatKind,
} from '#/utils/timezoneUtils';

const props = withDefaults(
  defineProps<{
    fallback?: string;
    format?: DateTimeFormatKind;
    value?: Date | number | string | null;
  }>(),
  {
    fallback: '-',
    format: 'datetime',
    value: null,
  },
);

const formatted = computed(() => {
  const tz = displayTimezoneRef.value;
  if (props.value === null || props.value === undefined || props.value === '') {
    return props.fallback;
  }
  return formatDateTimeInTimezone(props.value, tz, props.format);
});
</script>

<template>
  <span>{{ formatted }}</span>
</template>
