import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import { MongoClient } from "mongodb";

async function inspect() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("analyticsiq");
  const col = db.collection("events");

  const sample = await col.findOne({ type: "click" });
  console.log("Sample click document:", JSON.stringify(sample, null, 2));

  const total = await col.countDocuments();
  const clicks = await col.countDocuments({ type: "click" });
  const pageViews = await col.countDocuments({ type: "page_view" });
  console.log("Total events:", total);
  console.log("Clicks:", clicks);
  console.log("Page views:", pageViews);

  const distinctTypes = await col.distinct("type");
  console.log("Distinct types:", distinctTypes);

  const distinctUrls = await col.distinct("pageUrl", { type: "click" });
  console.log("Distinct URLs for clicks:", distinctUrls);

  const sampleSession = await col.findOne({});
  console.log("Sample session document:", JSON.stringify(sampleSession, null, 2));

  await client.close();
}

inspect().catch(console.error);
