/**
 * הגדרת אפליקציית Express
 * כולל middleware, routes, ו-error handling
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const config = require('./config/config');

// Middleware מותאמים אישית
const { errorHandler } = require('./middleware/errorHandler');
const { rateLimiter } = require('./middleware/rateLimiter');

// Routes
const voteRoutes = require('./routes/vote');
const currentRoutes = require('./routes/current');
const historyRoutes = require('./routes/history');

// יצירת אפליקציית Express
const app = express();

// =====================================================
// Security Middleware
// =====================================================

// Helmet - הגנות אבטחה בסיסיות
app.use(helmet({
  contentSecurityPolicy: false, // מבוטל כדי לאפשר לקליינט לעבוד
}));

// CORS - הגדרת גישה מדומיינים מורשים
app.use(cors({
  origin: config.app.corsOrigin.split(',').map(s => s.trim()),
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}));

// =====================================================
// General Middleware
// =====================================================

// דחיסת תגובות
app.use(compression());

// פרסור JSON
app.use(express.json({ limit: '10kb' }));

// פרסור URL encoded
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Trust proxy (חשוב להוסטינגר וקבלת IP אמיתי)
app.set('trust proxy', true);

// Rate Limiting על כל הבקשות
app.use('/api/', rateLimiter);

// =====================================================
// API Routes
// =====================================================

app.use('/api/vote', voteRoutes);
app.use('/api/current', currentRoutes);
app.use('/api/history', historyRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'השרת פועל',
    timestamp: new Date().toISOString(),
    environment: config.server.nodeEnv,
  });
});

// =====================================================
// Static Files (Production)
// =====================================================

if (config.server.nodeEnv === 'production') {
  // הגשת קבצי React build
  app.use(express.static(path.join(__dirname, '../../client/dist')));

  // כל נתיב שלא נמצא - החזרת index.html (SPA)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

// =====================================================
// Error Handling
// =====================================================

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'הנתיב לא נמצא',
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
