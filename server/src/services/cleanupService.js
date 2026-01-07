/**
 * שירות ניקוי אוטומטי
 * מוחק נתונים ישנים מעל 24 שעות
 */

const Vote = require('../models/Vote');
const TimeSlot = require('../models/TimeSlot');
const config = require('../config/config');

let cleanupInterval = null;

const cleanupService = {
  /**
   * מבצע ניקוי של נתונים ישנים
   * @returns {Promise<Object>} סטטיסטיקות ניקוי
   */
  async cleanOldData() {
    const hours = config.timeSlot.historyHours; // 24 שעות

    console.log(`🧹 מתחיל ניקוי נתונים ישנים מעל ${hours} שעות...`);

    try {
      // מחיקת הצבעות ישנות
      const deletedVotes = await Vote.deleteOlderThan(hours);

      // מחיקת תקופות ישנות
      const deletedSlots = await TimeSlot.deleteOlderThan(hours);

      console.log(`✓ נמחקו ${deletedVotes} הצבעות ו-${deletedSlots} תקופות`);

      return {
        success: true,
        deleted_votes: deletedVotes,
        deleted_slots: deletedSlots,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      console.error('✗ שגיאה בניקוי נתונים:', error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * מפעיל את שירות הניקוי האוטומטי
   * רץ כל X שעות (מוגדר בקונפיגורציה)
   */
  startCleanupJob() {
    // תדירות ניקוי במילישניות
    const intervalMs = config.app.cleanupIntervalHours * 60 * 60 * 1000;

    console.log(`⏰ שירות ניקוי אוטומטי מופעל - כל ${config.app.cleanupIntervalHours} שעות`);

    // ניקוי ראשוני מיד עם ההפעלה
    this.cleanOldData();

    // הפעלת ניקוי תקופתי
    cleanupInterval = setInterval(() => {
      this.cleanOldData();
    }, intervalMs);

    return cleanupInterval;
  },

  /**
   * עוצר את שירות הניקוי האוטומטי
   */
  stopCleanupJob() {
    if (cleanupInterval) {
      clearInterval(cleanupInterval);
      cleanupInterval = null;
      console.log('⏹️ שירות ניקוי אוטומטי הופסק');
    }
  },

  /**
   * בודק האם שירות הניקוי פועל
   * @returns {boolean}
   */
  isRunning() {
    return cleanupInterval !== null;
  },
};

module.exports = cleanupService;
