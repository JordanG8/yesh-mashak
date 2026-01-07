-- =====================================================
-- מאגר הנתונים למערכת "יש משק?"
-- Yesh Mashak Database Schema
-- =====================================================

-- יצירת בסיס הנתונים (אם לא קיים)
CREATE DATABASE IF NOT EXISTS yesh_mashak
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE yesh_mashak;

-- =====================================================
-- טבלת time_slots - תקופות זמן של 10 דקות
-- מאחסנת סיכום הצבעות לכל תקופה
-- =====================================================
CREATE TABLE IF NOT EXISTS time_slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    -- זמן תחילת התקופה (מעוגל ל-10 דקות)
    slot_time DATETIME NOT NULL,
    -- מספר הצבעות "יש משק"
    has_mashak_votes INT DEFAULT 0,
    -- מספר הצבעות "אין משק"
    no_mashak_votes INT DEFAULT 0,
    -- סה"כ הצבעות
    total_votes INT DEFAULT 0,
    -- timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- אינדקסים
    UNIQUE KEY unique_slot (slot_time),
    INDEX idx_slot_time (slot_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- טבלת votes - הצבעות בודדות
-- מאחסנת כל הצבעה עם IP למניעת כפילויות
-- =====================================================
CREATE TABLE IF NOT EXISTS votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    -- זמן התקופה
    slot_time DATETIME NOT NULL,
    -- כתובת IP של המצביע (תומך ב-IPv6)
    ip_address VARCHAR(45) NOT NULL,
    -- סוג ההצבעה: yes = יש משק, no = אין משק
    vote ENUM('yes', 'no') NOT NULL,
    -- User Agent לסטטיסטיקה
    user_agent VARCHAR(255),
    -- זמן ההצבעה
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- מניעת הצבעה כפולה מאותו IP באותה תקופה
    UNIQUE KEY unique_vote (slot_time, ip_address),
    -- אינדקסים לשאילתות מהירות
    INDEX idx_slot_time (slot_time),
    INDEX idx_ip (ip_address),
    INDEX idx_voted_at (voted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- View להצגת סטטוס נוכחי (אופציונלי)
-- =====================================================
CREATE OR REPLACE VIEW current_slot_status AS
SELECT
    slot_time,
    has_mashak_votes,
    no_mashak_votes,
    total_votes,
    ROUND((has_mashak_votes / NULLIF(total_votes, 0)) * 100, 2) as has_mashak_percentage,
    ROUND((no_mashak_votes / NULLIF(total_votes, 0)) * 100, 2) as no_mashak_percentage
FROM time_slots
ORDER BY slot_time DESC
LIMIT 1;

-- =====================================================
-- Event לניקוי אוטומטי של נתונים ישנים (24+ שעות)
-- הפעלה בהוסטינגר: SET GLOBAL event_scheduler = ON;
-- =====================================================
DELIMITER //
CREATE EVENT IF NOT EXISTS cleanup_old_data
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
    -- מחיקת הצבעות ישנות מעל 24 שעות
    DELETE FROM votes WHERE voted_at < DATE_SUB(NOW(), INTERVAL 24 HOUR);

    -- מחיקת תקופות ישנות מעל 24 שעות
    DELETE FROM time_slots WHERE slot_time < DATE_SUB(NOW(), INTERVAL 24 HOUR);
END//
DELIMITER ;
