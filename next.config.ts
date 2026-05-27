import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project; another lockfile higher up the
  // tree otherwise makes Next.js guess the wrong root.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
