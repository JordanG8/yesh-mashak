/**
 * Middleware לוולידציה של כתובת IP
 */

const { getClientIP, isValidIP } = require('../utils/ipUtils');
const { createError } = require('./errorHandler');

/**
 * Middleware שמחלץ ומוודא את כתובת ה-IP
 * מוסיף את ה-IP לאובייקט הבקשה
 */
function validateIP(req, res, next) {
  // חילוץ IP
  const clientIP = getClientIP(req);

  // בדיקת תקינות
  if (!clientIP || clientIP === 'unknown') {
    return next(createError(
      'לא ניתן לזהות את כתובת ה-IP שלך',
      400,
      'INVALID_IP'
    ));
  }

  // שמירת ה-IP בבקשה לשימוש בהמשך
  req.clientIP = clientIP;

  next();
}

module.exports = {
  validateIP,
};
