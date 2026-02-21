/**
 * SmartDataGrid Component Types
 * 
 * Reusable data grid component with built-in pagination, loading, selection, and actions
 * Based on common patterns from user management and finance screens
 */

import type { DataTableColumns } from 'naive-ui';

export interface SmartDataGridProps<T = any> {
  /** Table data array */
  data: T[];
  
  /** Table columns configuration */
  columns: DataTableColumns<T>;
  
  /** Loading state */
  loading?: boolean;
  
  /** Enable row selection with checkboxes */
  selectable?: boolean;
  
  /** Selected row keys */
  selectedKeys?: (string | number)[];
  
  /** Row key function */
  rowKey?: string | ((row: T) => string | number);
  
  /** Pagination configuration */
  pagination?: SmartPaginationConfig;
  
  /** Table height (for virtual scrolling) */
  height?: string | number;
  
  /** Horizontal scroll width */
  scrollX?: number;
  
  /** Enable striped rows */
  striped?: boolean;
  
  /** Enable remote pagination */
  remote?: boolean;
  
  /** Table size */
  size?: 'small' | 'medium' | 'large';
  
  /** Custom CSS classes */
  class?: string;
  
  /** Enable auto-refresh integration */
  autoRefresh?: boolean;
  
  /** Auto-refresh intervals */
  refreshIntervals?: number[];
  
  /** Default refresh interval */
  defaultRefreshInterval?: number;
  
  /** Show summary row */
  showSummary?: boolean;
  
  /** Summary data */
  summary?: SmartDataGridSummary;
}

export interface SmartPaginationConfig {
  /** Current page */
  page: number;
  
  /** Page size */
  pageSize: number;
  
  /** Total items count */
  total: number;
  
  /** Show size picker */
  showSizePicker?: boolean;
  
  /** Available page sizes */
  pageSizes?: number[];
  
  /** Show quick jumper */
  showQuickJumper?: boolean;
  
  /** Pagination prefix text */
  prefix?: string | ((info: { itemCount: number }) => string);
  
  /** Pagination suffix text */
  suffix?: string | ((info: { itemCount: number }) => string);
}

export interface SmartDataGridSummary {
  /** Total count */
  totalCount?: number;
  
  /** Total amount */
  totalAmount?: number;
  
  /** Selected count */
  selectedCount?: number;
  
  /** Custom summary fields */
  [key: string]: any;
}

export interface SmartDataGridEmits<T = any> {
  /** Page change event */
  'update:page': [page: number];
  
  /** Page size change event */
  'update:pageSize': [pageSize: number];
  
  /** Selection change event */
  'update:selectedKeys': [keys: (string | number)[]];
  
  /** Row selection change event */
  'selectionChange': [selectedRows: T[], selectedKeys: (string | number)[]];
  
  /** Refresh event */
  'refresh': [];
  
  /** Row click event */
  'rowClick': [row: T, index: number];
  
  /** Row double click event */
  'rowDblclick': [row: T, index: number];
}

export interface SmartDataGridExpose<T = any> {
  /** Refresh table data */
  refresh: () => void;
  
  /** Clear selection */
  clearSelection: () => void;
  
  /** Select all rows */
  selectAll: () => void;
  
  /** Get selected rows */
  getSelectedRows: () => T[];
  
  /** Get selected keys */
  getSelectedKeys: () => (string | number)[];
  
  /** Scroll to top */
  scrollToTop: () => void;
  
  /** Get table ref */
  getTableRef: () => any;
}

export interface SmartDataGridSlots<T = any> {
  /** Header slot */
  header?: () => any;
  
  /** Footer slot */
  footer?: () => any;
  
  /** Empty slot */
  empty?: () => any;
  
  /** Loading slot */
  loading?: () => any;
  
  /** Action bar slot (above table) */
  actionBar?: (props: { selectedCount: number; selectedRows: T[] }) => any;
  
  /** Summary slot (below table) */
  summary?: (props: { summary: SmartDataGridSummary }) => any;
}

// Default configurations
export const DEFAULT_PAGINATION: SmartPaginationConfig = {
  page: 1,
  pageSize: 20,
  total: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  showQuickJumper: true,
  prefix: ({ itemCount }: { itemCount: number }) => `共 ${itemCount} 条记录`
};

export const DEFAULT_PROPS = {
  loading: false,
  selectable: false,
  selectedKeys: () => [],
  rowKey: 'id',
  height: 'auto',
  scrollX: 1200,
  striped: true,
  remote: true,
  size: 'small' as const,
  autoRefresh: false,
  refreshIntervals: () => [15, 30, 60, 120],
  defaultRefreshInterval: 30,
  showSummary: false
};
