import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ],
      },
      {
        source: "/tracker.js",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "public, max-age=86400" },
        ],
      },
    ];
  },
  async rewrites() {
    const isDev = process.env.NODE_ENV === "development";
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;

    // Use NEXT_PUBLIC_API_URL if defined, otherwise default to local Express backend in development
    const destination = backendUrl || (isDev ? "http://localhost:5000" : null);

    if (!destination) {
      return [];
    }

    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination: `${destination}/api/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
