/**
 * Device ID Generator
 * Generates a unique device identifier based on browser fingerprinting
 * Used for tracking user devices across sessions
 */

/**
 * Generate a unique device ID based on browser characteristics
 * This creates a semi-persistent identifier that remains consistent across sessions
 */
export function generateDeviceId(): string {
  // Check if device ID already exists in localStorage
  const existingDeviceId = localStorage.getItem('deviceId');
  if (existingDeviceId) {
    return existingDeviceId;
  }

  // Generate new device ID based on browser fingerprint
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset(),
    `${screen.width}x${screen.height}`,
    screen.colorDepth,
    navigator.platform,
    navigator.hardwareConcurrency || 0,
    navigator.deviceMemory || 0,
  ].join('_');

  // Create hash-like ID from fingerprint
  const deviceId = `dev_${hashString(fingerprint)}_${Date.now().toString(36)}`;

  // Store in localStorage for persistence
  localStorage.setItem('deviceId', deviceId);

  return deviceId;
}

/**
 * Get the current device ID (generates if doesn't exist)
 */
export function getDeviceId(): string {
  return generateDeviceId();
}

/**
 * Clear the stored device ID
 */
export function clearDeviceId(): void {
  localStorage.removeItem('deviceId');
}

/**
 * Simple string hash function
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Convert to base36 and create readable format
  const hashStr = Math.abs(hash).toString(36);
  const randomPart = Math.random().toString(36).slice(2, 10);

  return `${randomPart}_${hashStr}`;
}

/**
 * Get detailed device information
 */
export function getDeviceInfo() {
  return {
    deviceId: getDeviceId(),
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
  };
}
