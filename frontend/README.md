# Email Scheduler Frontend

React + TypeScript + Tailwind CSS frontend for the Email Scheduler application.

## Features

- 🔐 Google OAuth authentication
- 📊 Real-time email statistics dashboard
- 📝 Compose and schedule emails
- 📁 CSV upload for bulk recipients
- 📋 View scheduled and sent emails
- 🎨 Modern UI with Tailwind CSS

## Prerequisites

- Node.js 18+
- Backend API running on port 5000

## Installation

```bash
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update variables if needed:
```env
VITE_API_URL=http://localhost:5000/api
```

## Running

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:3000`

## Project Structure

```
frontend/
├── src/
│   ├── api/              # API client and endpoints
│   ├── components/       # React components
│   ├── context/          # React context (Auth)
│   ├── pages/            # Page components
│   ├── types/            # TypeScript types
│   ├── main.tsx          # App entry point
│   └── index.css         # Global styles
├── public/               # Static assets
└── index.html            # HTML template
```

## Usage

1. Click "Sign in with Google" on the login page
2. After authentication, you'll be redirected to the dashboard
3. Use the "Compose Email" tab to schedule emails
4. View scheduled and sent emails in their respective tabs
5. Upload CSV files with email addresses for bulk sending

## CSV Format

The CSV file should have a column named `email`, `Email`, or `EMAIL`:

```csv
email
john@example.com
jane@example.com
```

## License

MIT
