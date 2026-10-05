import type { Request } from "express";

/**
 * Normalizes an IPv4 or IPv6 address.
 * For IPv6 addresses, masks the host portion down to a /64 subnet (first 64 bits),
 * preventing attackers from bypassing IP rate limits by rotating addresses within a /64 prefix.
 */
export function normalizeIp(ip: string): string {
  const cleanIp = ip.trim();

  // Handle IPv4-mapped IPv6 (e.g. "::ffff:192.168.1.1")
  if (cleanIp.startsWith("::ffff:")) {
    return cleanIp.substring(7);
  }

  // Pure IPv4 address
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(cleanIp)) {
    return cleanIp;
  }

  // IPv6 localhost
  if (cleanIp === "::1" || cleanIp === "0:0:0:0:0:0:0:1") {
    return "::1";
  }

  // General IPv6 address normalization to /64
  try {
    const expanded = expandIPv6(cleanIp);
    if (expanded) {
      // First 4 hextets represent the /64 prefix
      const prefixHextets = expanded.slice(0, 4);
      return `${prefixHextets.join(":")}::/64`;
    }
  } catch {
    // If expansion fails, return as-is
  }

  return cleanIp;
}

/**
 * Expands an IPv6 shorthand notation into an array of 8 full 4-digit hexadecimal strings.
 */
function expandIPv6(ip: string): string[] | null {
  // Strip any zone identifier e.g. "%eth0"
  const stripped = ip.split("%")[0] ?? "";
  if (!stripped) return null;

  const halves = stripped.split("::");
  if (halves.length > 2) return null; // Invalid IPv6

  let hextets: string[] = [];

  if (halves.length === 2) {
    const left = halves[0] ? halves[0].split(":") : [];
    const right = halves[1] ? halves[1].split(":") : [];
    const missing = 8 - (left.length + right.length);
    if (missing < 0) return null;

    const fill = new Array(missing).fill("0");
    hextets = [...left, ...fill, ...right];
  } else {
    hextets = stripped.split(":");
  }

  if (hextets.length !== 8) return null;

  return hextets.map((h) => h.padStart(4, "0").toLowerCase());
}

/**
 * Extracts and normalizes the client IP address from an Express Request,
 * honoring reverse proxy settings (req.ip).
 */
export function getClientIp(req: Request): string {
  const xForwardedFor = req.headers["x-forwarded-for"];
  const forwardedIp =
    typeof xForwardedFor === "string"
      ? xForwardedFor.split(",")[0]?.trim()
      : Array.isArray(xForwardedFor) && xForwardedFor[0]
        ? xForwardedFor[0].split(",")[0]?.trim()
        : undefined;

  const rawIp = req.ip || forwardedIp || req.socket.remoteAddress || "127.0.0.1";

  return normalizeIp(rawIp);
}
