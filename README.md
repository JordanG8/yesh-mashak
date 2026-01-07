# Yesh Mashak? (Is There an MP?)

A web application that allows users to report whether there is military police (Mashak) at the entrance to a military base.

## Features

- **Real-time voting**: Vote "Yes" or "No" to report MP presence
- **10-minute time slots**: Each voting period lasts 10 minutes
- **One vote per IP**: Prevents multiple votes from the same user
- **Live updates**: Auto-refresh every 30 seconds
- **History page**: View results from the last 24 hours
- **Responsive design**: Mobile-first, works on all devices
- **Hebrew RTL support**: Full right-to-left interface

## Tech Stack

### Backend
- **Node.js + Express.js**: REST API server
- **MySQL 8.x**: Database with connection pooling
- **Security**: Helmet, CORS, Rate Limiting, Input Validation

### Frontend
- **React 18**: Modern UI with hooks
- **Vite**: Fast build tool
- **React Router v6**: Client-side routing
- **Axios**: HTTP client

## Project Structure

```
yesh-mashak/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # Global CSS
│   └── package.json
│
├── server/                 # Express Backend
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   └── package.json
│
├── database/
│   ├── schema.sql          # Database schema
│   └── seeds.sql           # Sample data (optional)
│
└── package.json            # Root package.json
```

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- MySQL 8.x
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/yesh-mashak.git
   cd yesh-mashak
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up the database**
   - Create a MySQL database named `yesh_mashak`
   - Run the schema:
   ```bash
   mysql -u your_user -p yesh_mashak < database/schema.sql
   ```

4. **Configure environment variables**

   Create `server/.env`:
   ```env
   NODE_ENV=development
   PORT=3000
   HOST=0.0.0.0

   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=yesh_mashak
   DB_CONNECTION_LIMIT=10

   CORS_ORIGIN=http://localhost:5173
   CLEANUP_INTERVAL_HOURS=1
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

   Create `client/.env`:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

5. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   npm run dev:server

   # Terminal 2 - Frontend
   npm run dev:client
   ```

   Or run both:
   ```bash
   npm run dev
   ```

6. **Open the app**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api

## API Endpoints

### POST /api/vote
Submit a vote.

**Request Body:**
```json
{
  "vote": "yes" | "no"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Vote recorded successfully",
  "data": {
    "slot_time": "2025-01-07T10:30:00.000Z",
    "has_mashak_votes": 15,
    "no_mashak_votes": 8,
    "total_votes": 23,
    "has_mashak_percentage": 65.22,
    "no_mashak_percentage": 34.78
  }
}
```

### GET /api/current
Get current slot status.

**Response (200):**
```json
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

### GET /api/history?hours=24
Get voting history.

**Response (200):**
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total_slots": 144,
    "hours": 24
  }
}
```

### GET /api/health
Health check endpoint.

## Deployment to Hostinger

### 1. Build the project
```bash
npm run build
```

### 2. Hostinger Setup
1. Log in to Hostinger control panel
2. Go to "Deploy Your Node.js Web App"
3. Click "Import Git repository" and connect GitHub
4. Select your repository and branch
5. Configure:
   - Build command: `npm run build`
   - Start command: `npm start`
   - Node version: 18.x or 20.x

### 3. Environment Variables
Add these in Hostinger's environment variables section:
- `NODE_ENV=production`
- `PORT=3000`
- `DB_HOST=localhost`
- `DB_USER=your_hostinger_db_user`
- `DB_PASSWORD=your_hostinger_db_password`
- `DB_NAME=your_hostinger_db_name`
- `CORS_ORIGIN=https://your-domain.com`

### 4. Database Setup
1. Create a MySQL database in Hostinger
2. Access phpMyAdmin
3. Import `database/schema.sql`

### 5. Verify Deployment
- Check logs in Hostinger panel
- Visit your domain
- Test voting functionality

## Environment Variables

### Server (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment mode | development |
| PORT | Server port | 3000 |
| HOST | Server host | 0.0.0.0 |
| DB_HOST | MySQL host | localhost |
| DB_USER | MySQL user | root |
| DB_PASSWORD | MySQL password | - |
| DB_NAME | Database name | yesh_mashak |
| DB_CONNECTION_LIMIT | Max connections | 10 |
| CORS_ORIGIN | Allowed origins | http://localhost:5173 |
| CLEANUP_INTERVAL_HOURS | Cleanup frequency | 1 |
| RATE_LIMIT_WINDOW_MS | Rate limit window | 900000 |
| RATE_LIMIT_MAX_REQUESTS | Max requests | 100 |

### Client (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | API base URL | /api |

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Vote Rate Limiting**: 10 vote attempts per minute per IP
- **Helmet.js**: Security headers
- **CORS**: Configurable origin whitelist
- **Input Validation**: express-validator
- **SQL Injection Prevention**: Prepared statements
- **IP Detection**: Supports proxy headers (X-Forwarded-For, CF-Connecting-IP)

## License

MIT
