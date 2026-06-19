import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/lib/models/Event";

export async function GET() {
  try {
    await connectDB();

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

    // Fill in missing days for the trend
    const trendMap = new Map(activityTrend.map((d: { _id: string; events: number; clicks: number; pageViews: number }) => [d._id, d]));
    const trend = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split("T")[0];
      const existing = trendMap.get(key) as { _id: string; events: number; clicks: number; pageViews: number } | undefined;
      trend.push({
        date: key,
        events: existing?.events ?? 0,
        clicks: existing?.clicks ?? 0,
        pageViews: existing?.pageViews ?? 0,
      });
    }

    return NextResponse.json({
      totalSessions,
      totalEvents,
      totalClicks,
      mostVisitedPage: topPages[0]?.page ?? null,
      activityTrend: trend,
      topPages,
    });
  } catch (error) {
    console.error("GET /api/analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
