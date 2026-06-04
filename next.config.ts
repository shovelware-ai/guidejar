import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project; another lockfile higher up the
  // tree otherwise makes Next.js guess the wrong root.
  turbopack: {
    root: __dirname,
  },
};

// Lets `next dev` resolve Cloudflare bindings (D1, R2, env) via the same
// getCloudflareContext() the production Worker uses.  Runs only in dev.
initOpenNextCloudflareForDev();

export default nextConfig;
