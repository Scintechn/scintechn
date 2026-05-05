import { NextRequest, NextResponse } from 'next/server';
import { createRateLimiter, getClientIp } from '@/lib/rate-limit';
import { validateContact } from '@/lib/spark-validation';
import {
  generateNonce,
  sanitizeIdea,
  validateSparkResponse,
} from '@/lib/spark-security';
import { buildSparkMessages } from '@/lib/prompts/spark';
import { wouldExceedBudget, recordActualCost } from '@/lib/spark-budget';
import { sendSparkEmail } from '@/lib/spark-email';

const MIN_IDEA_CHARS = 12;
const MAX_IDEA_CHARS = 2500;
// Schema worst case is ~6000 chars (~1800 tokens); 1500 leaves comfortable
// headroom while keeping per-call cost under $0.01.
const MAX_OUTPUT_TOKENS = 1500;
const ESTIMATED_COST_USD = 0.01;
// Anthropic Haiku 4.5 published rates (2026-05). Verify on rate change.
const HAIKU_INPUT_COST_PER_TOKEN = 1 / 1_000_000; // $1 per 1M input tokens
const HAIKU_OUTPUT_COST_PER_TOKEN = 5 / 1_000_000; // $5 per 1M output tokens
const MODEL_SLUG = 'anthropic/claude-haiku-4.5';
const OPENROUTER_TIMEOUT_MS = 20_000;
const BOT_MIN_DWELL_MS = 2_000;

const rateLimiter = createRateLimiter({
  prefix: 'scintechn:spark',
  max: 5,
  windowMs: 3_600_000, // 1 hour
});

interface OpenRouterResponse {
  choices?: Array<{ message?: { content?: string } }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number };
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  const b = body as Record<string, unknown>;

  // Honeypot — silent 200 with refusal-style response so bots can't probe the trap.
  if (typeof b.website === 'string' && b.website.trim() !== '') {
    return NextResponse.json({ ok: true, refusal: true }, { status: 200 });
  }

  // Bot heuristic — require >=2s dwell between page load and submit. Skipped
  // when startedAt is missing/invalid (Phase 2 curl tests, where there's no
  // page-load event); Phase 3 client populates this on real submissions.
  if (typeof b.startedAt === 'number' && Number.isFinite(b.startedAt)) {
    const dwell = Date.now() - b.startedAt;
    if (dwell >= 0 && dwell < BOT_MIN_DWELL_MS) {
      return NextResponse.json({ ok: true, refusal: true }, { status: 200 });
    }
  }

  const ip = getClientIp(request);
  const rate = await rateLimiter.check(ip);
  if (!rate.ok) {
    return NextResponse.json(
      { error: 'rate_limit', retryAfter: rate.retryAfter },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfter) } },
    );
  }

  const budget = await wouldExceedBudget(ESTIMATED_COST_USD);
  if (!budget.ok) {
    return NextResponse.json({ error: 'budget_exceeded' }, { status: 503 });
  }

  if (typeof b.idea !== 'string') {
    return NextResponse.json({ error: 'idea_required' }, { status: 400 });
  }
  const trimmedIdea = b.idea.trim();
  if (trimmedIdea.length > MAX_IDEA_CHARS) {
    return NextResponse.json({ error: 'idea_too_long' }, { status: 413 });
  }
  if (trimmedIdea.length < MIN_IDEA_CHARS) {
    return NextResponse.json({ error: 'idea_too_short' }, { status: 400 });
  }

  if (typeof b.contact !== 'string') {
    return NextResponse.json(
      { error: 'invalid_contact', detail: 'empty' },
      { status: 400 },
    );
  }
  const contact = validateContact(b.contact);
  if ('error' in contact) {
    return NextResponse.json(
      { error: 'invalid_contact', detail: contact.error },
      { status: 400 },
    );
  }

  if (!process.env.OPENROUTER_API_KEY) {
    console.error('[spark] OPENROUTER_API_KEY missing');
    return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 });
  }

  const sanitized = sanitizeIdea(trimmedIdea);
  const nonce = generateNonce();
  const { messages } = buildSparkMessages({ idea: sanitized, nonce });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENROUTER_TIMEOUT_MS);

  let openrouterResp: Response;
  try {
    openrouterResp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://scintechn.com',
        'X-Title': 'Scintechn Spark',
      },
      body: JSON.stringify({
        model: MODEL_SLUG,
        messages,
        max_tokens: MAX_OUTPUT_TOKENS,
        temperature: 0.4,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    if ((err as { name?: string }).name === 'AbortError') {
      return NextResponse.json({ error: 'timeout' }, { status: 504 });
    }
    console.error('[spark] fetch failed:', err);
    return NextResponse.json({ error: 'upstream' }, { status: 502 });
  }
  clearTimeout(timeout);

  if (!openrouterResp.ok) {
    const text = await openrouterResp.text().catch(() => '');
    console.error(
      '[spark] OpenRouter non-2xx:',
      openrouterResp.status,
      text.slice(0, 500),
    );
    return NextResponse.json({ error: 'upstream' }, { status: 502 });
  }

  let upstream: OpenRouterResponse;
  try {
    upstream = (await openrouterResp.json()) as OpenRouterResponse;
  } catch {
    return NextResponse.json({ error: 'upstream' }, { status: 502 });
  }

  const content = upstream.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || content.length === 0) {
    console.error('[spark] empty content in OpenRouter response');
    return NextResponse.json({ error: 'upstream' }, { status: 502 });
  }

  const validated = validateSparkResponse(content, nonce);
  if (!validated) {
    console.error(
      '[spark] response failed validation. raw (truncated):',
      content.slice(0, 1000),
    );
    return NextResponse.json({ error: 'upstream' }, { status: 502 });
  }

  // Always record actual spend, even on refusal — it's real money.
  const inputTokens = upstream.usage?.prompt_tokens ?? 0;
  const outputTokens = upstream.usage?.completion_tokens ?? 0;
  const actualCostUsd =
    inputTokens * HAIKU_INPUT_COST_PER_TOKEN +
    outputTokens * HAIKU_OUTPUT_COST_PER_TOKEN;
  await recordActualCost(actualCostUsd);

  if ('refusal' in validated) {
    return NextResponse.json({ ok: true, refusal: true }, { status: 200 });
  }

  const plan = validated;

  // Best-effort email. SMTP failure (or missing config) is logged but not
  // surfaced as a 5xx — the user came for the plan, and the lead is
  // recoverable from this server log even if the mailer is down.
  // PII intentional: contact + idea + plan are logged so the lead can be
  // followed up manually when SMTP is broken. Vercel function logs are
  // project-scoped and time-bounded.
  await sendSparkEmail({ plan, contact, idea: trimmedIdea }).catch((err) => {
    console.error('[spark] SMTP failed; lead recoverable from this log:', {
      contact: contact.normalized,
      contactKind: contact.kind,
      idea: trimmedIdea,
      plan,
      error: (err as Error).message,
    });
  });

  return NextResponse.json({ ok: true, plan }, { status: 200 });
}
