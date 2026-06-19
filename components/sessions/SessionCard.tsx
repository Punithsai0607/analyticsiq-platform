"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  MousePointer2,
  Eye,
  Clock,
  Globe,
  ChevronRight,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";
import { cn, timeAgo, formatDuration, getDeviceType, shortenUrl } from "@/lib/utils";

interface Session {
  sessionId: string;
  eventCount: number;
  clickCount: number;
  pageViewCount: number;
  firstSeen: string;
  lastSeen: string;
  duration: number;
  pageCount: number;
  pages: string[];
  userAgent?: string;
}

interface SessionCardProps {
  session: Session;
  index: number;
}

const DeviceIcon = ({ userAgent }: { userAgent?: string }) => {
  const device = getDeviceType(userAgent);
  if (device === "Mobile") return <Smartphone className="w-3.5 h-3.5" />;
  if (device === "Tablet") return <Tablet className="w-3.5 h-3.5" />;
  return <Monitor className="w-3.5 h-3.5" />;
};

export function SessionCard({ session, index }: SessionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ y: -2 }}
    >
      <Link href={`/sessions/${session.sessionId}`}>
        <div className="glass rounded-2xl p-5 hover:bg-white/[0.06] transition-all duration-200 group cursor-pointer border border-transparent hover:border-violet-500/20">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600/20 to-violet-600/5 border border-violet-500/20 flex items-center justify-center">
                <span className="text-violet-400">
                  <DeviceIcon userAgent={session.userAgent} />
                </span>
              </div>
              <div>
                <p className="text-xs font-mono text-white/70 font-semibold">
                  {(session.sessionId || "Unknown Session").slice(0, 20)}...
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3 h-3 text-white/30" />
                  <span className="text-xs text-white/40">{timeAgo(session.lastSeen)}</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { icon: Eye, label: "Page Views", value: session.pageViewCount, color: "text-cyan-400" },
              { icon: MousePointer2, label: "Clicks", value: session.clickCount, color: "text-violet-400" },
              { icon: Globe, label: "Pages", value: session.pageCount, color: "text-emerald-400" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                <stat.icon className={cn("w-3.5 h-3.5 mx-auto mb-1", stat.color)} />
                <p className="text-sm font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/30 leading-none mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Pages visited */}
          {session.pages.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Pages Visited</p>
              {session.pages.slice(0, 3).map((page) => (
                <div
                  key={page}
                  className="flex items-center gap-2 text-xs font-mono text-white/50 truncate"
                >
                  <span className="w-1 h-1 rounded-full bg-violet-500/60 flex-shrink-0" />
                  {shortenUrl(page)}
                </div>
              ))}
              {session.pages.length > 3 && (
                <p className="text-xs text-white/30 pl-3">
                  +{session.pages.length - 3} more
                </p>
              )}
            </div>
          )}

          {/* Duration */}
          {session.duration > 0 && (
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-white/30">Session duration</span>
              <span className="text-xs font-semibold text-white/60">
                {formatDuration(session.duration)}
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
