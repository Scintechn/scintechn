import { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export interface RateLimitConfig {
  prefix: string;
  max: number;
  windowMs: number;
}

export interface RateLimitResult {
  ok: boolean;
  retryAfter: number;
}

export interface RateLimiter {
  check(ip: string): Promise<RateLimitResult>;
}

export function getClientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  const real = request.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}

function buildUpstashLimiter({ prefix, max, windowMs }: RateLimitConfig): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  // Upstash sliding-window accepts a string duration. We round to whole
  // seconds; sub-second windowMs values (or non-multiples of 1000) will
  // diverge from the in-memory backend by up to 499ms. All current callers
  // use round-second windows, so this is safe in practice.
  const windowSeconds = Math.max(1, Math.round(windowMs / 1000));
  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(max, `${windowSeconds} s`),
    prefix,
    analytics: true,
  });
}

export function createRateLimiter(config: RateLimitConfig): RateLimiter {
  const upstash = buildUpstashLimiter(config);
  // Per-limiter store so multiple limiters can coexist without sharing quota.
  const ipHits = new Map<string, number[]>();

  function inMemoryCheck(ip: string): RateLimitResult {
    const now = Date.now();
    const cutoff = now - config.windowMs;
    const hits = (ipHits.get(ip) || []).filter((t) => t > cutoff);
    if (hits.length >= config.max) {
      const retryAfter = Math.ceil((hits[0]! + config.windowMs - now) / 1000);
      return { ok: false, retryAfter: Math.max(retryAfter, 1) };
    }
    hits.push(now);
    ipHits.set(ip, hits);
    if (ipHits.size > 1000) {
      for (const [k, v] of ipHits) {
        const fresh = v.filter((t) => t > cutoff);
        if (fresh.length === 0) ipHits.delete(k);
        else ipHits.set(k, fresh);
      }
    }
    return { ok: true, retryAfter: 0 };
  }

  return {
    async check(ip) {
      if (upstash) {
        const { success, reset } = await upstash.limit(ip);
        if (success) return { ok: true, retryAfter: 0 };
        return {
          ok: false,
          retryAfter: Math.max(Math.ceil((reset - Date.now()) / 1000), 1),
        };
      }
      return inMemoryCheck(ip);
    },
  };
}
