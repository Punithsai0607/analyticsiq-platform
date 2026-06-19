"use client";

const SKELETON_HEIGHTS = [55, 30, 72, 45, 80, 38, 65, 28, 76, 50, 42, 68, 35, 60];

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";

interface TrendData {
  date: string;
  events: number;
  clicks: number;
  pageViews: number;
}

interface ActivityChartProps {
  data: TrendData[];
  isLoading?: boolean;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-strong rounded-xl p-3 shadow-2xl border border-white/10">
        <p className="text-xs font-semibold text-white/60 mb-2">
          {label ? format(parseISO(label), "MMM d, yyyy") : ""}
        </p>
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 text-xs">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-white/60 capitalize">{entry.name}:</span>
            <span className="text-white font-semibold">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function ActivityChart({ data, isLoading = false }: ActivityChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-white">Activity Trend</h2>
          <p className="text-xs text-white/40 mt-0.5">Last 14 days</p>
        </div>
        <div className="flex items-center gap-4">
          {[
            { label: "Events", color: "#8b5cf6" },
            { label: "Page Views", color: "#06b6d4" },
            { label: "Clicks", color: "#10b981" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-white/40">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-end gap-2 px-2">
          {SKELETON_HEIGHTS.map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-white/5 rounded-t-sm animate-pulse"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => format(parseISO(v), "MMM d")}
              interval={1}
            />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="events"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#colorEvents)"
              dot={false}
              activeDot={{ r: 4, fill: "#8b5cf6", strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="pageViews"
              stroke="#06b6d4"
              strokeWidth={2}
              fill="url(#colorPageViews)"
              dot={false}
              activeDot={{ r: 4, fill: "#06b6d4", strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="clicks"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#colorClicks)"
              dot={false}
              activeDot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}
