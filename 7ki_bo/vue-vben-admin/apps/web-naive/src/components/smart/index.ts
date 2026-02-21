/**
 * Smart Components Export
 *
 * Centralized export for all smart reusable components
 */

// Composables
export { useAutoRefresh } from '../../composables/useAutoRefresh';
// Auto-refresh component
export { default as SmartAutoRefresh } from './SmartAutoRefresh/index.vue';

export type {
  SmartAutoRefreshEmits,
  SmartAutoRefreshExpose,
  SmartAutoRefreshProps,
} from './SmartAutoRefresh/types';

// Data grid component
export { default as SmartDataGrid } from './SmartDataGrid/index.vue';
export type {
  SmartDataGridEmits,
  SmartDataGridExpose,
  SmartDataGridProps,
  SmartDataGridSummary,
  SmartPaginationConfig,
} from './SmartDataGrid/types';

// Future smart components will be exported here:
// export { default as SmartFilterForm } from './SmartFilterForm/index.vue';
// export { default as SmartActionBar } from './SmartActionBar/index.vue';
// export { default as SmartPageLayout } from './SmartPageLayout/index.vue';
