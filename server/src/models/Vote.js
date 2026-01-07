/**
 * מודל Vote - ניהול הצבעות בודדות
 * מאחסן כל הצבעה עם IP למניעת כפילויות
 */

const { query } = require('../config/database');
const { formatForMySQL } = require('../utils/timeSlot');

const Vote = {
  /**
   * יוצר הצבעה חדשה
   * @param {Date} slotTime - זמן התקופה
   * @param {string} ip - כתובת IP
   * @param {string} vote - סוג ההצבעה (yes/no)
   * @param {string} userAgent - User Agent
   * @returns {Promise<number>} ID ההצבעה שנוצרה
   */
  async create(slotTime, ip, vote, userAgent) {
    const sql = `
      INSERT INTO votes (slot_time, ip_address, vote, user_agent)
      VALUES (?, ?, ?, ?)
    `;

    const result = await query(sql, [
      formatForMySQL(slotTime),
      ip,
      vote,
      userAgent || null,
    ]);

    return result.insertId;
  },

  /**
   * בודק האם IP כבר הצביע בתקופה מסוימת
   * @param {Date} slotTime - זמן התקופה
   * @param {string} ip - כתובת IP
   * @returns {Promise<boolean>}
   */
  async hasVoted(slotTime, ip) {
    const sql = `
      SELECT COUNT(*) as count
      FROM votes
      WHERE slot_time = ? AND ip_address = ?
    `;

    const results = await query(sql, [formatForMySQL(slotTime), ip]);
    return results[0].count > 0;
  },

  /**
   * מחזיר את ההצבעה של IP בתקופה מסוימת (אם קיימת)
   * @param {Date} slotTime - זמן התקופה
   * @param {string} ip - כתובת IP
   * @returns {Promise<string|null>} 'yes', 'no', או null
   */
  async getUserVote(slotTime, ip) {
    const sql = `
      SELECT vote
      FROM votes
      WHERE slot_time = ? AND ip_address = ?
      LIMIT 1
    `;

    const results = await query(sql, [formatForMySQL(slotTime), ip]);
    return results.length > 0 ? results[0].vote : null;
  },

  /**
   * מוחק הצבעות ישנות מעל מספר שעות מסוים
   * @param {number} hours - מספר שעות
   * @returns {Promise<number>} מספר שורות שנמחקו
   */
  async deleteOlderThan(hours) {
    const sql = `
      DELETE FROM votes
      WHERE voted_at < DATE_SUB(NOW(), INTERVAL ? HOUR)
    `;

    const result = await query(sql, [hours]);
    return result.affectedRows;
  },

  /**
   * מונה הצבעות לפי סוג בתקופה מסוימת
   * @param {Date} slotTime - זמן התקופה
   * @returns {Promise<{yes: number, no: number}>}
   */
  async countByType(slotTime) {
    const sql = `
      SELECT
        vote,
        COUNT(*) as count
      FROM votes
      WHERE slot_time = ?
      GROUP BY vote
    `;

    const results = await query(sql, [formatForMySQL(slotTime)]);

    const counts = { yes: 0, no: 0 };
    results.forEach((row) => {
      counts[row.vote] = row.count;
    });

    return counts;
  },
};

module.exports = Vote;
