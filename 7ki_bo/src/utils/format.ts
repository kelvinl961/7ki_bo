/**
 * Format currency value
 * @param value - The numeric value to format
 * @param currency - The currency code (default: 'BRL')
 * @returns Formatted currency string
 */
export function formatCurrency(value: number | string, currency: string = 'BRL'): string {
  if (value === null || value === undefined || value === '') {
    return '0.00';
  }
  
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numericValue)) {
    return '0.00';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericValue);
}

/**
 * Format datetime string
 * @param value - The datetime string or Date object
 * @param format - The format type ('datetime' | 'date' | 'time')
 * @returns Formatted datetime string
 */
export function formatDateTime(value: string | Date, format: 'datetime' | 'date' | 'time' = 'datetime'): string {
  if (!value) {
    return '无效日期';
  }
  
  let date: Date;
  try {
    date = typeof value === 'string' ? new Date(value) : value;
    
    if (isNaN(date.getTime())) {
      console.warn('Invalid date value:', value);
      return '无效日期';
    }
    
    // Additional check for obviously invalid dates
    if (date.getFullYear() < 1900 || date.getFullYear() > 2100) {
      console.warn('Date out of reasonable range:', value);
      return '无效日期';
    }
  } catch (error) {
    console.warn('Date parsing error:', value, error);
    return '无效日期';
  }
  
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Sao_Paulo'
  };
  
  switch (format) {
    case 'date':
      options.year = 'numeric';
      options.month = '2-digit';
      options.day = '2-digit';
      break;
    case 'time':
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.second = '2-digit';
      break;
    default:
      options.year = 'numeric';
      options.month = '2-digit';
      options.day = '2-digit';
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.second = '2-digit';
  }
  
  return new Intl.DateTimeFormat('pt-BR', options).format(date);
}

/**
 * Format date only
 * @param value - The datetime string or Date object
 * @returns Formatted date string
 */
export function formatDate(value: string | Date): string {
  return formatDateTime(value, 'date');
}

/**
 * Format time only
 * @param value - The datetime string or Date object
 * @returns Formatted time string
 */
export function formatTime(value: string | Date): string {
  return formatDateTime(value, 'time');
}

/**
 * Format number with thousands separator
 * @param value - The numeric value
 * @returns Formatted number string
 */
export function formatNumber(value: number | string): string {
  if (value === null || value === undefined || value === '') {
    return '0';
  }
  
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numericValue)) {
    return '0';
  }
  
  return new Intl.NumberFormat('pt-BR').format(numericValue);
}

/**
 * Format percentage
 * @param value - The numeric value (between 0 and 1 for decimal, or 0-100 for percentage)
 * @param decimals - Number of decimal places
 * @param isAlreadyPercentage - Whether the value is already in percentage format
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number | string, decimals: number = 2, isAlreadyPercentage: boolean = false): string {
  if (value === null || value === undefined || value === '') {
    return '0%';
  }
  
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numericValue)) {
    return '0%';
  }
  
  const percentage = isAlreadyPercentage ? numericValue : numericValue * 100;
  
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Format file size
 * @param bytes - The file size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format phone number (Brazilian format)
 * @param phone - The phone number string
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Brazilian phone number format
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
}

/**
 * Format CPF (Brazilian tax ID)
 * @param cpf - The CPF string
 * @returns Formatted CPF
 */
export function formatCPF(cpf: string): string {
  if (!cpf) return '';
  
  // Remove all non-numeric characters
  const cleaned = cpf.replace(/\D/g, '');
  
  // CPF format: 000.000.000-00
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  return cpf;
}

/**
 * Truncate text with ellipsis
 * @param text - The text to truncate
 * @param length - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, length: number = 50): string {
  if (!text) return '';
  
  if (text.length <= length) return text;
  
  return text.substring(0, length) + '...';
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param date - The date to format
 * @returns Relative time string
 */
export function formatRelativeTime(date: string | Date): string {
  if (!date) return '';
  
  const now = new Date();
  const target = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(target.getTime())) return '';
  
  const diffInMs = now.getTime() - target.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInSeconds < 60) {
    return '刚刚';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}分钟前`;
  } else if (diffInHours < 24) {
    return `${diffInHours}小时前`;
  } else if (diffInDays < 7) {
    return `${diffInDays}天前`;
  } else {
    return formatDate(target);
  }
}

/**
 * Format bank account number (mask middle digits)
 * @param accountNumber - The account number
 * @returns Masked account number
 */
export function formatAccountNumber(accountNumber: string): string {
  if (!accountNumber) return '';
  
  const cleaned = accountNumber.replace(/\D/g, '');
  
  if (cleaned.length <= 4) return accountNumber;
  
  const start = cleaned.substring(0, 2);
  const end = cleaned.substring(cleaned.length - 2);
  const middle = '*'.repeat(cleaned.length - 4);
  
  return start + middle + end;
}

/**
 * Format order status with proper styling
 * @param status - The status string
 * @returns Object with formatted text and color
 */
export function formatOrderStatus(status: string): { text: string; color: string; type: string } {
  const statusMap: Record<string, { text: string; color: string; type: string }> = {
    'pending': { text: '待处理', color: '#faad14', type: 'warning' },
    'processing': { text: '处理中', color: '#1890ff', type: 'info' },
    'completed': { text: '已完成', color: '#52c41a', type: 'success' },
    'cancelled': { text: '已取消', color: '#d9d9d9', type: 'default' },
    'failed': { text: '失败', color: '#ff4d4f', type: 'error' },
    'approved': { text: '已审核', color: '#52c41a', type: 'success' },
    'rejected': { text: '已拒绝', color: '#ff4d4f', type: 'error' },
    'locked': { text: '已锁定', color: '#fa8c16', type: 'warning' },
    'unlocked': { text: '未锁定', color: '#d9d9d9', type: 'default' }
  };
  
  return statusMap[status] || { text: status, color: '#d9d9d9', type: 'default' };
} 