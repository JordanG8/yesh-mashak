/**
 * Route להיסטוריה
 * GET /api/history
 */

const express = require('express');
const { query, validationResult } = require('express-validator');
const router = express.Router();

const slotService = require('../services/slotService');
const { isValidHoursParam } = require('../utils/validators');

/**
 * GET /api/history
 * מחזיר היסטוריה של תקופות קודמות
 *
 * Query Parameters:
 *   hours: number (default: 24, max: 168)
 *
 * Response (200):
 * {
 *   success: true,
 *   data: [
 *     {
 *       slot_time: string (ISO),
 *       slot_end: string (ISO),
 *       has_mashak_votes: number,
 *       no_mashak_votes: number,
 *       total_votes: number,
 *       has_mashak_percentage: number,
 *       no_mashak_percentage: number,
 *       result: 'yes' | 'no' | 'tie' | null,
 *       is_current: boolean
 *     }
 *   ],
 *   meta: {
 *     total_slots: number,
 *     hours: number
 *   }
 * }
 */
router.get('/',
  // וולידציה של פרמטר hours
  query('hours')
    .optional()
    .isInt({ min: 1, max: 168 }).withMessage('מספר שעות חייב להיות בין 1 ל-168'),

  async (req, res, next) => {
    try {
      // בדיקת שגיאות וולידציה
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: errors.array()[0].msg,
          code: 'VALIDATION_ERROR',
        });
      }

      const hours = parseInt(req.query.hours, 10) || 24;

      const historyData = await slotService.getHistoryData(hours);

      res.json({
        success: true,
        ...historyData,
      });

    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/history/stats
 * מחזיר סטטיסטיקות כלליות (אופציונלי)
 */
router.get('/stats',
  query('hours')
    .optional()
    .isInt({ min: 1, max: 168 }).withMessage('מספר שעות חייב להיות בין 1 ל-168'),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: errors.array()[0].msg,
          code: 'VALIDATION_ERROR',
        });
      }

      const hours = parseInt(req.query.hours, 10) || 24;
      const stats = await slotService.getStats(hours);

      res.json({
        success: true,
        data: stats,
      });

    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
