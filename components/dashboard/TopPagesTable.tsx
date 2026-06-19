"use client";

import { motion } from "framer-motion";
import { Globe, TrendingUp } from "lucide-react";
import { shortenUrl } from "@/lib/utils";

interface TopPage {
  page: string;
  views: number;
}

interface TopPagesTableProps {
  pages: TopPage[];
  isLoading?: boolean;
}

export function TopPagesTable({ pages, isLoading = false }: TopPagesTableProps) {
  const max = pages.length > 0 ? Math.max(...pages.map((p) => p.views)) : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600/20 to-cyan-600/5 border border-cyan-500/20 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Top Pages</h2>
          <p className="text-xs text-white/40">By page views</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-3">
              <div className="h-3 bg-white/10 rounded flex-1" />
              <div className="h-3 bg-white/10 rounded w-10" />
            </div>
          ))}
        </div>
      ) : pages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Globe className="w-8 h-8 text-white/20 mb-2" />
          <p className="text-sm text-white/40">No page data yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pages.map((page, i) => (
            <motion.div
              key={page.page}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.05 }}
              className="group"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-white/60 font-mono truncate max-w-[70%] group-hover:text-white/80 transition-colors">
                  {shortenUrl(page.page)}
                </p>
                <span className="text-xs font-semibold text-white/70">
                  {page.views.toLocaleString()}
                </span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(page.views / max) * 100}%` }}
                  transition={{ duration: 1, delay: 0.6 + i * 0.05, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500"
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
