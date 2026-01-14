/**
 * Smart Components Export
 * 
 * Centralized export for all smart reusable components
 */

// Auto-refresh component
export { default as SmartAutoRefresh } from './SmartAutoRefresh/index.vue';
export type { 
  SmartAutoRefreshProps, 
  SmartAutoRefreshEmits, 
  SmartAutoRefreshExpose 
} from './SmartAutoRefresh/types';

// Composables
export { useAutoRefresh } from '../../composables/useAutoRefresh';

// Data grid component
export { default as SmartDataGrid } from './SmartDataGrid/index.vue';
export type { 
  SmartDataGridProps, 
  SmartDataGridEmits, 
  SmartDataGridExpose,
  SmartPaginationConfig,
  SmartDataGridSummary
} from './SmartDataGrid/types';

// Future smart components will be exported here:
// export { default as SmartFilterForm } from './SmartFilterForm/index.vue';
// export { default as SmartActionBar } from './SmartActionBar/index.vue';
// export { default as SmartPageLayout } from './SmartPageLayout/index.vue';
