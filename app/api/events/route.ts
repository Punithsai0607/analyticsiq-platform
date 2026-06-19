import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/lib/models/Event";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { sessionId, type, pageUrl, timestamp, clickX, clickY, userAgent, referrer, viewportWidth, viewportHeight } = body;

    if (!sessionId || !type || !pageUrl) {
      return NextResponse.json(
        { error: "Missing required fields: sessionId, type, pageUrl" },
        { status: 400 }
      );
    }

    if (!["page_view", "click"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid event type. Must be page_view or click" },
        { status: 400 }
      );
    }

    const event = await Event.create({
      sessionId,
      type,
      pageUrl,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      clickX,
      clickY,
      userAgent: userAgent || request.headers.get("user-agent") || undefined,
      referrer,
      viewportWidth,
      viewportHeight,
    });

    return NextResponse.json({ success: true, eventId: event._id }, { status: 201 });
  } catch (error) {
    console.error("POST /api/events error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
