/**
 * Middleware להגבלת קצב בקשות (Rate Limiting)
 * מונע התקפות ושימוש לרעה
 */

const rateLimit = require('express-rate-limit');
const config = require('../config/config');

/**
 * Rate limiter כללי לכל ה-API
 * מגביל לפי כתובת IP
 */
const rateLimiter = rateLimit({
  // חלון זמן (ברירת מחדל: 15 דקות)
  windowMs: config.rateLimit.windowMs,

  // מספר בקשות מקסימלי בחלון הזמן
  max: config.rateLimit.maxRequests,

  // הודעת שגיאה בעברית
  message: {
    success: false,
    message: 'יותר מדי בקשות, נסה שוב מאוחר יותר',
    code: 'RATE_LIMIT_EXCEEDED',
  },

  // כותרות תקניות
  standardHeaders: true,
  legacyHeaders: false,

  // זיהוי IP דרך פרוקסי
  keyGenerator: (req) => {
    return req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  },

  // handler מותאם אישית
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  },
});

/**
 * Rate limiter מחמיר יותר להצבעות
 * מגביל ל-10 בקשות הצבעה לדקה
 */
const voteRateLimiter = rateLimit({
  windowMs: 60 * 1000, // דקה אחת
  max: 10, // מקסימום 10 הצבעות לדקה
  message: {
    success: false,
    message: 'יותר מדי נסיונות הצבעה, נסה שוב בעוד דקה',
    code: 'VOTE_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  rateLimiter,
  voteRateLimiter,
};
