/**
 * שירות הצבעות - Business Logic
 * מנהל את תהליך ההצבעה והבדיקות הנדרשות
 */

const { getConnection } = require('../config/database');
const Vote = require('../models/Vote');
const TimeSlot = require('../models/TimeSlot');
const { getCurrentSlotDate, getNextSlotDate, formatForMySQL } = require('../utils/timeSlot');

const voteService = {
  /**
   * מבצע הצבעה חדשה
   * @param {string} ip - כתובת IP של המצביע
   * @param {'yes'|'no'} voteValue - סוג ההצבעה
   * @param {string} userAgent - User Agent
   * @returns {Promise<Object>} תוצאת ההצבעה
   * @throws {Error} אם המשתמש כבר הצביע
   */
  async submitVote(ip, voteValue, userAgent) {
    const currentSlotTime = getCurrentSlotDate();

    // בדיקה אם המשתמש כבר הצביע בתקופה זו
    const hasVoted = await Vote.hasVoted(currentSlotTime, ip);
    if (hasVoted) {
      const nextSlot = getNextSlotDate();
      const error = new Error('כבר הצבעת בתקופה זו');
      error.code = 'ALREADY_VOTED';
      error.data = { next_slot: nextSlot.toISOString() };
      throw error;
    }

    // ביצוע ההצבעה בטרנזקציה
    const connection = await getConnection();
    try {
      await connection.beginTransaction();

      // וידוא שהתקופה קיימת
      const formattedTime = formatForMySQL(currentSlotTime);
      await connection.execute(`
        INSERT INTO time_slots (slot_time, has_mashak_votes, no_mashak_votes, total_votes)
        VALUES (?, 0, 0, 0)
        ON DUPLICATE KEY UPDATE id = id
      `, [formattedTime]);

      // הוספת ההצבעה
      await connection.execute(`
        INSERT INTO votes (slot_time, ip_address, vote, user_agent)
        VALUES (?, ?, ?, ?)
      `, [formattedTime, ip, voteValue, userAgent || null]);

      // עדכון הספירה בתקופה
      const column = voteValue === 'yes' ? 'has_mashak_votes' : 'no_mashak_votes';
      await connection.execute(`
        UPDATE time_slots
        SET ${column} = ${column} + 1,
            total_votes = total_votes + 1
        WHERE slot_time = ?
      `, [formattedTime]);

      await connection.commit();

      // החזרת הנתונים המעודכנים
      const updatedSlot = await TimeSlot.getCurrent();
      return {
        success: true,
        message: 'ההצבעה נקלטה בהצלחה',
        data: updatedSlot,
      };

    } catch (error) {
      await connection.rollback();

      // בדיקה אם זו שגיאת כפילות (המשתמש הצביע בין הבדיקה להצבעה)
      if (error.code === 'ER_DUP_ENTRY') {
        const nextSlot = getNextSlotDate();
        const dupError = new Error('כבר הצבעת בתקופה זו');
        dupError.code = 'ALREADY_VOTED';
        dupError.data = { next_slot: nextSlot.toISOString() };
        throw dupError;
      }

      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * בודק אם משתמש יכול להצביע (לא הצביע עדיין)
   * @param {string} ip - כתובת IP
   * @returns {Promise<boolean>}
   */
  async canVote(ip) {
    const currentSlotTime = getCurrentSlotDate();
    const hasVoted = await Vote.hasVoted(currentSlotTime, ip);
    return !hasVoted;
  },

  /**
   * מחזיר את ההצבעה של משתמש בתקופה הנוכחית
   * @param {string} ip - כתובת IP
   * @returns {Promise<string|null>}
   */
  async getUserCurrentVote(ip) {
    const currentSlotTime = getCurrentSlotDate();
    return await Vote.getUserVote(currentSlotTime, ip);
  },
};

module.exports = voteService;
