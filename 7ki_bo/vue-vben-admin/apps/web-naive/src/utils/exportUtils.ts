/**
 * 📊 Export Utilities
 * Reusable export functions for grid data across all pages
 */

import type { DataTableColumns } from 'naive-ui';

import { useMessage } from 'naive-ui';

/**
 * Column definition for export (simplified from Naive UI's complex structure)
 */
export interface ExportColumn {
  key: string;
  title: string;
  children?: ExportColumn[]; // For nested/grouped columns
  render?: (row: any, rowIndex: number) => number | string; // Custom formatter
  format?: 'currency' | 'date' | 'datetime' | 'number' | 'percentage'; // Auto formatting
  decimals?: number; // Decimal places for numbers
}

/**
 * Export options
 */
export interface ExportOptions {
  filename?: string; // Custom filename (without extension)
  sheetName?: string; // Excel sheet name
  includeHeaders?: boolean; // Include column headers (default: true)
  format?: 'csv' | 'json' | 'xlsx'; // Export format (default: xlsx)
  dateFormat?: string; // Date format for date columns
  currencySymbol?: string; // Currency symbol (default: none)
}

/**
 * Convert Naive UI DataTableColumns to ExportColumns
 * Automatically extracts column information from Naive UI table columns
 */
export function convertNaiveColumnsToExportColumns(
  naiveColumns: DataTableColumns<any>,
): ExportColumn[] {
  const result: ExportColumn[] = [];

  const processColumn = (col: any): ExportColumn | null => {
    // Skip columns without key or title
    if (!col.key && !col.title) return null;

    const exportCol: ExportColumn = {
      key: col.key || col.title,
      title: col.title || col.key,
    };

    // Handle nested columns
    if (col.children && Array.isArray(col.children)) {
      const childColumns: ExportColumn[] = [];
      for (const child of col.children) {
        const childCol = processColumn(child);
        if (childCol) childColumns.push(childCol);
      }
      if (childColumns.length > 0) {
        exportCol.children = childColumns;
      }
    }

    // Handle custom render function
    if (col.render && typeof col.render === 'function') {
      exportCol.render = (row: any, index: number) => {
        try {
          const result = col.render(row, index);
          // Extract text content if it's a VNode
          if (result && typeof result === 'object' && result.children) {
            return String(result.children);
          }
          return String(result);
        } catch {
          return row[col.key] || '';
        }
      };
    }

    return exportCol;
  };

  for (const col of naiveColumns) {
    const exportCol = processColumn(col);
    if (exportCol) result.push(exportCol);
  }

  return result;
}

/**
 * Format cell value based on column format
 */
function formatCellValue(
  value: any,
  column: ExportColumn,
  options: ExportOptions,
): number | string {
  if (value === null || value === undefined || value === '') return '';

  // Use custom render if provided
  if (column.render) {
    return column.render({ [column.key]: value }, 0);
  }

  // Auto formatting based on format type
  switch (column.format) {
    case 'currency': {
      const currencyDecimals = column.decimals ?? 2;
      const symbol = options.currencySymbol || '';
      return `${symbol}${Number(value).toFixed(currencyDecimals)}`;
    }

    case 'date': {
      return new Date(value).toLocaleDateString('zh-CN');
    }

    case 'datetime': {
      return new Date(value).toLocaleString('zh-CN');
    }

    case 'number': {
      const decimals = column.decimals ?? 0;
      return Number(value).toFixed(decimals);
    }

    case 'percentage': {
      const percentDecimals = column.decimals ?? 2;
      return `${(Number(value) * 100).toFixed(percentDecimals)}%`;
    }

    default: {
      return value;
    }
  }
}

/**
 * Flatten nested columns structure
 */
function flattenColumns(columns: ExportColumn[]): ExportColumn[] {
  const result: ExportColumn[] = [];

  const flatten = (cols: ExportColumn[], prefix: string = '') => {
    for (const col of cols) {
      if (col.children && col.children.length > 0) {
        // For parent columns, we recurse into children
        flatten(col.children, prefix ? `${prefix} - ${col.title}` : col.title);
      } else {
        // Leaf column - add to result with full path as title
        result.push({
          ...col,
          title: prefix ? `${prefix} - ${col.title}` : col.title,
        });
      }
    }
  };

  flatten(columns);
  return result;
}

/**
 * Extract cell value from row using column key (supports nested keys like 'user.name')
 */
function extractValue(row: any, key: string): any {
  if (!key) return '';

  // Support nested keys like 'user.name'
  const keys = key.split('.');
  let value = row;

  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return '';
    }
  }

  return value;
}

