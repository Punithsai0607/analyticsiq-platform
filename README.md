# AnalyticsIQ — User Analytics Platform

A production-quality, full-stack user analytics platform inspired by Mixpanel, Hotjar, and PostHog. Built with **Next.js 15**, **TypeScript**, **MongoDB Atlas**, **Mongoose**, **Tailwind CSS v4**, **Framer Motion**, and **Recharts**.

---

## ✨ Features

- **Tracking Script** (`/tracker.js`) — drop-in vanilla JS script capturing `page_view` and `click` events, stored in your MongoDB
- **Dashboard Overview** — animated stat cards, 14-day activity trend chart, top pages table
- **Sessions Browser** — paginated session cards with device detection, search, and click-through to session detail
- **Session Journey Timeline** — full event timeline with timestamps and click coordinates
- **Click Heatmap** — interactive per-page click visualization with density-based color coding and hover tooltips

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd analyticsiq
npm install
```

### 2. Set up MongoDB Atlas

1. Create a free cluster at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Add a database user and whitelist your IP (or `0.0.0.0/0` for Vercel)
3. Copy your connection string

### 3. Configure Environment

```bash
cp .env.local.example .env.local
# Edit .env.local and paste your MONGODB_URI
```

### 4. Seed Demo Data (optional)

```bash
MONGODB_URI="your-connection-string" node scripts/seed.mjs
```

### 5. Run Locally

```bash
npm run dev
# Open http://localhost:3000
```

---

## 📡 Embed the Tracker

Add this snippet to any website to start tracking:

```html
<script src="https://your-vercel-domain.vercel.app/tracker.js"></script>
```

The script will:
- Store a `sessionId` in `localStorage`
- Auto-track `page_view` on load and SPA navigation
- Track `click` events with X/Y coordinates
- Send events to your `/api/events` endpoint

---

## 🛣️ API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/events` | Ingest a tracking event |
| `GET` | `/api/sessions` | List all sessions (aggregated) |
| `GET` | `/api/sessions/:id` | Get full event timeline for a session |
| `GET` | `/api/heatmap?pageUrl=` | Get click data for a page |
| `GET` | `/api/analytics` | Dashboard overview stats |

---

## 🗂️ Project Structure

```
app/
├── api/                    # API routes
│   ├── events/route.ts
│   ├── sessions/route.ts
│   ├── sessions/[id]/route.ts
│   ├── heatmap/route.ts
│   └── analytics/route.ts
├── page.tsx                # Dashboard overview
├── sessions/page.tsx       # Sessions list
├── sessions/[id]/page.tsx  # Session detail
└── heatmap/page.tsx        # Click heatmap
components/
├── layout/                 # AppShell, Sidebar, Header
├── dashboard/              # StatsCard, ActivityChart, TopPagesTable
├── sessions/               # SessionCard, SessionTimeline
└── heatmap/                # HeatmapCanvas
lib/
├── mongodb.ts              # DB connection singleton
├── models/Event.ts         # Mongoose model + indexes
└── utils.ts                # Shared helpers
public/
└── tracker.js              # Client-side tracking script
scripts/
└── seed.mjs                # Demo data seeder
```

---

## ☁️ Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
```

Set `MONGODB_URI` in your Vercel project's **Environment Variables** tab.

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 App Router |
| Language | TypeScript |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
"# analyticsiq-platform" 
