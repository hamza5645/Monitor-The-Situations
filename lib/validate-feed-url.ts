/**
 * Validates RSS feed URLs for server-side fetch (SSRF mitigation).
 * Blocks non-HTTPS, localhost, and common private/link-local targets.
 * DNS rebinding to internal IPs after validation is a known limitation.
 */

function isBlockedIPv4Literal(host: string): boolean {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!m) return false;
  const oct = m.slice(1, 5).map((x) => parseInt(x, 10));
  if (oct.some((n) => n > 255 || Number.isNaN(n))) return true;
  const [a, b] = oct;

  if (a === 0 || a === 127) return true;
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 169 && b === 254) return true;

  return false;
}

function isBlockedIPv6Literal(host: string): boolean {
  const h = host.toLowerCase();
  if (h === "::1") return true;
  if (h.startsWith("fe80:")) return true;
  if (h.startsWith("fc") || h.startsWith("fd")) return true;
  if (h.startsWith("::ffff:")) {
    const v4 = h.slice(7);
    return isBlockedIPv4Literal(v4);
  }
  return false;
}

/**
 * Returns true if the URL is safe to fetch from the server (HTTPS, non-internal host).
 */
export function isAllowedFeedUrl(urlString: string): boolean {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    return false;
  }

  if (url.protocol !== "https:") return false;
  if (url.username || url.password) return false;

  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local")
  ) {
    return false;
  }

  if (isBlockedIPv4Literal(host) || isBlockedIPv6Literal(host)) {
    return false;
  }

  return true;
}
