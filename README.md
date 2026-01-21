# Email Scheduler - Production-Grade Full-Stack Application

A robust email scheduling system with intelligent rate limiting, built with TypeScript, React, BullMQ, Redis, and PostgreSQL.

## 🚀 Features

### Backend
- **Email Scheduling**: Schedule emails with custom delays and start times
- **Rate Limiting**: Redis-backed hourly rate limiting with automatic rescheduling
- **Queue Management**: BullMQ for reliable job processing and persistence
- **Authentication**: Google OAuth 2.0 integration
- **Database**: PostgreSQL with TypeORM for data persistence
- **Worker System**: Separate worker process for email sending
- **CSV Support**: Bulk email upload via CSV
- **Monitoring**: Winston logger for comprehensive logging
- **Idempotent**: Prevents duplicate sends on server restart

### Frontend
- **Modern UI**: React + TypeScript + Tailwind CSS
- **Authentication**: Google OAuth login flow
- **Dashboard**: Real-time statistics and email tracking
- **Compose**: Email composition with CSV upload
- **Tables**: Scheduled and sent emails with status tracking
- **Responsive**: Mobile-friendly design

## 📁 Project Structure

```
reachInBox/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, Redis, Logger, Passport
│   │   ├── models/          # TypeORM entities (User, Email)
│   │   ├── services/        # Business logic (Scheduler, RateLimiter, Email)
│   │   ├── queues/          # BullMQ queue setup
│   │   ├── workers/         # BullMQ worker implementation
│   │   ├── controllers/     # Route handlers
│   │   ├── routes/          # Express routes
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── types/           # TypeScript interfaces
│   │   └── server.ts        # Express app
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── api/             # API client
    │   ├── components/      # React components
    │   ├── context/         # Auth context
    │   ├── pages/           # Login, Dashboard
    │   ├── types/           # TypeScript types
    │   └── main.tsx         # Entry point
    ├── package.json
    └── vite.config.ts
```

## 🛠️ Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Google OAuth credentials
- Ethereal Email account (or SMTP server)

## 📦 Installation

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Configure environment variables in `.env`:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=email_scheduler

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Email (Ethereal - Get credentials from https://ethereal.email)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your_ethereal_user
SMTP_PASS=your_ethereal_pass

# Google OAuth (Get from https://console.cloud.google.com)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Session
SESSION_SECRET=your_random_secret_key

# Rate Limiting
EMAIL_HOURLY_LIMIT=100
EMAIL_MIN_DELAY_MS=1000
WORKER_CONCURRENCY=5
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend API:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Worker:**
```bash
cd backend
npm run worker
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

### Production Mode

**Backend:**
```bash
cd backend
npm run build
npm start              # API server
npm run worker:prod    # Worker (separate process)
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 📡 API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Email Management
- `POST /api/emails/schedule` - Schedule emails
- `GET /api/emails` - Get emails (with filters)
- `GET /api/emails/stats` - Get statistics
- `DELETE /api/emails/batch/:batchId` - Cancel batch

### Upload
- `POST /api/upload/csv` - Upload CSV file

## 🎯 How It Works

### Rate Limiting
1. Each user has an hourly rate limit (configurable)
2. Redis stores the count per user per hour
3. If limit exceeded, jobs are automatically rescheduled to next hour
4. No emails are dropped - they're just delayed

### Job Persistence
1. BullMQ stores jobs in Redis
2. Workers can restart without losing jobs
3. Email IDs are used as job IDs for idempotency
4. Database tracks email status (SCHEDULED, SENT, FAILED)

### Worker Architecture
1. Separate worker process for reliability
2. Configurable concurrency (default: 5)
3. Automatic retry with exponential backoff
4. Graceful shutdown handling

### Email Scheduling Flow
1. User submits email batch via API
2. Each email is saved to PostgreSQL
3. BullMQ job created with delay
4. Worker processes job at scheduled time
5. Rate limiter checks hourly quota
6. If quota available: send email
7. If quota exceeded: reschedule to next hour
8. Database updated with result

## 🔧 Configuration

### Rate Limiting
Adjust in `.env`:
```env
EMAIL_HOURLY_LIMIT=100      # Max emails per hour
EMAIL_MIN_DELAY_MS=1000     # Min delay between emails
WORKER_CONCURRENCY=5        # Concurrent workers
```

### Database Migration
```bash
cd backend
npm run migration:generate -- -n MigrationName
npm run migration:run
```

## 📊 Monitoring

Logs are stored in `backend/logs/`:
- `error.log` - Error messages only
- `combined.log` - All log levels

## 🔒 Security Features

- Helmet.js for HTTP headers
- CORS configuration
- Session management with Redis
- Rate limiting on API endpoints
- Input validation with Joi
- SQL injection protection (TypeORM)

## 🧪 Testing Emails

Use [Ethereal Email](https://ethereal.email) for development:
1. Create free account
2. Use credentials in `.env`
3. View sent emails in Ethereal inbox

## 📝 CSV Format

CSV file should have email column:
```csv
email
john@example.com
jane@example.com
bob@example.com
```

## 🚨 Troubleshooting

**Database connection failed:**
- Ensure PostgreSQL is running
- Check credentials in `.env`

**Redis connection failed:**
- Ensure Redis is running: `redis-server`
- Check Redis port in `.env`

**Worker not processing jobs:**
- Check worker is running
- Check Redis connection
- View logs in `backend/logs/`

**OAuth not working:**
- Verify Google OAuth credentials
- Check callback URL matches Google Console
- Ensure frontend URL in CORS config

## 📚 Tech Stack

**Backend:**
- TypeScript
- Express.js
- PostgreSQL + TypeORM
- Redis + BullMQ
- Nodemailer (Ethereal)
- Passport.js (Google OAuth)
- Winston (Logging)
- Joi (Validation)

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- date-fns

## 📄 License

MIT

## 👥 Author

Built as a production-grade email scheduling system with enterprise features.
