import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Analytics Platform | User Behavior Intelligence",
  description:
    "Production-quality user analytics platform. Track sessions, visualize click heatmaps, and understand user behavior in real-time.",
  keywords: ["analytics", "heatmap", "session recording", "user behavior"],
  authors: [{ name: "Analytics Platform" }],
  openGraph: {
    title: "Analytics Platform",
    description: "Real-time user behavior analytics",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-[#0a0a0f] text-white`}>
        <AppShell>{children}</AppShell>
        {/* Analytics tracker — captures page views and clicks into MongoDB */}
        <Script src="/tracker.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}

