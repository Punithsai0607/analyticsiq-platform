"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Flame,
  Activity,
  Zap,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/sessions", label: "Sessions", icon: Users },
  { href: "/heatmap", label: "Heatmap", icon: Flame },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex-shrink-0 z-30 hidden md:flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0d0d14] border-r border-white/5" />
      <div className="absolute inset-0 bg-grid opacity-50" />

      <div className="relative flex flex-col h-full p-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 px-3 py-4 mb-6">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-violet-600/20 to-cyan-500/20 blur-sm -z-10" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">AnalyticsIQ</p>
            <p className="text-xs text-white/40 mt-0.5">User Intelligence</p>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          <p className="text-xs font-semibold text-white/25 uppercase tracking-widest px-3 mb-3">
            Navigation
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "text-white"
                      : "text-white/50 hover:text-white/80 hover:bg-white/5"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-nav"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/20 to-cyan-500/10 border border-violet-500/20"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon
                    className={cn(
                      "w-4.5 h-4.5 relative z-10 transition-colors",
                      isActive ? "text-violet-400" : "text-white/40 group-hover:text-white/60"
                    )}
                  />
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 ml-auto relative z-10 text-violet-400" />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="glass rounded-xl p-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white/80">Live Tracking</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs text-emerald-400/80">Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
