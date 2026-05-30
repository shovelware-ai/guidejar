import { randomBytes } from "node:crypto";

const URL_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

/**
 * URL-safe random id using rejection sampling (so the distribution over the
 * alphabet is uniform — no modulo bias).  Default 10 chars ≈ 62^10 ≈ 8e17
 * possibilities, plenty for unlisted share links.
 */
export function shortId(len = 10): string {
  let out = "";
  while (out.length < len) {
    // Grab a generous batch; on average we reject ~6/256 of each byte.
    for (const b of randomBytes(len * 2)) {
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
  return randomBytes(24).toString("base64url");
}