/**
 * Main export function - exports grid data to Excel/CSV/JSON
 *
 * @param columns - Array of column definitions (can be Naive UI columns or ExportColumns)
 * @param data - Array of data rows
 * @param options - Export options (filename, format, etc.)
 *
 * @example
 * // Simple usage with Naive UI columns
 * exportGridData(tableColumns, tableData, { filename: 'my-report' });
 *
 * // With custom columns
 * exportGridData([
 *   { key: 'id', title: 'ID' },
 *   { key: 'name', title: '姓名' },
 *   { key: 'amount', title: '金额', format: 'currency', decimals: 2 }
 * ], data, { filename: 'users' });
 */
export async function exportGridData(
  columns: DataTableColumns<any> | ExportColumn[],
  data: any[],
  options: ExportOptions = {},
): Promise<void> {
  const message = useMessage();

  // Validate inputs
  if (!data || data.length === 0) {
    message.warning('没有数据可导出');
    return;
  }

  if (!columns || columns.length === 0) {
    message.warning('没有列定义');
    return;
  }

  try {
    // Convert Naive UI columns if needed
    const exportColumns = isNaiveUIColumns(columns)
      ? convertNaiveColumnsToExportColumns(columns as DataTableColumns<any>)
      : (columns as ExportColumn[]);

    // Flatten nested columns
    const flatColumns = flattenColumns(exportColumns);

    // Set defaults
    const format = options.format || 'xlsx';
    const filename = options.filename || `export-${Date.now()}`;
    const sheetName = options.sheetName || 'Sheet1';
    const includeHeaders = options.includeHeaders !== false;

    // Prepare data rows
    const exportData = data.map((row, rowIndex) => {
      const exportRow: any = {};

      for (const col of flatColumns) {
        const rawValue = extractValue(row, col.key);
        const formattedValue = formatCellValue(rawValue, col, options);
        exportRow[col.title] = formattedValue;
      }

      return exportRow;
    });

    // Export based on format
    switch (format) {
      case 'csv': {
        exportToCSV(exportData, filename);

        break;
      }
      case 'json': {
        exportToJSON(exportData, filename);

        break;
      }
      case 'xlsx': {
        await exportToExcel(exportData, filename, sheetName);

        break;
      }
      // No default
    }

    message.success(`导出成功！共 ${data.length} 条记录`);
  } catch (error) {
    console.error('Export error:', error);
    message.error(
      `导出失败: ${error instanceof Error ? error.message : '未知错误'}`,
    );
  }
}

/**
 * Check if columns are Naive UI columns
 */
function isNaiveUIColumns(columns: any): boolean {
  // Naive UI columns usually have specific properties like 'render', 'sorter', etc.
  return Array.isArray(columns) && columns.length > 0;
}

/**
 * Export to Excel (XLSX)
 */
async function exportToExcel(
  data: any[],
  filename: string,
  sheetName: string,
): Promise<void> {
  // Dynamically import xlsx to reduce bundle size
  const XLSX = await import('xlsx');

  // Create worksheet from data
  const ws = XLSX.utils.json_to_sheet(data);

  // Auto-size columns (optional - makes it look better)
  const colWidths = Object.keys(data[0] || {}).map((key) => ({
    wch:
      Math.max(
        key.length,
        ...data.map((row) => String(row[key] || '').length),
      ) + 2,
  }));
  ws['!cols'] = colWidths;

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Write file
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Export to CSV
 */
function exportToCSV(data: any[], filename: string): void {
  if (data.length === 0) return;

  // Get headers
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape values containing commas or quotes
          const stringValue = String(value || '');
          if (
            stringValue.includes(',') ||
            stringValue.includes('"') ||
            stringValue.includes('\n')
          ) {
            return `"${stringValue.replaceAll('"', '""')}"`;
          }
          return stringValue;
        })
        .join(','),
    ),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([`\uFEFF${csvContent}`], {
    type: 'text/csv;charset=utf-8;',
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Export to JSON
 */
function exportToJSON(data: any[], filename: string): void {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Quick export function for Naive UI tables
 * Automatically uses the table's columns and data
 *
 * @example
 * <n-button @click="quickExport(columns, data, 'my-report')">导出</n-button>
 */
export function quickExport(
  columns: DataTableColumns<any>,
  data: any[],
  filename: string,
): Promise<void> {
  return exportGridData(columns, data, { filename });
}

/**
 * Export with custom column mapping
 * Useful when you want to export specific columns with custom titles
 *
 * @example
 * exportWithMapping(data, {
 *   'id': '用户ID',
 *   'name': '姓名',
 *   'amount': '金额'
 * }, 'users');
 */
export async function exportWithMapping(
  data: any[],
  columnMapping: Record<string, string>,
  filename: string,
  options: ExportOptions = {},
): Promise<void> {
  const columns: ExportColumn[] = Object.entries(columnMapping).map(
    ([key, title]) => ({
      key,
      title,
    }),
  );

  return exportGridData(columns, data, { ...options, filename });
}
