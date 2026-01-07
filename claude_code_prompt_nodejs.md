# פרומפט ל-Claude Code: פיתוח מערכת "יש משק?" - גרסת Node.js מודרנית

## הקשר והמטרה

אני רוצה לפתח אתר בשם "יש משק?" שמאפשר למשתמשים לדווח האם יש משמעת (מש"ק) בכניסה לבסיס צבאי.
**הפרויקט ייפרס להוסטינגר דרך GitHub integration, לכן חשוב מאוד שהכל יהיה ב-repo אחד מוכן לפריסה.**

## מפרט טכני מלא

### Stack טכנולוגי

- **Frontend**: React 18+ (Vite)
- **Backend**: Node.js + Express.js
- **Database**: MySQL 8.x (מסופק על ידי Hostinger)
- **Styling**: CSS Modules או Tailwind CSS
- **State Management**: React Hooks (useState, useEffect)
- **HTTP Client**: Axios או Fetch API
- **Deployment**: Hostinger (GitHub integration)
- **Version Control**: Git + GitHub

### ארכיטקטורה - Monorepo Structure

```
yesh-mashak/
├── client/                          # Frontend React App
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── VoteBar.jsx          # בר האחוזים
│   │   │   ├── VoteButtons.jsx      # כפתורי הצבעה
│   │   │   ├── CurrentStatus.jsx    # סטטוס נוכחי
│   │   │   ├── Message.jsx          # הודעות למשתמש
│   │   │   ├── HistoryList.jsx      # רשימת היסטוריה
│   │   │   └── HistoryItem.jsx      # פריט יחיד בהיסטוריה
│   │   ├── pages/
│   │   │   ├── Home.jsx             # עמוד ראשי
│   │   │   └── History.jsx          # עמוד היסטוריה
│   │   ├── services/
│   │   │   └── api.js               # API service layer
│   │   ├── utils/
│   │   │   ├── timeSlot.js          # עזרים לחישוב slots
│   │   │   └── formatters.js        # פורמט תאריכים ומספרים
│   │   ├── hooks/
│   │   │   ├── useCurrentStatus.js  # Hook לסטטוס נוכחי
│   │   │   ├── useHistory.js        # Hook להיסטוריה
│   │   │   └── useVote.js           # Hook להצבעה
│   │   ├── styles/
│   │   │   ├── globals.css          # סגנונות גלובליים
│   │   │   └── variables.css        # משתני CSS
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── router.jsx               # React Router setup
│   ├── .env.example
│   ├── vite.config.js
│   └── package.json
│
├── server/                          # Backend Express App
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # MySQL connection pool
│   │   │   └── config.js            # App configuration
│   │   ├── middleware/
│   │   │   ├── errorHandler.js      # Error handling middleware
│   │   │   ├── validateIP.js        # IP validation
│   │   │   └── rateLimiter.js       # Rate limiting
│   │   ├── models/
│   │   │   ├── Vote.js              # Vote model
│   │   │   └── TimeSlot.js          # TimeSlot model
│   │   ├── routes/
│   │   │   ├── vote.js              # POST /api/vote
│   │   │   ├── current.js           # GET /api/current
│   │   │   └── history.js           # GET /api/history
│   │   ├── services/
│   │   │   ├── voteService.js       # Business logic for voting
│   │   │   ├── slotService.js       # Time slot management
│   │   │   └── cleanupService.js    # Data cleanup service
│   │   ├── utils/
│   │   │   ├── timeSlot.js          # Time slot calculations
│   │   │   ├── ipUtils.js           # IP extraction utilities
│   │   │   └── validators.js        # Input validators
│   │   ├── app.js                   # Express app setup
│   │   └── server.js                # Server entry point
│   ├── .env.example
│   └── package.json
│
├── database/
│   ├── schema.sql                   # Database schema
│   ├── seeds.sql                    # Optional: sample data
│   └── migrations/                  # Future migrations
│
├── .gitignore
├── README.md
├── package.json                     # Root package.json for scripts
└── hostinger.config.js              # Hostinger deployment config (if needed)
```

### מבנה Database (זהה)

**טבלה 1: time_slots**

```sql
CREATE TABLE time_slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slot_time DATETIME NOT NULL,
    has_mashak_votes INT DEFAULT 0,
    no_mashak_votes INT DEFAULT 0,
    total_votes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_slot (slot_time),
    INDEX idx_slot_time (slot_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**טבלה 2: votes**

```sql
CREATE TABLE votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slot_time DATETIME NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    vote ENUM('yes', 'no') NOT NULL,
    user_agent VARCHAR(255),
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_vote (slot_time, ip_address),
    INDEX idx_slot_time (slot_time),
    INDEX idx_ip (ip_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### דרישות תפקודיות (זהות לגרסת PHP)

#### 1. מניעת מניפולציה

- **הצבעה אחת לכל IP בכל תקופת 10 דקות**
- זיהוי IP אמיתי (תמיכה ב-proxy headers: X-Forwarded-For, X-Real-IP, CF-Connecting-IP)
- אי אפשר להצביע פעמיים באותה תקופה
- הודעת שגיאה ברורה אם המשתמש כבר הצביע

#### 2. ניהול תקופות זמן (10 דקות)

- חישוב slot_time: `Math.floor(Date.now() / 1000 / 600) * 600`
- תקופה חדשה מתחילה אוטומטית כל 10 דקות
- שמירת היסטוריה של 24 שעות אחרונות
- ניקוי אוטומטי של נתונים ישנים מעל 24 שעות (cron job / setInterval)

#### 3. ממשק משתמש ראשי (React)

**קומפוננטות:**

- `<Home />` - עמוד ראשי
  - `<CurrentStatus />` - הצגת זמן התקופה הנוכחית
  - `<VoteBar />` - בר אחוזים אופקי חלק לשתי חלקים:
    - חלק ירוק: אחוז "יש משק"
    - חלק אדום: אחוז "אין משק"
  - מעל הבר: "X% יש (Y הצבעות) | Z% אין (W הצבעות)"
  - `<VoteButtons />` - שני כפתורים גדולים:
    - "יש משק" (כפתור ירוק)
    - "אין משק" (כפתור אדום)
  - `<Message />` - הודעות הצלחה/שגיאה
  - כפתור "היסטוריה" שמנתב ל-/history
  - עדכון אוטומטי כל 30 שניות (useEffect + setInterval)

**עיצוב:**

- עיצוב מינימליסטי, נקי, צבאי-מקצועי
- גופנים עבריים: Heebo, Rubik, או Assistant (Google Fonts)
- Responsive - mobile-first approach
- אנימציות חלקות עם CSS transitions
- צבעים:
  - ירוק: #4CAF50
  - אדום: #f44336
  - רקע: #f5f5f5
  - טקסט: #333333
- Shadow effects עדינים
- Hover states על כפתורים

#### 4. דף היסטוריה (React)

**קומפוננטות:**

- `<History />` - עמוד היסטוריה
  - `<HistoryList />` - רשימה של כל תקופות ה-10 דקות
    - `<HistoryItem />` - לכל תקופה:
      - זמן התחלה וסיום (פורמט עברי)
      - בר אחוזים מוקטן
      - מספר הצבעות
      - תוצאה ברורה ("יש משק" או "אין משק")
      - badge עם צבע לפי תוצאה
  - מיון מהחדש לישן
  - כפתור חזרה לעמוד הראשי
  - Loading state
  - Empty state אם אין נתונים

#### 5. API Endpoints (Express)

**POST /api/vote**

```javascript
Request Body:
{
  "vote": "yes" | "no"
}

Response Success (200):
{
  "success": true,
  "message": "ההצבעה נקלטה בהצלחה",
  "data": {
    "slot_time": "2025-01-07T10:30:00.000Z",
    "has_mashak_votes": 15,
    "no_mashak_votes": 8,
    "total_votes": 23,
    "has_mashak_percentage": 65.22,
    "no_mashak_percentage": 34.78
  }
}

Response Error (400):
{
  "success": false,
  "message": "כבר הצבעת בתקופה זו",
  "data": {
    "next_slot": "2025-01-07T10:40:00.000Z"
  }
}

Response Error (429):
{
  "success": false,
  "message": "יותר מדי בקשות, נסה שוב מאוחר יותר"
}
```

**GET /api/current**

```javascript
Response (200):
{
  "success": true,
  "data": {
    "slot_time": "2025-01-07T10:30:00.000Z",
    "slot_end": "2025-01-07T10:40:00.000Z",
    "has_mashak_votes": 15,
    "no_mashak_votes": 8,
    "total_votes": 23,
    "has_mashak_percentage": 65.22,
    "no_mashak_percentage": 34.78,
    "user_voted": false,
    "user_vote": null,
    "time_remaining_seconds": 420
  }
}
```

**GET /api/history?hours=24**

```javascript
Response (200):
{
  "success": true,
  "data": [
    {
      "slot_time": "2025-01-07T10:30:00.000Z",
      "slot_end": "2025-01-07T10:40:00.000Z",
      "has_mashak_votes": 15,
      "no_mashak_votes": 8,
      "total_votes": 23,
      "has_mashak_percentage": 65.22,
      "no_mashak_percentage": 34.78,
      "result": "yes",
      "is_current": false
    },
    ...
  ],
  "meta": {
    "total_slots": 144,
    "hours": 24
  }
}
```

### דרישות אבטחה

- **CORS**: הגדרת CORS נכון (origin whitelist)
- **Helmet.js**: Security headers
- **Rate Limiting**: express-rate-limit (100 requests/15min per IP)
- **Input Validation**: joi או express-validator
- **SQL Injection**: Prepared statements (mysql2 with placeholders)
- **XSS**: סניטיזציה של inputs
- **Environment Variables**: .env files (לעולם לא ב-git)
- **HTTPS**: בפרודקשן דרך Hostinger

### דרישות ביצועים

- **Connection Pooling**: MySQL connection pool
- **Caching**: Cache של current status (10 שניות)
- **Database Indexes**: על כל ה-foreign keys וזמנים
- **Minification**: Vite production build
- **Compression**: gzip middleware
- **CDN**: Static assets דרך Hostinger CDN אם אפשר

### Deployment Configuration - Hostinger

#### משתני סביבה (.env)

**server/.env**

```env
# Server
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database (מסופק על ידי Hostinger)
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=yesh_mashak
DB_CONNECTION_LIMIT=10

# App
CORS_ORIGIN=https://your-domain.com
CLEANUP_INTERVAL_HOURS=1
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**client/.env**

```env
VITE_API_URL=https://your-domain.com/api
```

#### Build Scripts

**Root package.json**

```json
{
  "name": "yesh-mashak",
  "version": "1.0.0",
  "scripts": {
    "install:client": "cd client && npm install",
    "install:server": "cd server && npm install",
    "install:all": "npm run install:client && npm run install:server",
    "dev:client": "cd client && npm run dev",
    "dev:server": "cd server && npm run dev",
    "build:client": "cd client && npm run build",
    "build:server": "cd server && npm run build",
    "build": "npm run build:client && npm run build:server",
    "start": "cd server && npm start",
    "deploy": "npm run build && npm run start"
  }
}
```

#### Hostinger Deployment Process

1. **Push to GitHub**: כל הקוד ב-repo אחד
2. **Connect Repository**: בפאנל Hostinger - "Deploy Your Node.js Web App" → "Import Git repository"
3. **Configure Build**:
   - Build command: `npm run build`
   - Start command: `npm start`
   - Node version: 18.x או 20.x
4. **Environment Variables**: הזנה בפאנל Hostinger
5. **Database Setup**: יצירת database בפאנל Hostinger והרצת schema.sql
6. **Domain**: חיבור domain או שימוש ב-subdomain של Hostinger

### התנהגות מיוחדת

- אם אין הצבעות בתקופה נוכחית - הצג "עדיין אין נתונים לתקופה זו"
- כפתורים מושבתים (disabled) אם המשתמש כבר הצביע
- countdown timer (אופציונלי) עד לתקופה הבאה
- אנימציית מעבר חלקה כשהבר משתנה (CSS transitions)
- Loading states לכל הפעולות async
- Error boundaries ב-React לטיפול בשגיאות
- Toast notifications למשתמש (או פשוט הודעות בעמוד)
- Skeleton loaders בזמן טעינה

### חבילות NPM מומלצות

**Server:**

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.5",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "compression": "^1.7.4",
    "express-validator": "^7.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

**Client:**

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8"
  }
}
```

## הוראות ל-Claude Code

אני נמצא בתיקייה ריקה עם Git Bash Terminal פתוח.

**בבקשה הדרך אותי שלב אחר שלב:**

### שלב 1: אתחול הפרויקט

- יצירת מבנה התיקיות המלא (monorepo)
- אתחול Git repository
- יצירת .gitignore מקיף (node_modules, .env, build files)
- אתחול npm בכל התיקיות (root, client, server)
- התקנת dependencies
- יצירת README.md מפורט עם הוראות הרצה ופריסה

### שלב 2: הקמת Database

- יצירת database/schema.sql עם הטבלאות
- הוראות מפורטות ליצירת database בהוסטינגר
- הוראות הרצה מקומית עם MySQL

### שלב 3: פיתוח Backend (Express)

**3.1 Configuration & Setup:**

- `server/src/config/database.js` - MySQL connection pool
- `server/src/config/config.js` - App config מ-.env
- `server/src/app.js` - Express app setup (middleware, routes)
- `server/src/server.js` - Server entry point

**3.2 Utilities:**

- `server/src/utils/timeSlot.js` - פונקציות לחישוב slots:
  - `getCurrentSlot()` - מחזיר timestamp של slot נוכחי
  - `getSlotEnd(slotTime)` - מחזיר סוף ה-slot
  - `formatSlotTime(timestamp)` - פורמט ל-MySQL DATETIME
- `server/src/utils/ipUtils.js` - זיהוי IP אמיתי
- `server/src/utils/validators.js` - validation functions

**3.3 Models:**

- `server/src/models/Vote.js` - מתודות:
  - `create(slotTime, ip, vote, userAgent)`
  - `hasVoted(slotTime, ip)`
  - `getUserVote(slotTime, ip)`
- `server/src/models/TimeSlot.js` - מתודות:
  - `getOrCreate(slotTime)`
  - `incrementVote(slotTime, voteType)`
  - `getCurrent()`
  - `getHistory(hours)`

**3.4 Services:**

- `server/src/services/voteService.js` - business logic:
  - `submitVote(ip, vote, userAgent)`
  - טיפול בטרנזקציות
- `server/src/services/slotService.js` - slot management:
  - `getCurrentStatus(ip)`
  - `getHistoryData(hours)`
- `server/src/services/cleanupService.js` - ניקוי אוטומטי:
  - `startCleanupJob()` - setInterval לניקוי כל שעה
  - `cleanOldData()` - מחיקת נתונים מעל 24 שעות

**3.5 Middleware:**

- `server/src/middleware/errorHandler.js` - global error handler
- `server/src/middleware/validateIP.js` - בדיקת IP validity
- `server/src/middleware/rateLimiter.js` - rate limiting config

**3.6 Routes:**

- `server/src/routes/vote.js` - POST /api/vote
- `server/src/routes/current.js` - GET /api/current
- `server/src/routes/history.js` - GET /api/history

### שלב 4: פיתוח Frontend (React + Vite)

**4.1 Setup & Configuration:**

- `client/vite.config.js` - Vite config עם proxy ל-API
- `client/src/main.jsx` - React entry point
- `client/src/App.jsx` - App component עם Router
- `client/src/router.jsx` - React Router setup
- `client/src/styles/globals.css` - CSS reset + variables
- `client/src/styles/variables.css` - CSS variables (colors, spacing)

**4.2 Services & Utils:**

- `client/src/services/api.js` - Axios setup:
  - `api.vote(vote)`
  - `api.getCurrentStatus()`
  - `api.getHistory(hours)`
- `client/src/utils/timeSlot.js` - פונקציות עזר לצד לקוח
- `client/src/utils/formatters.js` - פורמט תאריכים בעברית

**4.3 Custom Hooks:**

- `client/src/hooks/useCurrentStatus.js` - polling כל 30 שניות:
  - מחזיר: `{ data, loading, error, refetch }`
- `client/src/hooks/useHistory.js` - טעינת היסטוריה:
  - מחזיר: `{ history, loading, error }`
- `client/src/hooks/useVote.js` - טיפול בהצבעה:
  - מחזיר: `{ vote, loading, error, message }`

**4.4 Components:**

- `client/src/components/VoteBar.jsx` - בר אחוזים מונפש:
  - Props: `{ hasPercentage, noPercentage, hasVotes, noVotes }`
  - אנימציה חלקה עם CSS
- `client/src/components/VoteButtons.jsx` - כפתורי הצבעה:
  - Props: `{ onVote, disabled, userVote }`
  - disabled state אם הצביע
  - visual feedback על hover
- `client/src/components/CurrentStatus.jsx` - תצוגת זמן:
  - Props: `{ slotTime, slotEnd }`
  - פורמט עברי
- `client/src/components/Message.jsx` - toast/הודעות:
  - Props: `{ type, message, onClose }`
  - אנימציית כניסה/יציאה
- `client/src/components/HistoryList.jsx` - רשימה:
  - Props: `{ history }`
  - מיפוי על HistoryItem
- `client/src/components/HistoryItem.jsx` - פריט יחיד:
  - Props: `{ slot }`
  - בר מוקטן + badge

**4.5 Pages:**

- `client/src/pages/Home.jsx` - עמוד ראשי:
  - שימוש ב-useCurrentStatus
  - שימוש ב-useVote
  - הרכבת כל הקומפוננטות
  - logic של polling
- `client/src/pages/History.jsx` - עמוד היסטוריה:
  - שימוש ב-useHistory
  - תצוגת HistoryList
  - כפתור חזרה

### שלב 5: Styling מלא

- CSS מודרני עם flexbox/grid
- CSS Variables לצבעים וגדלים
- Media queries ל-responsive (mobile-first)
- Animations ו-transitions חלקות
- RTL support לעברית
- Google Fonts integration (Heebo או Rubik)
- Dark mode? (אופציונלי)

### שלב 6: Testing & Error Handling

- בדיקת כל ה-endpoints ב-Postman או curl
- בדיקת תרחישי קצה:
  - IP כפול
  - הצבעה כפולה
  - rate limiting
  - database errors
- Error boundaries ב-React
- Proper error messages בעברית
- Console.log cleanup לפרודקשן

### שלב 7: Git & GitHub Setup

- יצירת .gitignore מושלם
- Commit ראשוני
- יצירת repository ב-GitHub
- Push לריפו
- יצירת README.md עם:
  - תיאור הפרויקט
  - הוראות הרצה מקומית
  - הוראות deployment להוסטינגר
  - screenshots (אופציונלי)
  - Environment variables required

### שלב 8: Deployment ל-Hostinger

**8.1 הכנת הפרויקט:**

- וידוא שכל ה-build scripts עובדים
- יצירת .env.example files
- Documentation של משתני סביבה נדרשים

**8.2 Hostinger Setup:**

- הוראות שלב אחר שלב:
  1. כניסה לפאנל Hostinger
  2. "Deploy Your Node.js Web App"
  3. "Import Git repository" → חיבור GitHub
  4. בחירת repository וbranch
  5. הגדרת Build command: `npm run build`
  6. הגדרת Start command: `npm start`
  7. הגדרת Node version
  8. הוספת Environment Variables
  9. Deploy!

**8.3 Database Setup ב-Hostinger:**

- יצירת MySQL database
- יצירת user והרשאות
- העלאת schema.sql דרך phpMyAdmin
- עדכון משתני הסביבה בפאנל

**8.4 Verification:**

- בדיקת logs
- בדיקת health endpoint
- בדיקת כל הפונקציות
- בדיקה ממובייל

### שלב 9: Documentation & Maintenance

- README.md מלא
- הערות בקוד בעברית
- API documentation
- Troubleshooting guide
- Future improvements ideas

## דרישות מיוחדות מ-Claude Code

- **כל קובץ צריך להיות מלא ומוכן לשימוש** - לא סקלטונים
- **הוסף הערות מפורטות בעברית** בכל קובץ
- **הסבר כל שלב** לפני שאתה יוצר קבצים
- **תן פקודות git מדויקות** לכל שלב
- **טיפול מקיף בשגיאות** בכל רובד
- **אופטימיזציה** - נקי, יעיל, maintainable
- **Best practices** ל-React, Express, MySQL
- **תיעוד** - JSDoc comments איפה שרלוונטי
- **Security first** - לא לשכוח אף אחד מה-security requirements

## סדר ביצוע מומלץ

1. התחל עם מבנה הפרויקט ו-git
2. הקם database schema
3. בנה backend מהתשתית כלפי מעלה (config → utils → models → services → routes)
4. בדוק backend עם Postman/curl
5. בנה frontend מהתשתית כלפי מעלה (setup → services → hooks → components → pages)
6. אינטגרציה frontend-backend
7. styling מלא
8. testing מקיף
9. git + GitHub
10. deployment ל-Hostinger

**מוכן להתחיל? בבקשה התחל משלב 1 והדרך אותי צעד אחר צעד!**
**זכור: הכל צריך להיות ב-repository אחד מוכן לפריסה דרך GitHub ל-Hostinger.**
