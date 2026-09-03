import { computed } from 'vue';

import {
  displayTimezoneRef,
  getPreferredTimezoneKey,
  setDisplayTimezone,
  setDisplayTimezoneByKey,
} from '#/utils/timezoneUtils';

/**
 * Shared header display timezone. All grids, pickers, and clocks should use this.
 */
export function useDisplayTimezone() {
  const timezone = displayTimezoneRef;
  const preferredKey = computed(() => getPreferredTimezoneKey());

  return {
    preferredKey,
    setTimezone: setDisplayTimezone,
    setTimezoneByKey: setDisplayTimezoneByKey,
    timezone,
  };
}
