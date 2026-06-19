"use client";

const SKELETON_LINE_WIDTHS = ["95%", "82%", "70%", "88%", "75%", "91%"];

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ClickPoint {
  x: number;
  y: number;
  timestamp?: string;
}

interface HeatmapCanvasProps {
  clicks: ClickPoint[];
  totalClicks: number;
}

export function HeatmapCanvas({ clicks, totalClicks }: HeatmapCanvasProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; count: number } | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  // Cluster nearby clicks (within 2% of viewport)
  const clustered = (() => {
    const RADIUS = 2;
    const used = new Array(clicks.length).fill(false);
    const clusters: { x: number; y: number; count: number }[] = [];

    for (let i = 0; i < clicks.length; i++) {
      if (used[i]) continue;
      const group = [clicks[i]];
      used[i] = true;
      for (let j = i + 1; j < clicks.length; j++) {
        if (used[j]) continue;
        const dx = clicks[j].x - clicks[i].x;
        const dy = clicks[j].y - clicks[i].y;
        if (Math.sqrt(dx * dx + dy * dy) < RADIUS) {
          group.push(clicks[j]);
          used[j] = true;
        }
      }
      const cx = group.reduce((s, p) => s + p.x, 0) / group.length;
      const cy = group.reduce((s, p) => s + p.y, 0) / group.length;
      clusters.push({ x: cx, y: cy, count: group.length });
    }
    return clusters;
  })();

  const maxCount = Math.max(...clustered.map((c) => c.count), 1);

  const getColor = (count: number): string => {
    const ratio = count / maxCount;
    if (ratio > 0.8) return "#ef4444";   // red - hot
    if (ratio > 0.5) return "#f97316";   // orange
    if (ratio > 0.3) return "#eab308";   // yellow
    if (ratio > 0.1) return "#06b6d4";   // cyan
    return "#8b5cf6";                     // purple - cold
  };

  const getSize = (count: number): number => {
    const ratio = count / maxCount;
    return 12 + ratio * 28; // 12px to 40px
  };

  const getOpacity = (count: number): number => {
    const ratio = count / maxCount;
    return 0.4 + ratio * 0.5;
  };

  return (
    <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
      {/* Simulated page background */}
      <div
        className="absolute inset-0 rounded-2xl overflow-hidden bg-[#1a1a2e] border border-white/10"
      >
        {/* Fake page skeleton lines */}
        <div className="absolute inset-0 p-8 opacity-10">
          <div className="h-8 bg-white/20 rounded w-1/3 mb-6" />
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-white/10 rounded-xl" />
            ))}
          </div>
          <div className="space-y-2">
            {SKELETON_LINE_WIDTHS.map((w, i) => (
              <div
                key={i}
                className="h-3 bg-white/10 rounded"
                style={{ width: w }}
              />
            ))}
          </div>
        </div>

        {/* Heatmap dots */}
        {clustered.map((cluster, i) => {
          const color = getColor(cluster.count);
          const size = getSize(cluster.count);
          const opacity = getOpacity(cluster.count);

          return (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity }}
              transition={{ duration: 0.4, delay: i * 0.01 }}
              className="absolute cursor-pointer"
              style={{
                left: `${cluster.x}%`,
                top: `${cluster.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              onMouseEnter={(e) => {
                setHovered(i);
                const rect = (e.target as HTMLElement)
                  .closest(".relative")!
                  .getBoundingClientRect();
                setTooltip({
                  x: cluster.x,
                  y: cluster.y,
                  count: cluster.count,
                });
              }}
              onMouseLeave={() => {
                setHovered(null);
                setTooltip(null);
              }}
            >
              {/* Glow ring */}
              <div
                className="absolute inset-0 rounded-full blur-md"
                style={{
                  width: size * 1.8,
                  height: size * 1.8,
                  backgroundColor: color,
                  opacity: 0.25,
                  transform: "translate(-50%, -50%) translate(50%, 50%)",
                }}
              />
              {/* Core dot */}
              <div
                className="rounded-full border border-white/20 transition-all duration-150"
                style={{
                  width: size,
                  height: size,
                  backgroundColor: color,
                  boxShadow: hovered === i ? `0 0 16px ${color}` : `0 0 6px ${color}40`,
                  transform: hovered === i ? "scale(1.3)" : "scale(1)",
                }}
              />
            </motion.div>
          );
        })}

        {/* Tooltip */}
        <AnimatePresence>
          {tooltip && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute z-50 pointer-events-none"
              style={{
                left: `${Math.min(tooltip.x + 5, 75)}%`,
                top: `${Math.max(tooltip.y - 10, 5)}%`,
              }}
            >
              <div className="glass-strong rounded-lg px-3 py-2 text-xs border border-white/10 shadow-xl">
                <p className="text-white font-semibold">{tooltip.count} click{tooltip.count !== 1 ? "s" : ""}</p>
                <p className="text-white/50">
                  ({Math.round(tooltip.x)}%, {Math.round(tooltip.y)}%)
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 right-3 glass rounded-xl px-3 py-2 flex items-center gap-2">
        <span className="text-xs text-white/40">Cold</span>
        <div className="flex gap-0.5">
          {["#8b5cf6", "#06b6d4", "#eab308", "#f97316", "#ef4444"].map((c) => (
            <div
              key={c}
              className="w-4 h-2 rounded-sm"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <span className="text-xs text-white/40">Hot</span>
      </div>
    </div>
  );
}
