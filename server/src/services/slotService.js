/**
 * שירות תקופות זמן - Business Logic
 * מנהל קבלת סטטוס נוכחי והיסטוריה
 */

const TimeSlot = require('../models/TimeSlot');
const Vote = require('../models/Vote');
const {
  getCurrentSlotDate,
  getSlotEndDate,
  getTimeRemainingSeconds,
  isCurrentSlot,
} = require('../utils/timeSlot');

const slotService = {
  /**
   * מחזיר את הסטטוס הנוכחי כולל מידע על המשתמש
   * @param {string} ip - כתובת IP של המשתמש
   * @returns {Promise<Object>}
   */
  async getCurrentStatus(ip) {
    // קבלת נתוני התקופה הנוכחית
    const currentSlot = await TimeSlot.getCurrent();

    // בדיקת הצבעת המשתמש
    const currentSlotTime = getCurrentSlotDate();
    const userVote = await Vote.getUserVote(currentSlotTime, ip);

    return {
      ...currentSlot,
      user_voted: userVote !== null,
      user_vote: userVote,
      time_remaining_seconds: getTimeRemainingSeconds(),
    };
  },

  /**
   * מחזיר היסטוריה של תקופות
   * @param {number} hours - מספר שעות אחורה
   * @returns {Promise<Object>}
   */
  async getHistoryData(hours = 24) {
    const history = await TimeSlot.getHistory(hours);

    // הוספת שדות נוספים לכל תקופה
    const enrichedHistory = history.map((slot) => {
      const isCurrent = isCurrentSlot(new Date(slot.slot_time));

      // קביעת התוצאה (מי ניצח)
      let result = null;
      if (slot.total_votes > 0) {
        if (slot.has_mashak_votes > slot.no_mashak_votes) {
          result = 'yes';
        } else if (slot.no_mashak_votes > slot.has_mashak_votes) {
          result = 'no';
        } else {
          result = 'tie'; // תיקו
        }
      }

      return {
        ...slot,
        result,
        is_current: isCurrent,
      };
    });

    return {
      data: enrichedHistory,
      meta: {
        total_slots: enrichedHistory.length,
        hours,
      },
    };
  },

  /**
   * מחזיר סטטיסטיקות כלליות (אופציונלי)
   * @param {number} hours - מספר שעות
   * @returns {Promise<Object>}
   */
  async getStats(hours = 24) {
    const history = await TimeSlot.getHistory(hours);

    let totalVotes = 0;
    let totalYes = 0;
    let totalNo = 0;
    let yesWins = 0;
    let noWins = 0;
    let ties = 0;

    history.forEach((slot) => {
      totalVotes += slot.total_votes;
      totalYes += slot.has_mashak_votes;
      totalNo += slot.no_mashak_votes;

      if (slot.total_votes > 0) {
        if (slot.has_mashak_votes > slot.no_mashak_votes) {
          yesWins++;
        } else if (slot.no_mashak_votes > slot.has_mashak_votes) {
          noWins++;
        } else {
          ties++;
        }
      }
    });

    return {
      total_votes: totalVotes,
      total_yes_votes: totalYes,
      total_no_votes: totalNo,
      total_slots: history.length,
      yes_wins: yesWins,
      no_wins: noWins,
      ties,
      yes_win_percentage: history.length > 0
        ? Math.round((yesWins / history.length) * 100)
        : 0,
    };
  },
};

module.exports = slotService;
