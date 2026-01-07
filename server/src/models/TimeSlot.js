/**
 * מודל TimeSlot - ניהול תקופות זמן
 * מאחסן סיכום הצבעות לכל תקופת 10 דקות
 */

const { query, getConnection } = require('../config/database');
const { formatForMySQL, getCurrentSlotDate, getSlotEndDate, parseFromMySQL } = require('../utils/timeSlot');
const config = require('../config/config');

const TimeSlot = {
  /**
   * מחזיר או יוצר תקופה לפי זמן
   * @param {Date} slotTime - זמן התקופה
   * @returns {Promise<Object>}
   */
  async getOrCreate(slotTime) {
    const formattedTime = formatForMySQL(slotTime);

    // ניסיון לקרוא תקופה קיימת
    const selectSql = `
      SELECT * FROM time_slots WHERE slot_time = ?
    `;
    let results = await query(selectSql, [formattedTime]);

    if (results.length > 0) {
      return this.formatSlotData(results[0]);
    }

    // יצירת תקופה חדשה
    const insertSql = `
      INSERT INTO time_slots (slot_time, has_mashak_votes, no_mashak_votes, total_votes)
      VALUES (?, 0, 0, 0)
      ON DUPLICATE KEY UPDATE id = id
    `;
    await query(insertSql, [formattedTime]);

    // קריאה חוזרת
    results = await query(selectSql, [formattedTime]);
    return this.formatSlotData(results[0]);
  },

  /**
   * מעדכן את ספירת ההצבעות בתקופה
   * @param {Date} slotTime - זמן התקופה
   * @param {'yes'|'no'} voteType - סוג ההצבעה
   * @returns {Promise<Object>} התקופה המעודכנת
   */
  async incrementVote(slotTime, voteType) {
    const formattedTime = formatForMySQL(slotTime);
    const column = voteType === 'yes' ? 'has_mashak_votes' : 'no_mashak_votes';

    const sql = `
      UPDATE time_slots
      SET ${column} = ${column} + 1,
          total_votes = total_votes + 1
      WHERE slot_time = ?
    `;

    await query(sql, [formattedTime]);

    // החזרת הנתונים המעודכנים
    const selectSql = `SELECT * FROM time_slots WHERE slot_time = ?`;
    const results = await query(selectSql, [formattedTime]);
    return this.formatSlotData(results[0]);
  },

  /**
   * מחזיר את התקופה הנוכחית עם כל הנתונים
   * @returns {Promise<Object>}
   */
  async getCurrent() {
    const currentSlotTime = getCurrentSlotDate();
    return await this.getOrCreate(currentSlotTime);
  },

  /**
   * מחזיר היסטוריה של תקופות
   * @param {number} hours - מספר שעות אחורה
   * @returns {Promise<Array>}
   */
  async getHistory(hours = 24) {
    const sql = `
      SELECT *
      FROM time_slots
      WHERE slot_time >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      ORDER BY slot_time DESC
    `;

    const results = await query(sql, [hours]);
    return results.map((row) => this.formatSlotData(row));
  },

  /**
   * מוחק תקופות ישנות מעל מספר שעות מסוים
   * @param {number} hours - מספר שעות
   * @returns {Promise<number>} מספר שורות שנמחקו
   */
  async deleteOlderThan(hours) {
    const sql = `
      DELETE FROM time_slots
      WHERE slot_time < DATE_SUB(NOW(), INTERVAL ? HOUR)
    `;

    const result = await query(sql, [hours]);
    return result.affectedRows;
  },

  /**
   * מפרמט נתוני תקופה לפורמט API
   * @param {Object} row - שורה מבסיס הנתונים
   * @returns {Object}
   */
  formatSlotData(row) {
    if (!row) {
      return {
        slot_time: null,
        slot_end: null,
        has_mashak_votes: 0,
        no_mashak_votes: 0,
        total_votes: 0,
        has_mashak_percentage: 0,
        no_mashak_percentage: 0,
      };
    }

    const slotTime = parseFromMySQL(row.slot_time);
    const slotEnd = getSlotEndDate(slotTime);
    const total = row.total_votes || 0;

    const hasPercentage = total > 0
      ? Math.round((row.has_mashak_votes / total) * 10000) / 100
      : 0;

    const noPercentage = total > 0
      ? Math.round((row.no_mashak_votes / total) * 10000) / 100
      : 0;

    return {
      slot_time: slotTime.toISOString(),
      slot_end: slotEnd.toISOString(),
      has_mashak_votes: row.has_mashak_votes || 0,
      no_mashak_votes: row.no_mashak_votes || 0,
      total_votes: total,
      has_mashak_percentage: hasPercentage,
      no_mashak_percentage: noPercentage,
    };
  },
};

module.exports = TimeSlot;
