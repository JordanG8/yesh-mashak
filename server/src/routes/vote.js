/**
 * Route להצבעה
 * POST /api/vote
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const voteService = require('../services/voteService');
const { validateIP } = require('../middleware/validateIP');
const { voteRateLimiter } = require('../middleware/rateLimiter');
const { isValidVote, sanitizeUserAgent } = require('../utils/validators');

/**
 * POST /api/vote
 * שולח הצבעה חדשה
 *
 * Body:
 *   vote: 'yes' | 'no'
 *
 * Response Success (200):
 *   { success: true, message: string, data: SlotData }
 *
 * Response Error (400):
 *   { success: false, message: string, data?: { next_slot: string } }
 */
router.post('/',
  // Rate limiting מחמיר להצבעות
  voteRateLimiter,

  // זיהוי IP
  validateIP,

  // וולידציה של הקלט
  body('vote')
    .exists().withMessage('חובה לציין הצבעה')
    .isIn(['yes', 'no']).withMessage('הצבעה חייבת להיות yes או no'),

  // Handler
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

      const { vote } = req.body;
      const ip = req.clientIP;
      const userAgent = sanitizeUserAgent(req.headers['user-agent']);

      // ביצוע ההצבעה
      const result = await voteService.submitVote(ip, vote, userAgent);

      res.json(result);

    } catch (error) {
      // טיפול בשגיאת "כבר הצביע"
      if (error.code === 'ALREADY_VOTED') {
        return res.status(400).json({
          success: false,
          message: error.message,
          code: error.code,
          data: error.data,
        });
      }

      next(error);
    }
  }
);

module.exports = router;
