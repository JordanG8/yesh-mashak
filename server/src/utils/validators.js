/**
 * פונקציות validation לבדיקת קלטים
 */

/**
 * בודק האם ערך ההצבעה תקין
 * @param {string} vote - ערך ההצבעה
 * @returns {boolean}
 */
function isValidVote(vote) {
  return vote === 'yes' || vote === 'no';
}

/**
 * בודק האם מספר שעות תקין להיסטוריה
 * @param {number} hours
 * @returns {boolean}
 */
function isValidHoursParam(hours) {
  const num = parseInt(hours, 10);
  return !isNaN(num) && num > 0 && num <= 168; // מקסימום שבוע
}

/**
 * מנקה ומוודא קלט מחרוזת
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
function sanitizeString(str, maxLength = 255) {
  if (!str || typeof str !== 'string') return '';

  return str
    .trim()
    .substring(0, maxLength)
    .replace(/[<>]/g, ''); // הסרת תגי HTML בסיסיים
}

/**
 * מנקה User-Agent
 * @param {string} userAgent
 * @returns {string}
 */
function sanitizeUserAgent(userAgent) {
  return sanitizeString(userAgent, 255);
}

module.exports = {
  isValidVote,
  isValidHoursParam,
  sanitizeString,
  sanitizeUserAgent,
};
