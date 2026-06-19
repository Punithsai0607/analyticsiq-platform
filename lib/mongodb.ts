import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

let cached: MongooseCache = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

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

function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randItem<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function genSessionId() { return "sess_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36); }

let seedingPromise: Promise<void> | null = null;

async function autoSeed(conn: typeof mongoose): Promise<void> {
  try {
    const db = conn.connection.db;
    if (!db) return;
    
    const col = db.collection("events");
    const count = await col.countDocuments();
    if (count > 0) {
      console.log(`ℹ️  [Next.js DB] Collection has ${count} events — skipping auto-seed.`);
      return;
    }

    console.log("🌱 [Next.js DB] Collection is empty — auto-seeding demo data...");
    const events: any[] = [];
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
    console.log(`✅ [Next.js DB] Auto-seed complete: ${events.length} events (${views} page views, ${clicks} clicks) across 50 sessions`);
  } catch (err: any) {
    console.error("⚠️ [Next.js DB] Auto-seed failed (non-fatal):", err.message);
  }
}

async function connectDB(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable in .env.local"
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = { 
      bufferCommands: false,
      dbName: "analyticsiq",
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
    if (!seedingPromise) {
      seedingPromise = autoSeed(cached.conn);
    }
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
