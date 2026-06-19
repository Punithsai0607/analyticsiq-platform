"use client";

import { motion } from "framer-motion";
import { Eye, MousePointer2, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn, shortenUrl } from "@/lib/utils";

interface Event {
  _id: string;
  sessionId: string;
  type: "page_view" | "click";
  pageUrl: string;
  timestamp: string;
  clickX?: number;
  clickY?: number;
}

interface SessionTimelineProps {
  events: Event[];
}

export function SessionTimeline({ events }: SessionTimelineProps) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[22px] top-4 bottom-4 w-px bg-gradient-to-b from-violet-500/40 via-cyan-500/20 to-transparent" />

      <div className="space-y-3">
        {events.map((event, i) => {
          const isClick = event.type === "click";
          return (
            <motion.div
              key={event._id || i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              className="flex items-start gap-4"
            >
              {/* Icon node */}
              <div
                className={cn(
                  "relative z-10 w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center border",
                  isClick
                    ? "bg-violet-600/15 border-violet-500/30"
                    : "bg-cyan-600/15 border-cyan-500/30"
                )}
              >
                {isClick ? (
                  <MousePointer2 className="w-4 h-4 text-violet-400" />
                ) : (
                  <Eye className="w-4 h-4 text-cyan-400" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 glass rounded-xl p-3 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded-md",
                      isClick
                        ? "bg-violet-500/10 text-violet-400"
                        : "bg-cyan-500/10 text-cyan-400"
                    )}
                  >
                    {isClick ? "Click" : "Page View"}
                  </span>
                  <div className="flex items-center gap-1 text-white/30">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">
                      {format(new Date(event.timestamp), "HH:mm:ss")}
                    </span>
                  </div>
                </div>
                <p className="text-xs font-mono text-white/60 truncate">
                  {shortenUrl(event.pageUrl)}
                </p>
                {isClick && event.clickX !== undefined && event.clickY !== undefined && (
                  <p className="text-xs text-white/30 mt-1">
                    @ ({Math.round(event.clickX)}, {Math.round(event.clickY)})
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
