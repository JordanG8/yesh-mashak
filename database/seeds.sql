-- =====================================================
-- נתוני דוגמה (אופציונלי - לבדיקות)
-- Yesh Mashak Sample Data
-- =====================================================

USE yesh_mashak;

-- הכנסת תקופות לדוגמה (10 דקות כל אחת)
-- הערה: יש להריץ רק לצורכי בדיקה!

-- תקופה נוכחית (מעוגלת ל-10 דקות)
INSERT INTO time_slots (slot_time, has_mashak_votes, no_mashak_votes, total_votes)
SELECT
    FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(NOW()) / 600) * 600),
    5,
    3,
    8
ON DUPLICATE KEY UPDATE
    has_mashak_votes = has_mashak_votes,
    no_mashak_votes = no_mashak_votes,
    total_votes = total_votes;

-- תקופה קודמת (לפני 10 דקות)
INSERT INTO time_slots (slot_time, has_mashak_votes, no_mashak_votes, total_votes)
SELECT
    FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(NOW()) / 600) * 600 - 600),
    12,
    8,
    20
ON DUPLICATE KEY UPDATE
    has_mashak_votes = has_mashak_votes,
    no_mashak_votes = no_mashak_votes,
    total_votes = total_votes;

-- תקופה לפני 20 דקות
INSERT INTO time_slots (slot_time, has_mashak_votes, no_mashak_votes, total_votes)
SELECT
    FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(NOW()) / 600) * 600 - 1200),
    3,
    15,
    18
ON DUPLICATE KEY UPDATE
    has_mashak_votes = has_mashak_votes,
    no_mashak_votes = no_mashak_votes,
    total_votes = total_votes;

-- הודעה
SELECT 'נתוני הדוגמה הוכנסו בהצלחה!' as message;
