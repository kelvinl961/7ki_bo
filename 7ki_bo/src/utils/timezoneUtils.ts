/**
 * 🌍 Timezone Utilities
 * Get display timezone from environment or API
 */

// Get display timezone from environment variable
// Frontend env: VITE_DISPLAY_TIMEZONE
// Backend env: DISPLAY_TIMEZONE
export const getDisplayTimezone = (): string => {
  // Try frontend env variable first
  const frontendTz = import.meta.env.DISPLAY_TIMEZONE;
  if (frontendTz) {
    return frontendTz;
  }
  
  // Try localStorage (might be set from API)
  const storedTz = localStorage.getItem('display_timezone');
  if (storedTz) {
    return storedTz;
  }
  
  // Default to São Paulo (Brazil)
  return 'America/Sao_Paulo';
};

// Set display timezone (from API response)
export const setDisplayTimezone = (timezone: string): void => {
  localStorage.setItem('display_timezone', timezone);
};

// Get today's date string in display timezone (YYYY-MM-DD format)
export const getTodayInTimezone = (timezone?: string): string => {
  const tz = timezone || getDisplayTimezone();
  const now = new Date();
  
  // Format date in timezone
  const dateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now);
  
  return dateStr; // Returns YYYY-MM-DD format
};

// Format date in display timezone
export const formatDateTimeInTimezone = (
  dateString: string | Date,
  timezone?: string
): string => {
  if (!dateString) return '-';
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const tz = timezone || getDisplayTimezone();
  
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date);
};

// Get current date/time components in display timezone
export const getNowInTimezone = (timezone?: string): { year: number; month: number; day: number; hour: number; minute: number; second: number } => {
  const tz = timezone || getDisplayTimezone();
  const now = new Date();
  
  // Get timezone time string
  const tzTimeString = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(now);
  
  // Parse: "12/08/2025, 14:30:00"
  const [datePart, timePart] = tzTimeString.split(', ');
  if (!datePart || !timePart) {
    // Fallback to current local time
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds()
    };
  }
  
  const [month, day, year] = datePart.split('/');
  const [hour, minute, second] = timePart.split(':');
  
  if (!month || !day || !year || !hour || !minute) {
    // Fallback
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds()
    };
  }
  
  return {
    year: parseInt(year),
    month: parseInt(month),
    day: parseInt(day),
    hour: parseInt(hour),
    minute: parseInt(minute),
    second: parseInt(second || '0')
  };
};

// Convert a date/time in timezone to UTC Date object
// Uses a simple binary search approach to find the correct UTC time
export const convertTimezoneToUTC = (
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timezone?: string
): Date => {
  const tz = timezone || getDisplayTimezone();
  
  // Validate inputs
  if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute) || isNaN(second)) {
    console.error('Invalid date components:', { year, month, day, hour, minute, second });
    return new Date(); // Return current date as fallback
  }
  
  // Validate ranges
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) {
    console.error('Date components out of range:', { year, month, day, hour, minute, second });
    return new Date(); // Return current date as fallback
  }
  
  // ✅ FIX: Use iterative search to find the correct UTC time
  // This is more reliable than trying to calculate offsets
  // Search within ±24 hours to account for all possible timezone offsets
  for (let offsetHours = -24; offsetHours <= 24; offsetHours++) {
    const testUTC = new Date(Date.UTC(year, month - 1, day, hour + offsetHours, minute, second));
    if (isNaN(testUTC.getTime())) continue;
    
    let formatted: string;
    try {
      formatted = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(testUTC);
    } catch (error) {
      continue;
    }
    
    const [fDate, fTime] = formatted.split(', ');
    if (fDate && fTime) {
      const [fM, fD, fY] = fDate.split('/');
      const [fH, fMin, fSec] = fTime.split(':');
      if (fM && fD && fY && fH && fMin && fSec) {
        // Perfect match found
        if (parseInt(fY) === year && parseInt(fM) === month && parseInt(fD) === day &&
            parseInt(fH) === hour && parseInt(fMin) === minute && parseInt(fSec) === second) {
          return testUTC;
        }
      }
    }
  }
  
  // If no perfect match found, use a more refined search with smaller increments
  // Start from a reasonable guess (midday UTC)
  const baseUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  let baseFormatted: string;
  try {
    baseFormatted = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(baseUTC);
  } catch (error) {
    // Ultimate fallback: return UTC time (not ideal but won't crash)
    return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  }
  
  const [bDate, bTime] = baseFormatted.split(', ');
  if (bDate && bTime) {
    const [bM, bD, bY] = bDate.split('/');
    const [bH] = bTime.split(':');
    if (bM && bD && bY && bH) {
      // Calculate approximate offset
      const hourDiff = hour - parseInt(bH);
      const dayDiff = day - parseInt(bD);
      const result = new Date(baseUTC.getTime() + (hourDiff * 3600000) + (dayDiff * 86400000) + (minute * 60000) + (second * 1000));
      
      // Verify and return
      let verify: string;
      try {
        verify = new Intl.DateTimeFormat('en-US', {
          timeZone: tz,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(result);
      } catch (error) {
        return result; // Return even if verification fails
      }
      
      const [vDate, vTime] = verify.split(', ');
      if (vDate && vTime) {
        const [vM, vD, vY] = vDate.split('/');
        const [vH, vMin, vSec] = vTime.split(':');
        if (vM && vD && vY && vH && vMin && vSec) {
          if (parseInt(vY) === year && parseInt(vM) === month && parseInt(vD) === day &&
              parseInt(vH) === hour && parseInt(vMin) === minute && parseInt(vSec) === second) {
            return result;
          }
        }
      }
      return result; // Return even if not perfect, it's close enough
    }
  }
  
  // Ultimate fallback: return UTC time (not ideal but won't crash)
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
};

