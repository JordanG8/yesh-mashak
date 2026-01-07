/**
 * Route לקבלת סטטוס נוכחי
 * GET /api/current
 */

const express = require('express');
const router = express.Router();

const slotService = require('../services/slotService');
const { validateIP } = require('../middleware/validateIP');

/**
 * GET /api/current
 * מחזיר את הסטטוס הנוכחי של התקופה הפעילה
 *
 * Response (200):
 * {
 *   success: true,
 *   data: {
 *     slot_time: string (ISO),
 *     slot_end: string (ISO),
 *     has_mashak_votes: number,
 *     no_mashak_votes: number,
 *     total_votes: number,
 *     has_mashak_percentage: number,
 *     no_mashak_percentage: number,
 *     user_voted: boolean,
 *     user_vote: 'yes' | 'no' | null,
 *     time_remaining_seconds: number
 *   }
 * }
 */
router.get('/',
  // זיהוי IP לבדיקה אם המשתמש הצביע
  validateIP,

  async (req, res, next) => {
    try {
      const ip = req.clientIP;
      const currentStatus = await slotService.getCurrentStatus(ip);

      res.json({
        success: true,
        data: currentStatus,
      });

    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
