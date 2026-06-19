import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import { MongoClient } from "mongodb";

async function checkTypes() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("analyticsiq");
  const col = db.collection("events");

  const doc = await col.findOne({});
  if (doc) {
    console.log("Timestamp type:", typeof doc.timestamp, doc.timestamp instanceof Date ? "Date" : "Not Date");
    console.log("Database representation:", doc.timestamp);
  } else {
    console.log("No documents found");
  }
  await client.close();
}

checkTypes().catch(console.error);
