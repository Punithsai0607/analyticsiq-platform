"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Home, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative"
      >
        {/* Glow behind number */}
        <div className="absolute inset-0 blur-3xl bg-gradient-to-br from-violet-600/20 to-cyan-500/10 rounded-full" />

        <div className="relative glass rounded-3xl p-12 max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600/20 to-violet-600/5 border border-violet-500/20 flex items-center justify-center mx-auto mb-6">
            <SearchX className="w-10 h-10 text-violet-400" />
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-7xl font-black gradient-text mb-2"
          >
            404
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-semibold text-white mb-2"
          >
            Page not found
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-sm text-white/40 mb-8"
          >
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/25"
            >
              <Home className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
