# 📧 Email Scheduler Pro

A production-grade full-stack email scheduling system with intelligent rate limiting, bulk sending capabilities, and real-time tracking. Built with TypeScript, Express, MongoDB, Redis, BullMQ, React, and Tailwind CSS.

![Email Scheduler Pro](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

### 🚀 Core Functionality
- **Smart Email Scheduling**: Schedule emails with custom delays and start times
- **Bulk CSV Upload**: Upload recipient lists via CSV files for mass campaigns
- **Rate Limiting**: Intelligent hourly rate limiting with automatic rescheduling
- **Job Persistence**: All jobs persist across server restarts using Redis
- **No Duplicates**: Idempotent job processing ensures no duplicate sends
- **Real-time Tracking**: Monitor scheduled, sent, and failed emails in real-time

### 🎨 User Experience
- **Modern UI**: Professional gradient-based design with smooth animations
- **Google OAuth**: Secure authentication via Google OAuth 2.0
- **Responsive Dashboard**: Mobile-friendly interface with real-time stats
- **Manual Refresh**: Control when to update dashboard statistics

### 🛠️ Technical Features
- **TypeScript**: Full type safety across frontend and backend
- **MongoDB**: NoSQL database for flexible email tracking
- **Redis + BullMQ**: Distributed job queue with retry logic
- **Session Management**: Redis-backed sessions for scalability
- **Logging**: Winston-powered structured logging
- **SMTP Integration**: Supports any SMTP provider (Gmail, SendGrid, etc.)

---

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - REST API server
- **TypeScript** - Type-safe development
- **MongoDB** + **TypeORM** - Database and ORM
- **Redis** + **BullMQ** - Job queue and session store
- **Passport.js** - Google OAuth authentication
- **Nodemailer** - Email sending
- **Winston** - Logging

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Router** - Navigation

---

## 📦 Prerequisites

- **Node.js** (v18+) - [Download](https://nodejs.org/)
- **npm** or **yarn**
- **Git**

Required services:
1. **MongoDB Atlas** - [Sign up](https://www.mongodb.com/cloud/atlas/register)
2. **Upstash Redis** - [Sign up](https://upstash.com/)
3. **Google Cloud Console** - [Console](https://console.cloud.google.com/)
4. **Gmail** or **Ethereal Email**

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/email-scheduler.git
cd email-scheduler

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### 2. Configure Environment

**Backend** (`backend/.env`):
```env
PORT=5000
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/email_scheduler
REDIS_URL=rediss://default:password@host:port
SESSION_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Application

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Worker
cd backend && npm run worker

# Terminal 3: Frontend
cd frontend && npm run dev
```

Visit http://localhost:3000

---

## 📡 API Documentation

### Authentication

#### Login
```http
GET /api/auth/google
```

#### Get Current User
```http
GET /api/auth/me
```

### Emails

#### Schedule Emails
```http
POST /api/emails/schedule
Content-Type: application/json

{
  "subject": "Subject",
  "body": "Content",
  "recipients": ["email@example.com"],
  "startTime": "2026-01-22T10:00:00Z",
  "delayBetweenEmails": 5000,
  "hourlyLimit": 50
}
```

#### Get Emails
```http
GET /api/emails?status=SCHEDULED&limit=50
```

#### Get Stats
```http
GET /api/emails/stats
```

---

## 🔧 Detailed Setup

### MongoDB Atlas

1. Create cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create database user
3. Whitelist IP: `0.0.0.0/0` (development)
4. Get connection string
5. Replace `<password>` and add `/email_scheduler`

### Upstash Redis

1. Create database at [Upstash](https://upstash.com/)
2. Copy connection URL (use `rediss://` protocol)

### Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable Google+ API
3. Credentials → OAuth 2.0 Client ID
4. Authorized redirect: `http://localhost:5000/api/auth/google/callback`
5. Copy Client ID & Secret

### Gmail SMTP

1. Enable 2-Step Verification
2. [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate password for "Mail"
4. Use 16-character password in `SMTP_PASS`

**For Testing** - Use [Ethereal Email](https://ethereal.email/create)

---

## 📁 Project Structure

```
email-scheduler/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, Redis, Passport
│   │   ├── models/          # User, Email entities
│   │   ├── services/        # Business logic
│   │   ├── queues/          # BullMQ queues
│   │   ├── workers/         # Job processors
│   │   ├── controllers/     # Route handlers
│   │   ├── routes/          # API routes
│   │   └── server.ts        # Entry point
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios client
│   │   ├── components/      # React components
│   │   ├── pages/           # Login, Dashboard
│   │   ├── context/         # Auth context
│   │   └── main.tsx
│   └── .env
│
└── README.md
```

---

## 🐛 Troubleshooting

**MongoDB connection fails**
- Verify IP whitelist
- Check URL encoding of password

**Redis connection fails**
- Use `rediss://` (double 's')
- Verify credentials

**OAuth not working**
- Match redirect URI exactly
- Check callback URL in `.env`

**Emails not sending**
- Gmail: Use App Password
- Check SMTP credentials
- View logs for errors

**Dashboard not updating**
- Click manual "Refresh" button
- Check browser console
- Verify backend is running

---

## 📊 Rate Limiting

- Default: 50 emails/hour per user
- Automatic rescheduling when limit reached
- Redis-backed with 1-hour TTL
- Configurable via `DEFAULT_HOURLY_LIMIT`

---

## 🚀 Deployment

### Heroku (Backend)
```bash
heroku create
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=...
git push heroku main
heroku ps:scale worker=1
```

### Vercel (Frontend)
```bash
cd frontend
vercel
# Set VITE_API_URL in dashboard
```

---

## 🔒 Security

- Never commit `.env` files
- Use strong `SESSION_SECRET`
- Enable HTTPS in production
- Rotate credentials regularly
- Use App Passwords for Gmail

---

## 📄 License

MIT License - See [LICENSE](LICENSE)

---

## 👨‍💻 Author

Built with ❤️ for scalable email campaigns

---

**Happy Scheduling! 📧✨**
