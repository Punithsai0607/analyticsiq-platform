"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { RefreshCw, Bell, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Dashboard Overview", subtitle: "Real-time user behavior intelligence" },
  "/sessions": { title: "Sessions", subtitle: "Browse and analyze user sessions" },
  "/heatmap": { title: "Click Heatmap", subtitle: "Visualize where users click" },
};

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const [time, setTime] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const info = pageTitles[pathname] ?? pageTitles["/"];

  useEffect(() => {
    const tick = () => {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      window.location.reload();
    }, 600);
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 sm:px-6 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
      {/* Left: hamburger (mobile) + title */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="md:hidden w-8 h-8 glass rounded-lg flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
          >
            <h1 className="text-sm sm:text-base font-semibold text-white">{info.title}</h1>
            <p className="hidden sm:block text-xs text-white/40">{info.subtitle}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live clock */}
        <div className="hidden sm:flex items-center gap-2 glass px-3 py-1.5 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono text-white/50">{time}</span>
        </div>

        {/* Notifications */}
        <button
          className="w-8 h-8 glass rounded-lg flex items-center justify-center text-white/40 hover:text-white/70 transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-violet-500" />
        </button>

        {/* Refresh */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleRefresh}
          className="w-8 h-8 glass rounded-lg flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
          aria-label="Refresh page"
        >
          <motion.div animate={{ rotate: refreshing ? 360 : 0 }} transition={{ duration: 0.6 }}>
            <RefreshCw className="w-4 h-4" />
          </motion.div>
        </motion.button>
      </div>
    </header>
  );
}
