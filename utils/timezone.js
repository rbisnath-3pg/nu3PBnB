// Timezone utility functions for Toronto EST
const TORONTO_TIMEZONE = 'America/Toronto';

/**
 * Get current time in Toronto EST
 * @returns {Date} Current date/time in Toronto EST
 */
const getTorontoTime = () => {
  return new Date(new Date().toLocaleString('en-US', { timeZone: TORONTO_TIMEZONE }));
};

/**
 * Format date to Toronto EST string
 * @param {Date} date - Date to format (defaults to current time)
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string in Toronto EST
 */
const formatTorontoTime = (date = new Date(), options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
    ...options
  };
  
  return new Date(date).toLocaleString('en-US', {
    timeZone: TORONTO_TIMEZONE,
    ...defaultOptions
  });
};

/**
 * Convert UTC date to Toronto EST
 * @param {Date} utcDate - UTC date to convert
 * @returns {Date} Date in Toronto EST
 */
const utcToToronto = (utcDate) => {
  return new Date(utcDate.toLocaleString('en-US', { timeZone: TORONTO_TIMEZONE }));
};

/**
 * Convert Toronto EST date to UTC
 * @param {Date} torontoDate - Toronto EST date to convert
 * @returns {Date} Date in UTC
 */
const torontoToUtc = (torontoDate) => {
  const torontoTime = new Date(torontoDate.toLocaleString('en-US', { timeZone: TORONTO_TIMEZONE }));
  const utcTime = new Date(torontoTime.getTime() + (torontoTime.getTimezoneOffset() * 60000));
  return utcTime;
};

/**
 * Get Toronto timezone offset in minutes
 * @returns {number} Timezone offset in minutes
 */
const getTorontoOffset = () => {
  const now = new Date();
  const torontoTime = new Date(now.toLocaleString('en-US', { timeZone: TORONTO_TIMEZONE }));
  return torontoTime.getTimezoneOffset();
};

/**
 * Check if current time is in daylight saving time in Toronto
 * @returns {boolean} True if DST is active
 */
const isTorontoDST = () => {
  const jan = new Date(new Date().getFullYear(), 0, 1);
  const jul = new Date(new Date().getFullYear(), 6, 1);
  return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset()) !== new Date().getTimezoneOffset();
};

/**
 * Get timezone info for Toronto
 * @returns {Object} Timezone information
 */
const getTorontoTimezoneInfo = () => {
  return {
    timezone: TORONTO_TIMEZONE,
    currentTime: getTorontoTime(),
    formattedTime: formatTorontoTime(),
    offset: getTorontoOffset(),
    isDST: isTorontoDST(),
    offsetString: `UTC${getTorontoOffset() > 0 ? '-' : '+'}${Math.abs(getTorontoOffset() / 60)}`
  };
};

module.exports = {
  TORONTO_TIMEZONE,
  getTorontoTime,
  formatTorontoTime,
  utcToToronto,
  torontoToUtc,
  getTorontoOffset,
  isTorontoDST,
  getTorontoTimezoneInfo
}; 