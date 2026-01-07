/**
 * נקודת הכניסה לשרת
 * מפעיל את האפליקציה ושירותים נלווים
 */

const app = require('./app');
const config = require('./config/config');
const { testConnection } = require('./config/database');
const { startCleanupJob } = require('./services/cleanupService');

// טיפול בשגיאות לא מטופלות
process.on('uncaughtException', (error) => {
  console.error('שגיאה לא מטופלת:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('הבטחה נדחתה ללא טיפול:', reason);
});

/**
 * הפעלת השרת
 */
async function startServer() {
  console.log('');
  console.log('='.repeat(50));
  console.log('          🔄 מפעיל את שרת "יש משק?"');
  console.log('='.repeat(50));
  console.log('');

  // בדיקת חיבור לבסיס נתונים
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('לא ניתן להפעיל את השרת ללא חיבור לבסיס נתונים');
    process.exit(1);
  }

  // הפעלת שירות ניקוי אוטומטי
  startCleanupJob();

  // הפעלת השרת
  const server = app.listen(config.server.port, config.server.host, () => {
    console.log('');
    console.log(`✓ השרת פועל בכתובת: http://${config.server.host}:${config.server.port}`);
    console.log(`✓ סביבה: ${config.server.nodeEnv}`);
    console.log(`✓ CORS מאופשר מ: ${config.app.corsOrigin}`);
    console.log('');
    console.log('='.repeat(50));
    console.log('          ✅ השרת מוכן לקבלת בקשות!');
    console.log('='.repeat(50));
    console.log('');
  });

  // Graceful shutdown
  const gracefulShutdown = (signal) => {
    console.log(`\n${signal} התקבל. מכבה את השרת...`);
    server.close(async () => {
      const { closePool } = require('./config/database');
      await closePool();
      console.log('השרת נסגר בהצלחה');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

// הפעלת השרת
startServer();
