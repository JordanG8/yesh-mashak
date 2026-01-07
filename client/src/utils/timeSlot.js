/**
 * פונקציות עזר לניהול תקופות זמן בצד הלקוח
 */

const SLOT_DURATION_SECONDS = 600 // 10 דקות

/**
 * מחשב כמה שניות נותרו עד סוף התקופה
 * @param {string} slotEndISO - זמן סוף התקופה בפורמט ISO
 * @returns {number}
 */
export function calculateTimeRemaining(slotEndISO) {
  if (!slotEndISO) return 0

  const endTime = new Date(slotEndISO).getTime()
  const now = Date.now()
  const remaining = Math.floor((endTime - now) / 1000)

  return Math.max(0, remaining)
}

/**
 * מפרמט שניות לתצוגה MM:SS
 * @param {number} seconds
 * @returns {string}
 */
export function formatTimeRemaining(seconds) {
  if (seconds <= 0) return '00:00'

  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/**
 * בודק אם התקופה נגמרה
 * @param {string} slotEndISO
 * @returns {boolean}
 */
export function isSlotExpired(slotEndISO) {
  if (!slotEndISO) return true

  const endTime = new Date(slotEndISO).getTime()
  return Date.now() >= endTime
}

export default {
  calculateTimeRemaining,
  formatTimeRemaining,
  isSlotExpired,
  SLOT_DURATION_SECONDS,
}
