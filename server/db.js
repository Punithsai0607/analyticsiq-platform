const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;
let URI = MONGODB_URI;

if (!URI || URI.includes("<username>") || URI.includes("<password>") || URI.includes("<cluster>")) {
  console.warn("⚠️ Warning: MONGODB_URI is not set or contains placeholders in .env.local. Falling back to local MongoDB connection (mongodb://127.0.0.1:27017/analyticsiq).");
  URI = "mongodb://127.0.0.1:27017/analyticsiq";
}

let cachedConn = null;
let cachedPromise = null;

async function connectDB() {
  if (cachedConn) {
    return cachedConn;
  }

  if (!cachedPromise) {
    const opts = {
      bufferCommands: false,
      dbName: "analyticsiq",
    };
    cachedPromise = mongoose.connect(URI, opts).then((m) => m);
  }

  try {
    cachedConn = await cachedPromise;
  } catch (e) {
    cachedPromise = null;
    throw e;
  }

  return cachedConn;
}

module.exports = connectDB;
