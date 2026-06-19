import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/lib/models/Event";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const pageUrl = searchParams.get("pageUrl");

    if (!pageUrl) {
      return NextResponse.json(
        { error: "pageUrl query parameter is required" },
        { status: 400 }
      );
    }

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

    const pagesResult = await Event.aggregate([
      {
        $match: {
          type: "click",
          pageUrl: { $exists: true, $ne: null, $ne: "" },
        },
      },
      {
        $group: {
          _id: "$pageUrl",
        },
      },
      {
        $project: {
          _id: 0,
          pageUrl: "$_id",
        },
      },
      {
        $sort: {
          pageUrl: 1,
        },
      },
    ]);
    const pages = pagesResult.map((p) => p.pageUrl);

    return NextResponse.json({
      pageUrl,
      totalClicks: clicks.length,
      clicks,
      availablePages: pages,
    });
  } catch (error) {
    console.error("GET /api/heatmap error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
