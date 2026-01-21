# Email Scheduler Backend

Production-grade email scheduler with BullMQ, Redis rate limiting, and PostgreSQL.

## Features

- 📧 Email scheduling with delayed jobs (BullMQ)
- ⏱️ Configurable hourly rate limiting (Redis-backed)
- 🔄 Automatic rescheduling on rate limit exceeded
- 🛡️ Idempotent email processing
- 🔐 Google OAuth authentication
- 📊 Real-time statistics and monitoring
- 💾 Persistent storage with PostgreSQL
- 🚀 Production-ready with TypeScript

## Prerequisites

- Node.js 18+
- PostgreSQL
- Redis
- Ethereal Email account (or SMTP credentials)

## Installation

```bash
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update the following variables in `.env`:

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

# Email (Ethereal)
SMTP_USER=your_ethereal_user
SMTP_PASS=your_ethereal_pass

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Session Secret
SESSION_SECRET=your_random_secret_key
```

## Running

### Development

Terminal 1 - API Server:
```bash
npm run dev
```

Terminal 2 - Worker:
```bash
npm run worker
```

### Production

```bash
# Build
npm run build

# Start API Server
npm start

# Start Worker (separate process)
npm run worker:prod
```

## API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Email Management
- `POST /api/emails/schedule` - Schedule emails
- `GET /api/emails` - Get scheduled/sent emails
- `GET /api/emails/stats` - Get email statistics
- `DELETE /api/emails/batch/:batchId` - Cancel batch

### Upload
- `POST /api/upload/csv` - Upload CSV with email list

## Architecture

```
backend/
├── src/
│   ├── config/          # Configuration (DB, Redis, Logger, Passport)
│   ├── models/          # TypeORM entities
│   ├── services/        # Business logic
│   ├── queues/          # BullMQ queue setup
│   ├── workers/         # BullMQ workers
│   ├── controllers/     # Route handlers
│   ├── routes/          # Express routes
│   ├── middleware/      # Auth, validation, error handling
│   ├── types/           # TypeScript types
│   └── server.ts        # Express app entry point
```

## Key Features Explained

### Rate Limiting
- Enforced using Redis counters per user per hour
- If limit exceeded, jobs are rescheduled to next hour
- No emails are dropped

### Idempotency
- Email IDs are used as BullMQ job IDs
- Prevents duplicate sends on server restart
- Database status tracking

### Worker Persistence
- BullMQ jobs persist in Redis
- Workers can restart without losing jobs
- Scheduled jobs will execute at correct time

## License

MIT
