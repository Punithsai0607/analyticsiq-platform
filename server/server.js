const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const Event = require("./models/Event");

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all origins (matches the Next.js API route behavior)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

// Parse JSON request bodies
app.use(express.json());

// DB connection middleware to ensure DB is connected before handling queries
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failure:", error);
    res.status(500).json({ error: "Failed to connect to the database" });
  }
});



/**
 * POST /api/events
 * Ingests a new page view or click event.
 */
app.post("/api/events", async (req, res) => {
  try {
    const {
      sessionId,
      type,
      pageUrl,
      timestamp,
      clickX,
      clickY,
      userAgent,
      referrer,
      viewportWidth,
      viewportHeight,
    } = req.body;

    if (!sessionId || !type || !pageUrl) {
      return res.status(400).json({ error: "Missing required fields: sessionId, type, pageUrl" });
    }

    if (!["page_view", "click"].includes(type)) {
      return res.status(400).json({ error: "Invalid event type. Must be page_view or click" });
    }

    const event = await Event.create({
      sessionId,
      type,
      pageUrl,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      clickX,
      clickY,
      userAgent: userAgent || req.headers["user-agent"] || undefined,
      referrer,
      viewportWidth,
      viewportHeight,
    });

    res.status(201).json({ success: true, eventId: event._id });
  } catch (error) {
    console.error("POST /api/events error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/sessions
 * Returns aggregated unique user sessions with metrics.
 */
app.get("/api/sessions", async (req, res) => {
  try {
    const sessions = await Event.aggregate([
      {
        $match: {
          sessionId: { $ne: null, $exists: true },
        },
      },
      {
        $group: {
          _id: "$sessionId",
          eventCount: { $sum: 1 },
          clickCount: {
            $sum: { $cond: [{ $eq: ["$type", "click"] }, 1, 0] },
          },
          pageViewCount: {
            $sum: { $cond: [{ $eq: ["$type", "page_view"] }, 1, 0] },
          },
          firstSeen: { $min: "$timestamp" },
          lastSeen: { $max: "$timestamp" },
          pages: { $addToSet: "$pageUrl" },
          userAgent: { $first: "$userAgent" },
        },
      },
      {
        $project: {
          sessionId: "$_id",
          _id: 0,
          eventCount: 1,
          clickCount: 1,
          pageViewCount: 1,
          firstSeen: 1,
          lastSeen: 1,
          pageCount: { $size: "$pages" },
          pages: { $slice: ["$pages", 5] },
          userAgent: 1,
          duration: { $subtract: ["$lastSeen", "$firstSeen"] },
        },
      },
      { $sort: { lastSeen: -1 } },
      { $limit: 100 },
    ]);

    res.json({ sessions, total: sessions.length });
  } catch (error) {
    console.error("GET /api/sessions error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/sessions/:id
 * Retrieves the complete event history and summary stats for a single session.
 */
app.get("/api/sessions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const events = await Event.aggregate([
      { $match: { sessionId: id } },
      { $sort: { timestamp: 1 } },
    ]);

    if (events.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    const summary = {
      sessionId: id,
      eventCount: events.length,
      firstSeen: events[0].timestamp,
      lastSeen: events[events.length - 1].timestamp,
      duration: new Date(events[events.length - 1].timestamp).getTime() - new Date(events[0].timestamp).getTime(),
      pages: [...new Set(events.map((e) => e.pageUrl))],
      clickCount: events.filter((e) => e.type === "click").length,
      pageViewCount: events.filter((e) => e.type === "page_view").length,
      userAgent: events[0].userAgent,
    };

    res.json({ summary, events });
  } catch (error) {
    console.error("GET /api/sessions/:id error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/heatmap
 * Fetches click coordinates normalized to viewport percentage for heatmap rendering.
 */
app.get("/api/heatmap", async (req, res) => {
  try {
    const { pageUrl } = req.query;

    if (!pageUrl) {
      return res.status(400).json({ error: "pageUrl query parameter is required" });
    }

    const clicks = await Event.aggregate([
      {
        $match: {
          type: "click",
          pageUrl: pageUrl,
          clickX: { $exists: true, $ne: null },
          clickY: { $exists: true, $ne: null },
        },
      },
      {
        $project: {
          _id: 0,
          timestamp: 1,
          x: {
            $cond: {
              if: { $and: [ { $gt: ["$viewportWidth", 0] }, { $ne: ["$clickX", null] } ] },
              then: {
                $divide: [
                  { $round: [ { $multiply: [ { $divide: ["$clickX", "$viewportWidth"] }, 10000 ] }, 0 ] },
                  100
                ]
              },
              else: "$clickX"
            }
          },
          y: {
            $cond: {
              if: { $and: [ { $gt: ["$viewportHeight", 0] }, { $ne: ["$clickY", null] } ] },
              then: {
                $divide: [
                  { $round: [ { $multiply: [ { $divide: ["$clickY", "$viewportHeight"] }, 10000 ] }, 0 ] },
                  100
                ]
              },
              else: "$clickY"
            }
          }
        }
      }
    ]);

    const pagesResult = await Event.aggregate([
      {
        $match: {
          type: "click",
          pageUrl: { $exists: true, $ne: null, $ne: "" },
        },
      },
      {
        $group: {
          _id: "$pageUrl",
        },
      },
      {
        $project: {
          _id: 0,
          pageUrl: "$_id",
        },
      },
      {
        $sort: {
          pageUrl: 1,
        },
      },
    ]);
    const pages = pagesResult.map((p) => p.pageUrl);

    res.json({
      pageUrl,
      totalClicks: clicks.length,
      clicks,
      availablePages: pages,
    });
  } catch (error) {
    console.error("GET /api/heatmap error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/analytics
 * Compiles aggregated stats and 14-day trends for the main dashboard overview.
 */
app.get("/api/analytics", async (req, res) => {
  try {
    const [totalSessions, totalEvents, totalClicks, activityTrend, topPages] = await Promise.all([
      // Total unique sessions
      Event.distinct("sessionId", { sessionId: { $ne: null, $exists: true } }).then((s) => s.length),

      // Total events
      Event.countDocuments(),

      // Total clicks
      Event.countDocuments({ type: "click" }),

      // Activity trend: last 14 days
      Event.aggregate([
        {
          $match: {
            timestamp: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
            },
            events: { $sum: 1 },
            clicks: { $sum: { $cond: [{ $eq: ["$type", "click"] }, 1, 0] } },
            pageViews: { $sum: { $cond: [{ $eq: ["$type", "page_view"] }, 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Top pages by view count
      Event.aggregate([
        { $match: { type: "page_view" } },
        { $group: { _id: "$pageUrl", views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: 5 },
        { $project: { page: "$_id", views: 1, _id: 0 } },
      ]),
    ]);

    // Fill in missing days for the trend mapping to ensure complete chart data
    const trendMap = new Map(activityTrend.map((d) => [d._id, d]));
    const trend = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split("T")[0];
      const existing = trendMap.get(key);
      trend.push({
        date: key,
        events: existing?.events ?? 0,
        clicks: existing?.clicks ?? 0,
        pageViews: existing?.pageViews ?? 0,
      });
    }

    res.json({
      totalSessions,
      totalEvents,
      totalClicks,
      mostVisitedPage: topPages[0]?.page ?? null,
      activityTrend: trend,
      topPages,
    });
  } catch (error) {
    console.error("GET /api/analytics error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Auto-seed helper ─────────────────────────────────────────────────────────

const PAGES = [
  "http://localhost:3000/",
  "http://localhost:3000/sessions",
  "http://localhost:3000/heatmap",
  "http://localhost:3000/pricing",
  "http://localhost:3000/docs",
  "http://localhost:3000/blog",
  "http://localhost:3000/contact",
];

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0",
];

const VIEWPORT_SIZES = [
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1366, height: 768 },
];

const REFERRERS = [
  "https://google.com", "https://twitter.com", "https://github.com",
  "https://linkedin.com", undefined, undefined, undefined,
];

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function genSessionId() { return "sess_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now().toString(36); }

async function autoSeed() {
  try {
    await connectDB();
    const mongoose = require("mongoose");
    const db = mongoose.connection.db;
    const col = db.collection("events");
    const count = await col.countDocuments();
    if (count > 0) {
      console.log(`ℹ️  Collection has ${count} events — skipping auto-seed.`);
      return;
    }

    console.log("🌱 Collection is empty — auto-seeding demo data...");
    const events = [];
    const now = Date.now();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    for (let s = 0; s < 50; s++) {
      const sessionId = genSessionId();
      const ua = randItem(USER_AGENTS);
      const viewport = randItem(VIEWPORT_SIZES);
      const sessionStart = now - randInt(0, SEVEN_DAYS_MS);
      const numPages = randInt(1, 5);
      let t = sessionStart;

      for (let p = 0; p < numPages; p++) {
        const pageUrl = randItem(PAGES);
        events.push({
          sessionId, type: "page_view", pageUrl,
          timestamp: new Date(t), userAgent: ua,
          referrer: p === 0 ? randItem(REFERRERS) : undefined,
          viewportWidth: viewport.width, viewportHeight: viewport.height,
        });
        t += randInt(3000, 15000);

        const numClicks = randInt(5, 15);
        for (let c = 0; c < numClicks; c++) {
          events.push({
            sessionId, type: "click", pageUrl,
            timestamp: new Date(t),
            clickX: randInt(10, viewport.width - 10),
            clickY: randInt(60, viewport.height - 10),
            userAgent: ua,
            viewportWidth: viewport.width, viewportHeight: viewport.height,
          });
          t += randInt(500, 8000);
        }
      }
    }

    await col.insertMany(events);
    const clicks = events.filter(e => e.type === "click").length;
    const views = events.filter(e => e.type === "page_view").length;
    console.log(`✅ Auto-seed complete: ${events.length} events (${views} page views, ${clicks} clicks) across 50 sessions`);
  } catch (err) {
    console.error("⚠️ Auto-seed failed (non-fatal):", err.message);
  }
}

// Start the Express server
app.listen(PORT, async () => {
  console.log(`🚀 Express server running on port ${PORT}`);
  await autoSeed();
});
