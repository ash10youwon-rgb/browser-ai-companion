/**
 * API Security & Rate Limiting Guard
 * Protects server functions against abuse, automated budget draining, and oversized payloads.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory sliding window rate limiter
const ipRequestBuckets = new Map<string, RateLimitRecord>();
const globalMinuteCounter = { count: 0, resetAt: Date.now() + 60_000 };

// Limits
const MAX_REQUESTS_PER_MINUTE_PER_IP = 20;
const MAX_REQUESTS_PER_HOUR_PER_IP = 120;
const GLOBAL_MAX_REQUESTS_PER_MINUTE = 100;

const ipHourlyBuckets = new Map<string, RateLimitRecord>();

// Cleanup stale buckets periodically (every 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      const now = Date.now();
      for (const [key, record] of ipRequestBuckets.entries()) {
        if (record.resetAt <= now) {
          ipRequestBuckets.delete(key);
        }
      }
      for (const [key, record] of ipHourlyBuckets.entries()) {
        if (record.resetAt <= now) {
          ipHourlyBuckets.delete(key);
        }
      }
    },
    5 * 60 * 1000,
  );
}

export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  retryAfterSeconds?: number;
}

/**
 * Validates rate limit for incoming API calls.
 */
export function checkRateLimit(clientId = "default-client"): RateLimitResult {
  const now = Date.now();

  // 1. Global rolling rate limit check
  if (globalMinuteCounter.resetAt <= now) {
    globalMinuteCounter.count = 0;
    globalMinuteCounter.resetAt = now + 60_000;
  }
  if (globalMinuteCounter.count >= GLOBAL_MAX_REQUESTS_PER_MINUTE) {
    return {
      allowed: false,
      reason: "Global API capacity reached. Please wait a moment before trying again.",
      retryAfterSeconds: Math.ceil((globalMinuteCounter.resetAt - now) / 1000),
    };
  }

  // 2. Per-client 1-minute bucket
  let minBucket = ipRequestBuckets.get(clientId);
  if (!minBucket || minBucket.resetAt <= now) {
    minBucket = { count: 0, resetAt: now + 60_000 };
    ipRequestBuckets.set(clientId, minBucket);
  }

  if (minBucket.count >= MAX_REQUESTS_PER_MINUTE_PER_IP) {
    return {
      allowed: false,
      reason: "Rate limit exceeded (max 20 requests/minute). Please slow down.",
      retryAfterSeconds: Math.ceil((minBucket.resetAt - now) / 1000),
    };
  }

  // 3. Per-client 1-hour bucket
  let hourBucket = ipHourlyBuckets.get(clientId);
  if (!hourBucket || hourBucket.resetAt <= now) {
    hourBucket = { count: 0, resetAt: now + 3600_000 };
    ipHourlyBuckets.set(clientId, hourBucket);
  }

  if (hourBucket.count >= MAX_REQUESTS_PER_HOUR_PER_IP) {
    return {
      allowed: false,
      reason: "Hourly usage limit reached (max 120 requests/hour). Please try again later.",
      retryAfterSeconds: Math.ceil((hourBucket.resetAt - now) / 1000),
    };
  }

  // Increment counters
  globalMinuteCounter.count++;
  minBucket.count++;
  hourBucket.count++;

  return { allowed: true };
}

/**
 * Validates text inputs to prevent massive payload memory / token exhaustion
 */
export function sanitizeAndValidatePrompt(
  prompt: unknown,
  maxLength = 8000,
): { valid: boolean; cleaned: string; error?: string } {
  if (typeof prompt !== "string") {
    return { valid: false, cleaned: "", error: "Prompt must be a non-empty string" };
  }

  const trimmed = prompt.trim();
  if (trimmed.length === 0) {
    return { valid: false, cleaned: "", error: "Prompt cannot be empty" };
  }

  if (trimmed.length > maxLength) {
    return {
      valid: false,
      cleaned: trimmed.slice(0, maxLength),
      error: `Prompt exceeds maximum character length of ${maxLength}`,
    };
  }

  return { valid: true, cleaned: trimmed };
}
