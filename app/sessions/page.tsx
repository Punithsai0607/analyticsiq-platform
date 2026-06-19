"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, SearchX, Loader2, SlidersHorizontal } from "lucide-react";
import { SessionCard } from "@/components/sessions/SessionCard";
import { getApiUrl } from "@/lib/utils";

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

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(getApiUrl("/api/sessions"))
      .then((r) => r.json())
      .then((d) => { setSessions(d.sessions ?? []); setLoading(false); })
      .catch(() => { setError("Failed to load sessions"); setLoading(false); });
  }, []);

  const filtered = sessions.filter(
    (s) =>
      search === "" ||
      (s.sessionId && s.sessionId.toLowerCase().includes(search.toLowerCase())) ||
      s.pages.some((p) => p.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h2 className="text-xl font-bold text-white">User Sessions</h2>
          <p className="text-sm text-white/40 mt-0.5">
            {loading ? "Loading..." : `${sessions.length} total sessions`}
          </p>
        </div>

        {/* Search + filter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search sessions or pages…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass w-64 pl-4 pr-4 py-2 rounded-xl text-sm text-white/80 placeholder:text-white/25 outline-none focus:border-violet-500/40 border border-white/5 focus:ring-1 focus:ring-violet-500/20 transition-all"
            />
          </div>
          <button className="w-9 h-9 glass rounded-xl flex items-center justify-center text-white/40 hover:text-white/70 transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center h-48">
          <div className="flex items-center gap-3 text-white/40">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading sessions…</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-white/50 text-sm">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-12 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            {search ? (
              <SearchX className="w-8 h-8 text-white/30" />
            ) : (
              <Users className="w-8 h-8 text-white/30" />
            )}
          </div>
          <h3 className="text-sm font-semibold text-white/60 mb-1">
            {search ? "No sessions match your search" : "No sessions yet"}
          </h3>
          <p className="text-xs text-white/30">
            {search
              ? "Try a different search term"
              : "Add tracker.js to your site to start capturing sessions"}
          </p>
          {!search && (
            <div className="mt-4 glass-strong rounded-xl p-3 inline-block text-left">
              <p className="text-xs text-white/40 font-mono">
                {`<script src="https://your-domain.com/tracker.js"></script>`}
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Sessions grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((session, i) => (
            <SessionCard key={session.sessionId} session={session} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
