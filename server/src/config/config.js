/**
 * קונפיגורציית האפליקציה
 * טוען משתני סביבה מקובץ .env
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const config = {
  // הגדרות שרת
  server: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,
    host: process.env.HOST || '0.0.0.0',
  },

  // הגדרות בסיס נתונים MySQL
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'yesh_mashak',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
  },

  // הגדרות אפליקציה
  app: {
    // רשימת origins מותרים ל-CORS
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    // תדירות ניקוי נתונים ישנים (בשעות)
    cleanupIntervalHours: parseInt(process.env.CLEANUP_INTERVAL_HOURS, 10) || 1,
  },

  // הגדרות Rate Limiting
  rateLimit: {
    // חלון זמן במילישניות (ברירת מחדל: 15 דקות)
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    // מספר בקשות מקסימלי לכל IP
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  // הגדרות זמן
  timeSlot: {
    // משך תקופה בשניות (10 דקות)
    durationSeconds: 600,
    // משך שמירת היסטוריה בשעות
    historyHours: 24,
  },
};

// בדיקת הגדרות קריטיות בפרודקשן
if (config.server.nodeEnv === 'production') {
  if (!process.env.DB_PASSWORD) {
    console.warn('אזהרה: לא הוגדרה סיסמת בסיס נתונים!');
  }
  if (config.app.corsOrigin === 'http://localhost:5173') {
    console.warn('אזהרה: CORS מוגדר לכתובת מקומית בפרודקשן!');
  }
}

module.exports = config;
