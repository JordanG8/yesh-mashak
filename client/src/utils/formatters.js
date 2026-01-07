/**
 * פונקציות פורמט לתצוגה בעברית
 */

/**
 * מפרמט תאריך לתצוגה בעברית
 * @param {string|Date} date - תאריך
 * @param {boolean} includeDate - האם לכלול תאריך מלא
 * @returns {string}
 */
export function formatDateTime(date, includeDate = false) {
  if (!date) return ''

  const d = new Date(date)

  const timeOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }

  const dateOptions = {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }

  const timeStr = d.toLocaleTimeString('he-IL', timeOptions)

  if (includeDate) {
    const dateStr = d.toLocaleDateString('he-IL', dateOptions)
    return `${dateStr} ${timeStr}`
  }

  return timeStr
}

/**
 * מפרמט טווח זמן (מ-עד)
 * @param {string|Date} start
 * @param {string|Date} end
 * @returns {string}
 */
export function formatTimeRange(start, end) {
  if (!start || !end) return ''

  const startTime = formatDateTime(start)
  const endTime = formatDateTime(end)

  return `${startTime} - ${endTime}`
}

/**
 * מפרמט אחוז לתצוגה
 * @param {number} percentage
 * @param {number} decimals
 * @returns {string}
 */
export function formatPercentage(percentage, decimals = 1) {
  if (typeof percentage !== 'number' || isNaN(percentage)) return '0%'

  return `${percentage.toFixed(decimals)}%`
}

/**
 * מפרמט מספר לתצוגה עם פסיקים
 * @param {number} num
 * @returns {string}
 */
export function formatNumber(num) {
  if (typeof num !== 'number' || isNaN(num)) return '0'

  return num.toLocaleString('he-IL')
}

/**
 * מחזיר טקסט תוצאה בעברית
 * @param {'yes'|'no'|'tie'|null} result
 * @returns {string}
 */
export function formatResult(result) {
  switch (result) {
    case 'yes':
      return 'יש משק'
    case 'no':
      return 'אין משק'
    case 'tie':
      return 'תיקו'
    default:
      return 'אין נתונים'
  }
}

/**
 * מחזיר זמן יחסי (לפני X דקות)
 * @param {string|Date} date
 * @returns {string}
 */
export function formatRelativeTime(date) {
  if (!date) return ''

  const now = Date.now()
  const then = new Date(date).getTime()
  const diffMinutes = Math.floor((now - then) / 60000)

  if (diffMinutes < 1) return 'עכשיו'
  if (diffMinutes < 60) return `לפני ${diffMinutes} דקות`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `לפני ${diffHours} שעות`

  const diffDays = Math.floor(diffHours / 24)
  return `לפני ${diffDays} ימים`
}

export default {
  formatDateTime,
  formatTimeRange,
  formatPercentage,
  formatNumber,
  formatResult,
  formatRelativeTime,
}
