/**
 * חיבור לבסיס נתונים MySQL
 * משתמש ב-Connection Pool לביצועים טובים יותר
 */

const mysql = require('mysql2/promise');
const config = require('./config');

// יצירת Pool של חיבורים
const pool = mysql.createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  connectionLimit: config.database.connectionLimit,
  // הגדרות נוספות
  waitForConnections: true,
  queueLimit: 0,
  // תמיכה בעברית
  charset: 'utf8mb4',
  // timezone
  timezone: '+00:00',
  // החזרת תאריכים כאובייקטים
  dateStrings: false,
});

/**
 * בדיקת חיבור לבסיס הנתונים
 * @returns {Promise<boolean>}
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✓ התחברות לבסיס הנתונים הצליחה');
    connection.release();
    return true;
  } catch (error) {
    console.error('✗ שגיאה בהתחברות לבסיס הנתונים:', error.message);
    return false;
  }
}

/**
 * ביצוע שאילתה עם prepared statement
 * @param {string} sql - שאילתת SQL
 * @param {Array} params - פרמטרים לשאילתה
 * @returns {Promise<Array>}
 */
async function query(sql, params = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('שגיאה בביצוע שאילתה:', error.message);
    throw error;
  }
}

/**
 * קבלת חיבור לטרנזקציה
 * @returns {Promise<Connection>}
 */
async function getConnection() {
  return await pool.getConnection();
}

/**
 * סגירת ה-Pool (בסיום האפליקציה)
 */
async function closePool() {
  await pool.end();
  console.log('✓ חיבורי בסיס הנתונים נסגרו');
}

module.exports = {
  pool,
  query,
  getConnection,
  testConnection,
  closePool,
};
