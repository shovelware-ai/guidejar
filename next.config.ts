import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project; another lockfile higher up the
  // tree otherwise makes Next.js guess the wrong root.
  turbopack: {
    root: __dirname,
  },
  // better-sqlite3 still lingers in deps during the migration; keep it out of
  // any bundle that might end up on the Worker.
  serverExternalPackages: ["better-sqlite3"],
};

// Lets `next dev` resolve Cloudflare bindings (D1, R2, env) via the same
// getCloudflareContext() the production Worker uses.  Runs only in dev.
initOpenNextCloudflareForDev();

export default nextConfig;
