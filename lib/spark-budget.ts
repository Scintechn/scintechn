import 'server-only';
import { Redis } from '@upstash/redis';

export const DAILY_BUDGET_USD = 5;
const KEY_TTL_SECONDS = 60 * 60 * 48; // 48h covers UTC-day boundaries comfortably

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function todayKey(): string {
  return `scintechn:spark:budget:${new Date().toISOString().slice(0, 10)}`;
}

const memoryByDate = new Map<string, number>();

async function getSpentUsd(): Promise<number> {
  const key = todayKey();
  const redis = getRedis();
  if (redis) {
    const val = await redis.get<number | string>(key);
    if (val == null) return 0;
    const n = typeof val === 'number' ? val : parseFloat(val);
    return Number.isFinite(n) ? n : 0;
  }
  return memoryByDate.get(key) ?? 0;
}

export interface BudgetCheck {
  ok: boolean;
  spentUsd: number;
}

/**
 * Pre-flight budget check. Non-atomic read-before-write: at peak concurrency,
 * up to N parallel calls can each pass the check before any of them records
 * actual cost, leading to a worst-case overage of N * estimatedCostUsd.
 * Acceptable at this site's expected traffic; revisit if call volume exceeds
 * ~20 RPS or if exact-budget enforcement becomes a hard requirement.
 */
export async function wouldExceedBudget(estimatedCostUsd: number): Promise<BudgetCheck> {
  const spentUsd = await getSpentUsd();
  return {
    ok: spentUsd + estimatedCostUsd <= DAILY_BUDGET_USD,
    spentUsd,
  };
}

export async function recordActualCost(actualCostUsd: number): Promise<void> {
  if (!Number.isFinite(actualCostUsd) || actualCostUsd <= 0) return;
  const key = todayKey();
  const redis = getRedis();
  if (redis) {
    await redis.incrbyfloat(key, actualCostUsd);
    // Best-effort TTL set; harmless if already set with a longer expiry.
    await redis.expire(key, KEY_TTL_SECONDS);
    return;
  }
  memoryByDate.set(key, (memoryByDate.get(key) ?? 0) + actualCostUsd);
}
