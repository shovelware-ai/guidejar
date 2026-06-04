const URL_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

/**
 * URL-safe random id using rejection sampling (so the distribution over the
 * alphabet is uniform — no modulo bias).  Default 10 chars ≈ 62^10 ≈ 8e17
 * possibilities, plenty for unlisted share links.
 *
 * Uses Web Crypto (`crypto.getRandomValues`) so it runs on workerd without
 * needing the nodejs_compat shim for `node:crypto`.
 */
export function shortId(len = 10): string {
  let out = "";
  while (out.length < len) {
    // Grab a generous batch; on average we reject ~6/256 of each byte.
    const batch = new Uint8Array(len * 2);
    crypto.getRandomValues(batch);
    for (const b of batch) {
      if (b < 248) {
        // 248 = 4 * 62, so 0..247 maps uniformly to 0..61
        out += URL_ALPHABET[b % URL_ALPHABET.length];
        if (out.length === len) break;
      }
    }
  }
  return out;
}

/** Longer secret used as a per-guide capability key for edit/unpublish. */
export function editKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  // base64url, manually — no btoa-then-replace dance.
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
