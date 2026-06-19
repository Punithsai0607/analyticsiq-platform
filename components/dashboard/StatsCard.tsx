"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn, formatNumber } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: number;
  subtitle?: string;
  color?: "purple" | "cyan" | "emerald" | "amber";
  delay?: number;
  isLoading?: boolean;
}

const colorMap = {
  purple: {
    icon: "from-violet-600/20 to-violet-600/5 border-violet-500/20",
    iconText: "text-violet-400",
    glow: "shadow-violet-500/10",
    trend: "text-violet-400",
    bar: "from-violet-600 to-violet-400",
  },
  cyan: {
    icon: "from-cyan-600/20 to-cyan-600/5 border-cyan-500/20",
    iconText: "text-cyan-400",
    glow: "shadow-cyan-500/10",
    trend: "text-cyan-400",
    bar: "from-cyan-600 to-cyan-400",
  },
  emerald: {
    icon: "from-emerald-600/20 to-emerald-600/5 border-emerald-500/20",
    iconText: "text-emerald-400",
    glow: "shadow-emerald-500/10",
    trend: "text-emerald-400",
    bar: "from-emerald-600 to-emerald-400",
  },
  amber: {
    icon: "from-amber-600/20 to-amber-600/5 border-amber-500/20",
    iconText: "text-amber-400",
    glow: "shadow-amber-500/10",
    trend: "text-amber-400",
    bar: "from-amber-600 to-amber-400",
  },
};

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setDisplay(Math.round(eased * value));
      if (elapsed < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value]);

  return <>{formatNumber(display)}</>;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  color = "purple",
  delay = 0,
  isLoading = false,
}: StatsCardProps) {
  const c = colorMap[color];
  const numericValue = typeof value === "number" ? value : 0;
  const isNumeric = typeof value === "number";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={cn(
        "relative glass rounded-2xl p-5 overflow-hidden group hover:bg-white/[0.05] transition-all duration-300",
        `shadow-xl ${c.glow}`
      )}
    >
      {/* Subtle glow orb */}
      <div
        className={cn(
          "absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity",
          `bg-gradient-to-br ${c.bar}`
        )}
      />

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-3 bg-white/10 rounded w-24" />
            <div className="w-10 h-10 bg-white/10 rounded-xl" />
          </div>
          <div className="h-8 bg-white/10 rounded w-20" />
          <div className="h-3 bg-white/10 rounded w-32" />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">{title}</p>
            <div
              className={cn(
                "w-10 h-10 rounded-xl bg-gradient-to-br border flex items-center justify-center",
                c.icon
              )}
            >
              <Icon className={cn("w-5 h-5", c.iconText)} />
            </div>
          </div>

          {/* Value */}
          <div className="mb-2">
            <span className="text-3xl font-bold text-white tracking-tight">
              {isNumeric ? <AnimatedNumber value={numericValue} /> : value}
            </span>
          </div>

          {/* Subtitle / trend */}
          <div className="flex items-center gap-2">
            {trend !== undefined && (
              <span
                className={cn(
                  "text-xs font-semibold px-1.5 py-0.5 rounded-md",
                  trend >= 0
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-red-500/10 text-red-400"
                )}
              >
                {trend >= 0 ? "+" : ""}
                {trend}%
              </span>
            )}
            {subtitle && <p className="text-xs text-white/40">{subtitle}</p>}
          </div>

          {/* Bottom gradient bar */}
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r opacity-50",
              c.bar
            )}
          />
        </>
      )}
    </motion.div>
  );
}
