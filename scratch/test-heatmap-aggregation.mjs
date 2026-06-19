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
    clickX: Number,
    clickY: Number,
    viewportWidth: Number,
    viewportHeight: Number,
  },
  {
    collection: "events",
  }
);

const Event = mongoose.models.Event || mongoose.model("Event", EventSchema);

async function test() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);
  
  const pageUrl = "http://localhost:3000/heatmap";
  
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

  console.log("Total aggregated clicks:", clicks.length);
  if (clicks.length > 0) {
    console.log("Sample click:", clicks[0]);
  }
  
  const pagesResult = await Event.aggregate([
    { $match: { type: "click" } },
    { $group: { _id: "$pageUrl" } },
    { $project: { _id: 0, pageUrl: "$_id" } },
    { $sort: { pageUrl: 1 } }
  ]);
  const pages = pagesResult.map(p => p.pageUrl);
  console.log("Distinct pages from aggregation:", pages);

  await mongoose.disconnect();
}

test().catch(console.error);
