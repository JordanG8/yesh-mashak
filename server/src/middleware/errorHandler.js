/**
 * Middleware לטיפול בשגיאות גלובלי
 * תופס את כל השגיאות ומחזיר תגובה אחידה
 */

const config = require('../config/config');

/**
 * Middleware לטיפול בשגיאות
 * @param {Error} err - אובייקט השגיאה
 * @param {Request} req - בקשה
 * @param {Response} res - תגובה
 * @param {Function} next - פונקציית המשך
 */
function errorHandler(err, req, res, next) {
  // ברירת מחדל - שגיאת שרת פנימית
  let statusCode = err.statusCode || 500;
  let message = err.message || 'שגיאה פנימית בשרת';
  let code = err.code || 'INTERNAL_ERROR';

  // טיפול בסוגי שגיאות ספציפיים
  if (err.code === 'ALREADY_VOTED') {
    statusCode = 400;
  } else if (err.code === 'INVALID_INPUT') {
    statusCode = 400;
  } else if (err.code === 'NOT_FOUND') {
    statusCode = 404;
  } else if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 400;
    message = 'כבר קיים רשומה זהה';
    code = 'DUPLICATE_ENTRY';
  } else if (err.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'בסיס הנתונים לא זמין';
    code = 'DATABASE_UNAVAILABLE';
  }

  // לוג בפיתוח
  if (config.server.nodeEnv === 'development') {
    console.error('שגיאה:', {
      code,
      message,
      stack: err.stack,
    });
  } else {
    // לוג מינימלי בפרודקשן
    console.error(`[ERROR] ${code}: ${message}`);
  }

  // בניית תגובת השגיאה
  const errorResponse = {
    success: false,
    message,
    code,
  };

  // הוספת מידע נוסף אם קיים
  if (err.data) {
    errorResponse.data = err.data;
  }

  // הוספת stack trace רק בפיתוח
  if (config.server.nodeEnv === 'development' && err.stack) {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
}

/**
 * יוצר אובייקט שגיאה מותאם
 * @param {string} message - הודעת השגיאה
 * @param {number} statusCode - קוד HTTP
 * @param {string} code - קוד שגיאה פנימי
 * @param {Object} data - מידע נוסף
 * @returns {Error}
 */
function createError(message, statusCode = 500, code = 'ERROR', data = null) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  if (data) error.data = data;
  return error;
}

module.exports = {
  errorHandler,
  createError,
};
