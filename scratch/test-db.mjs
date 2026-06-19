import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    sessionId: String,
    type: String,
    pageUrl: String,
    timestamp: Date,
  },
  {
    collection: "events",
  }
);

const Event = mongoose.models.Event || mongoose.model("Event", EventSchema);

async function test() {
  const uri = process.env.MONGODB_URI;
  console.log("URI:", uri);
  await mongoose.connect(uri);
  console.log("Connected to:", mongoose.connection.name);
  console.log("Collections:", await mongoose.connection.db.listCollections().toArray());
  const count = await Event.countDocuments();
  console.log("Event count:", count);
  await mongoose.disconnect();
}

test().catch(console.error);
