"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  MousePointer2,
  Eye,
  Globe,
  TrendingUp,
  Zap,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { TopPagesTable } from "@/components/dashboard/TopPagesTable";
import { shortenUrl } from "@/lib/utils";

interface AnalyticsData {
  totalSessions: number;
  totalEvents: number;
  totalClicks: number;
  mostVisitedPage: string | null;
  activityTrend: Array<{ date: string; events: number; clicks: number; pageViews: number }>;
  topPages: Array<{ page: string; views: number }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError("Failed to load analytics data"); setLoading(false); });
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <Zap className="w-7 h-7 text-red-400" />
        </div>
        <p className="text-white/60 text-sm">{error}</p>
        <p className="text-white/30 text-xs mt-1">Check your MongoDB connection in .env.local</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page intro */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-xl font-bold text-white">
            Welcome back 👋
          </h2>
          <p className="text-sm text-white/40 mt-0.5">
            Here&apos;s what&apos;s happening with your users today.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 glass px-3 py-2 rounded-xl">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-400">Live</span>
        </div>
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Total Sessions"
          value={data?.totalSessions ?? 0}
          icon={Users}
          subtitle="Unique visitors"
          color="purple"
          delay={0}
          isLoading={loading}
        />
        <StatsCard
          title="Total Events"
          value={data?.totalEvents ?? 0}
          icon={Zap}
          subtitle="All interactions"
          color="cyan"
          delay={0.08}
          isLoading={loading}
        />
        <StatsCard
          title="Total Clicks"
          value={data?.totalClicks ?? 0}
          icon={MousePointer2}
          subtitle="Click interactions"
          color="emerald"
          delay={0.16}
          isLoading={loading}
        />
        <StatsCard
          title="Top Page"
          value={
            data?.mostVisitedPage
              ? shortenUrl(data.mostVisitedPage).slice(0, 14) || "/"
              : "—"
          }
          icon={Globe}
          subtitle="Most visited URL"
          color="amber"
          delay={0.24}
          isLoading={loading}
        />
      </div>

      {/* Chart + Top pages */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <ActivityChart data={data?.activityTrend ?? []} isLoading={loading} />
        </div>
        <div>
          <TopPagesTable pages={data?.topPages ?? []} isLoading={loading} />
        </div>
      </div>

      {/* Quick stats row */}
      {!loading && data && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            {
              label: "Avg Events / Session",
              value: data.totalSessions
                ? (data.totalEvents / data.totalSessions).toFixed(1)
                : "0",
              icon: Eye,
              color: "text-cyan-400",
            },
            {
              label: "Click Rate",
              value: data.totalEvents
                ? ((data.totalClicks / data.totalEvents) * 100).toFixed(1) + "%"
                : "0%",
              icon: MousePointer2,
              color: "text-violet-400",
            },
            {
              label: "Pages Tracked",
              value: (data.topPages?.length ?? 0).toString(),
              icon: Globe,
              color: "text-emerald-400",
            },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/40">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
