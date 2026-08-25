/**
 * URL Sanitizer for safe link rendering
 * Protects against XSS attacks via javascript:, vbscript:, data:, and other dangerous URI schemes.
 */

const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

/**
 * Validates and sanitizes a URL string.
 * Returns the safe URL string if valid, or '#' if the URL is unsafe / malicious.
 */
export function sanitizeUrl(url: string | undefined | null): string {
  if (!url || typeof url !== "string") {
    return "#";
  }

  const trimmed = url.trim();

  // Allow safe fragment identifiers and relative paths
  if (trimmed.startsWith("#") || trimmed.startsWith("/")) {
    // Ensure no control characters or disguised schemes
    if (/^[#/][a-zA-Z0-9_\-./?=&%#]*$/.test(trimmed)) {
      return trimmed;
    }
  }

  // Quick check for obvious dangerous schemes even if encoded / obfuscated
  const normalized = trimmed
    .toLowerCase()
    .split("")
    .filter((char) => char.charCodeAt(0) > 32)
    .join("");
  if (
    normalized.startsWith("javascript:") ||
    normalized.startsWith("vbscript:") ||
    normalized.startsWith("data:") ||
    normalized.startsWith("file:")
  ) {
    return "#";
  }

  try {
    const parsed = new URL(trimmed, window.location.origin);
    if (ALLOWED_PROTOCOLS.has(parsed.protocol)) {
      return parsed.href;
    }
  } catch {
    // If URL constructor fails, treat as unsafe
  }

  return "#";
}

/**
 * Checks whether a given URL is safe to navigate to.
 */
export function isSafeUrl(url: string | undefined | null): boolean {
  return sanitizeUrl(url) !== "#";
}
