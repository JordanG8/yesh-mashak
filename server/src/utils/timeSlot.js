/**
 * פונקציות עזר לניהול תקופות זמן (Time Slots)
 * כל תקופה היא 10 דקות (600 שניות)
 */

const config = require('../config/config');

// משך תקופה בשניות
const SLOT_DURATION = config.timeSlot.durationSeconds; // 600 שניות = 10 דקות
const SLOT_DURATION_MS = SLOT_DURATION * 1000;

/**
 * מחשב את ה-timestamp של תחילת התקופה הנוכחית
 * מעגל למטה לתחילת תקופת 10 דקות
 * @returns {number} Unix timestamp (בשניות)
 */
function getCurrentSlotTimestamp() {
  const nowSeconds = Math.floor(Date.now() / 1000);
  return Math.floor(nowSeconds / SLOT_DURATION) * SLOT_DURATION;
}

/**
 * מחזיר Date object של תחילת התקופה הנוכחית
 * @returns {Date}
 */
function getCurrentSlotDate() {
  return new Date(getCurrentSlotTimestamp() * 1000);
}

/**
 * מחשב את סוף התקופה (10 דקות אחרי ההתחלה)
 * @param {Date|number} slotTime - זמן תחילת התקופה
 * @returns {Date}
 */
function getSlotEndDate(slotTime) {
  const startMs = slotTime instanceof Date
    ? slotTime.getTime()
    : slotTime * 1000;
  return new Date(startMs + SLOT_DURATION_MS);
}

/**
 * מחשב כמה שניות נותרו עד סוף התקופה הנוכחית
 * @returns {number}
 */
function getTimeRemainingSeconds() {
  const now = Date.now();
  const slotStart = getCurrentSlotTimestamp() * 1000;
  const slotEnd = slotStart + SLOT_DURATION_MS;
  return Math.max(0, Math.floor((slotEnd - now) / 1000));
}

/**
 * מפרמט timestamp ל-MySQL DATETIME format
 * @param {Date|number} timestamp - זמן לפירמוט
 * @returns {string} YYYY-MM-DD HH:mm:ss
 */
function formatForMySQL(timestamp) {
  const date = timestamp instanceof Date
    ? timestamp
    : new Date(timestamp * 1000);

  const pad = (n) => String(n).padStart(2, '0');

  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ` +
         `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
}

/**
 * ממיר תאריך MySQL ל-Date object
 * @param {string} mysqlDate - תאריך בפורמט MySQL
 * @returns {Date}
 */
function parseFromMySQL(mysqlDate) {
  if (mysqlDate instanceof Date) return mysqlDate;
  // MySQL מחזיר תאריך בפורמט YYYY-MM-DD HH:mm:ss
  return new Date(mysqlDate + 'Z'); // מוסיף Z לציון UTC
}

/**
 * מחשב את התקופה הבאה
 * @returns {Date}
 */
function getNextSlotDate() {
  return new Date((getCurrentSlotTimestamp() + SLOT_DURATION) * 1000);
}

/**
 * בודק אם timestamp שייך לתקופה הנוכחית
 * @param {Date|number} timestamp
 * @returns {boolean}
 */
function isCurrentSlot(timestamp) {
  const tsSeconds = timestamp instanceof Date
    ? Math.floor(timestamp.getTime() / 1000)
    : timestamp;

  const currentSlotStart = getCurrentSlotTimestamp();
  const currentSlotEnd = currentSlotStart + SLOT_DURATION;

  return tsSeconds >= currentSlotStart && tsSeconds < currentSlotEnd;
}

module.exports = {
  SLOT_DURATION,
  SLOT_DURATION_MS,
  getCurrentSlotTimestamp,
  getCurrentSlotDate,
  getSlotEndDate,
  getTimeRemainingSeconds,
  formatForMySQL,
  parseFromMySQL,
  getNextSlotDate,
  isCurrentSlot,
};
