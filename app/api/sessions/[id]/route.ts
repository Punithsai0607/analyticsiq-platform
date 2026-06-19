import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/lib/models/Event";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const events = await Event.aggregate([
      { $match: { sessionId: id } },
      { $sort: { timestamp: 1 } },
    ]);

    if (events.length === 0) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
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

    return NextResponse.json({ summary, events });
  } catch (error) {
    console.error("GET /api/sessions/:id error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
