"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, ChevronDown, MousePointer2, Loader2, Globe } from "lucide-react";
import { HeatmapCanvas } from "@/components/heatmap/HeatmapCanvas";
import { shortenUrl } from "@/lib/utils";

interface ClickPoint {
  x: number;
  y: number;
  timestamp?: string;
}

interface HeatmapData {
  pageUrl: string;
  totalClicks: number;
  clicks: ClickPoint[];
  availablePages: string[];
}

export default function HeatmapPage() {
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [selectedPage, setSelectedPage] = useState<string>("");
  const [availablePages, setAvailablePages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Load available pages on mount
  useEffect(() => {
    fetch("/api/heatmap?pageUrl=__init__")
      .then((r) => r.json())
      .then((d) => {
        const pages: string[] = d.availablePages ?? [];
        setAvailablePages(pages);
        if (pages.length > 0) setSelectedPage(pages[0]);
        setInitialLoading(false);
      })
      .catch(() => setInitialLoading(false));
  }, []);

  // Load heatmap when page changes
  useEffect(() => {
    if (!selectedPage || selectedPage === "__init__") return;

    let active = true;
    Promise.resolve().then(() => {
      if (active) setLoading(true);
    });

    fetch(`/api/heatmap?pageUrl=${encodeURIComponent(selectedPage)}`)
      .then((r) => r.json())
      .then((d) => {
        if (active) {
          setHeatmapData(d);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedPage]);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Click Heatmap</h2>
            <p className="text-sm text-white/40 mt-0.5">
              Visualize where users click on your pages
            </p>
          </div>

          {/* Page selector */}
          {!initialLoading && availablePages.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2 glass px-4 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all border border-white/5 hover:border-violet-500/30 min-w-[200px] justify-between"
              >
                <span className="truncate max-w-[180px] font-mono text-xs">
                  {selectedPage ? shortenUrl(selectedPage) : "Select a page"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 flex-shrink-0 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute right-0 top-full mt-2 z-50 glass-strong rounded-xl border border-white/10 shadow-2xl overflow-hidden min-w-[260px]"
                >
                  {availablePages.map((page) => (
                    <button
                      key={page}
                      onClick={() => { setSelectedPage(page); setDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-mono hover:bg-white/5 transition-colors truncate ${
                        page === selectedPage ? "text-violet-400 bg-violet-500/10" : "text-white/60"
                      }`}
                    >
                      {shortenUrl(page)}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats bar */}
      {heatmapData && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-4"
        >
          {[
            { icon: MousePointer2, label: "Total Clicks", value: heatmapData.totalClicks, color: "text-violet-400" },
            { icon: Flame, label: "Page", value: shortenUrl(heatmapData.pageUrl), color: "text-amber-400" },
          ].map((item) => (
            <div key={item.label} className="glass rounded-xl px-4 py-2.5 flex items-center gap-3">
              <item.icon className={`w-4 h-4 ${item.color}`} />
              <div>
                <p className="text-xs text-white/40">{item.label}</p>
                <p className="text-sm font-semibold text-white font-mono">{item.value}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Main heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {initialLoading ? (
          <div className="glass rounded-2xl flex items-center justify-center h-96">
            <div className="flex items-center gap-3 text-white/40">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading heatmap…</span>
            </div>
          </div>
        ) : availablePages.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-sm font-semibold text-white/60 mb-1">No click data yet</h3>
            <p className="text-xs text-white/30 mb-4">
              Add tracker.js to your site to start capturing click events
            </p>
            <div className="glass-strong rounded-xl p-3 inline-block">
              <p className="text-xs text-white/40 font-mono">
                {`<script src="/tracker.js"></script>`}
              </p>
            </div>
          </div>
        ) : loading ? (
          <div className="glass rounded-2xl flex items-center justify-center h-96">
            <div className="flex items-center gap-3 text-white/40">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading click data…</span>
            </div>
          </div>
        ) : heatmapData && heatmapData.clicks.length > 0 ? (
          <HeatmapCanvas clicks={heatmapData.clicks} totalClicks={heatmapData.totalClicks} />
        ) : (
          <div className="glass rounded-2xl p-12 text-center">
            <MousePointer2 className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-sm text-white/50">No clicks recorded for this page</p>
          </div>
        )}
      </motion.div>

      {/* Color scale explanation */}
      {heatmapData && heatmapData.clicks.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-4"
        >
          <p className="text-xs text-white/40 mb-3 font-semibold uppercase tracking-wider">
            Click Density Scale
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            {[
              { color: "#8b5cf6", label: "1–10% density", desc: "Rarely clicked" },
              { color: "#06b6d4", label: "10–30% density", desc: "Occasionally clicked" },
              { color: "#eab308", label: "30–50% density", desc: "Moderately clicked" },
              { color: "#f97316", label: "50–80% density", desc: "Frequently clicked" },
              { color: "#ef4444", label: "80–100% density", desc: "Hotspot" },
            ].map((item) => (
              <div key={item.color} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-white/40">{item.desc}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
