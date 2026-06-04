import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * Minimal OpenNext Cloudflare adapter config.  We don't need ISR or the
 * various cache backends yet — every dynamic route is fully server-rendered
 * against D1 / R2 on each request.  When that changes, plug in
 * `incrementalCache: r2IncrementalCache` etc. here.
 */
export default defineCloudflareConfig();
