/**
 * Seed script — inserts realistic demo data into MongoDB Atlas
 * Run: node scripts/seed.mjs
 *
 * Automatically reads MONGODB_URI from .env.local
 * Generates:
 *   - 50 unique sessions
 *   - ~500 click events
 *   - Page views + activity spread over last 7 days
 */
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

// Load .env.local explicitly (dotenv/config only reads .env by default)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI || MONGODB_URI.includes("<username>") || MONGODB_URI.includes("<password>")) {
  console.error("❌ MONGODB_URI is not set or contains placeholder values in .env.local");
  process.exit(1);
}

// ─── Config ───────────────────────────────────────────────────────────────────

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

const REFERRERS = [
  "https://google.com",
  "https://twitter.com",
  "https://github.com",
  "https://linkedin.com",
  "https://reddit.com",
  undefined,
  undefined, // direct traffic (weighted higher)
  undefined,
];

const VIEWPORT_SIZES = [
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 390, height: 844 },  // iPhone 14
  { width: 768, height: 1024 }, // iPad
  { width: 1366, height: 768 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateSessionId() {
  return "sess_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now().toString(36);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("🔌 Connecting to MongoDB Atlas...");
  const client = new MongoClient(MONGODB_URI);
  await client.connect();

  const db = client.db("analyticsiq");
  const col = db.collection("events");

  const existing = await col.countDocuments();
  if (existing > 0) {
    console.log(`⚠️  Collection already has ${existing} documents. Clearing before re-seeding...`);
    await col.deleteMany({});
  }

  const events = [];
  const now = Date.now();
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  let totalClicks = 0;

  console.log("🌱 Generating 50 sessions with click + page_view events...");

  // Generate 50 sessions spread over the last 7 days
  for (let s = 0; s < 50; s++) {
    const sessionId = generateSessionId();
    const ua = randomItem(USER_AGENTS);
    const viewport = randomItem(VIEWPORT_SIZES);
    const sessionStart = now - randomInt(0, SEVEN_DAYS_MS);
    const numPages = randomInt(1, 5);
    const referrer = randomItem(REFERRERS);
    let t = sessionStart;

    for (let p = 0; p < numPages; p++) {
      const pageUrl = randomItem(PAGES);

      // Page view event
      events.push({
        sessionId,
        type: "page_view",
        pageUrl,
        timestamp: new Date(t),
        userAgent: ua,
        referrer: p === 0 ? referrer : undefined,
        viewportWidth: viewport.width,
        viewportHeight: viewport.height,
      });
      t += randomInt(3000, 15000);

      // Click events on this page (weighted toward 5-15 clicks per page for rich heatmap)
      const numClicks = randomInt(5, 15);
      totalClicks += numClicks;
      for (let c = 0; c < numClicks; c++) {
        events.push({
          sessionId,
          type: "click",
          pageUrl,
          timestamp: new Date(t),
          clickX: randomInt(10, viewport.width - 10),
          clickY: randomInt(60, viewport.height - 10),
          userAgent: ua,
          viewportWidth: viewport.width,
          viewportHeight: viewport.height,
        });
        t += randomInt(500, 8000);
      }
    }
  }

  // Insert all events
  const result = await col.insertMany(events);

  // Create indexes for performance
  await col.createIndex({ sessionId: 1, timestamp: 1 });
  await col.createIndex({ pageUrl: 1, type: 1 });
  await col.createIndex({ type: 1, timestamp: -1 });
  await col.createIndex({ timestamp: -1 });

  console.log(`\n✅ Seeding complete!`);
  console.log(`   📄 Total events inserted: ${result.insertedCount}`);
  console.log(`   👤 Sessions: 50`);
  console.log(`   🖱️  Clicks: ~${totalClicks}`);
  console.log(`   📊 Page views: ~${events.filter(e => e.type === "page_view").length}`);
  console.log(`   📅 Spread over: last 7 days`);
  console.log(`   🌐 Pages tracked: ${PAGES.length}`);

  await client.close();
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err.message);
  process.exit(1);
});
