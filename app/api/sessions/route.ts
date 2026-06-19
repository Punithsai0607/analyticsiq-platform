import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/lib/models/Event";

export async function GET() {
  try {
    await connectDB();

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

    return NextResponse.json({ sessions, total: sessions.length });
  } catch (error) {
    console.error("GET /api/sessions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
