"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  MousePointer2,
  Eye,
  Globe,
  Monitor,
  Loader2,
} from "lucide-react";
import { SessionTimeline } from "@/components/sessions/SessionTimeline";
import { formatDuration, timeAgo, getDeviceType, getApiUrl } from "@/lib/utils";
import { format } from "date-fns";

interface SessionSummary {
  sessionId: string;
  eventCount: number;
  firstSeen: string;
  lastSeen: string;
  duration: number;
  pages: string[];
  clickCount: number;
  pageViewCount: number;
  userAgent?: string;
}

interface Event {
  _id: string;
  sessionId: string;
  type: "page_view" | "click";
  pageUrl: string;
  timestamp: string;
  clickX?: number;
  clickY?: number;
}

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(getApiUrl(`/api/sessions/${id}`))
      .then((r) => {
        if (!r.ok) throw new Error("Session not found");
        return r.json();
      })
      .then((d) => {
        setSummary(d.summary);
        setEvents(d.events);
        setLoading(false);
      })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-white/40">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading session…</span>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="glass rounded-2xl p-10 text-center max-w-md mx-auto">
        <p className="text-white/50 text-sm mb-4">{error ?? "Session not found"}</p>
        <button
          onClick={() => router.back()}
          className="text-xs text-violet-400 hover:text-violet-300"
        >
          ← Back to sessions
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back button + header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sessions
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/20 to-violet-600/5 border border-violet-500/20 flex items-center justify-center">
            <Monitor className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-mono">{summary.sessionId}</h2>
            <p className="text-xs text-white/40">
              {getDeviceType(summary.userAgent)} · Last active {timeAgo(summary.lastSeen)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Clock, label: "Duration", value: formatDuration(summary.duration), color: "text-cyan-400" },
          { icon: Eye, label: "Page Views", value: summary.pageViewCount, color: "text-cyan-400" },
          { icon: MousePointer2, label: "Clicks", value: summary.clickCount, color: "text-violet-400" },
          { icon: Globe, label: "Pages", value: summary.pages.length, color: "text-emerald-400" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass rounded-xl p-4"
          >
            <stat.icon className={`w-4 h-4 ${stat.color} mb-2`} />
            <p className="text-xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-white/40">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Timeline + Meta columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-white">Session Journey</h3>
            <span className="text-xs text-white/30">{events.length} events</span>
          </div>
          <div className="max-h-[600px] overflow-y-auto pr-1">
            <SessionTimeline events={events} />
          </div>
        </motion.div>

        {/* Meta info */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-4"
        >
          {/* Session info */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Session Info</h3>
            <div className="space-y-3">
              {[
                { label: "Started", value: format(new Date(summary.firstSeen), "MMM d, HH:mm:ss") },
                { label: "Ended", value: format(new Date(summary.lastSeen), "MMM d, HH:mm:ss") },
                { label: "Device", value: getDeviceType(summary.userAgent) },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-xs text-white/40">{item.label}</span>
                  <span className="text-xs font-semibold text-white/70">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pages visited */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Pages Visited</h3>
            <div className="space-y-2">
              {summary.pages.map((page, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-violet-400 flex-shrink-0" />
                  <span className="text-xs font-mono text-white/50 truncate">{page}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
