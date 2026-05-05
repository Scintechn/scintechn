import 'server-only';
import { randomBytes } from 'node:crypto';
import type {
  SparkResponse,
  Likelihood,
  Impact,
  Complexity,
  Currency,
  Period,
} from './spark-types';

const MAX_IDEA_CHARS = 2500;
// Strip control chars except \t (\x09), \n (\x0A), \r (\x0D).
const CONTROL_CHARS_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F]/g;

// Canary patterns — phrases that appear *only* in our system prompt or
// represent server-side secrets. If any appears in raw model output, treat
// the response as compromised. Patterns are intentionally narrow: broad
// case-insensitive matches like /OPENROUTER/i or /anthropic\//i caused
// false positives on legitimate plans that recommended "OpenRouter" as a
// stack choice or "Anthropic Claude" as a provider.
const CANARY_PATTERNS: RegExp[] = [
  /<user_input id=/i, // exact wrapping-tag structure from the prompt
  /INTERNAL APPROACH/, // heading from our system prompt
  /OUTPUT FORMAT/, // heading from our system prompt
  /SECURITY RULES/, // heading from our system prompt
  /OPENROUTER_API_KEY/i, // server-only env var name
  /process\.env/, // server-code leak signal
];

const LIKELIHOODS: readonly Likelihood[] = ['low', 'med', 'high'];
const IMPACTS: readonly Impact[] = ['low', 'med', 'high'];
const COMPLEXITIES: readonly Complexity[] = ['S', 'M', 'L'];
const CURRENCIES: readonly Currency[] = ['USD', 'BRL', 'EUR'];
const PERIODS: readonly Period[] = ['month', 'quarter', 'year'];
const COI_HIGH_CEILING = 100_000_000;
const COI_BASIS_MIN = 30;
const COI_BASIS_MAX = 200;
const PLAN_KEYS = new Set([
  'elevator',
  'costOfInaction',
  'scope',
  'stack',
  'phases',
  'risks',
  'openQuestions',
]);
const COI_KEYS = new Set(['currency', 'low', 'high', 'period', 'basis']);

export function generateNonce(): string {
  return randomBytes(8).toString('hex');
}

export function sanitizeIdea(input: string): string {
  let out = input.replace(CONTROL_CHARS_RE, '');
  // Prevent the user from closing our wrapping tag in the prompt.
  out = out.replace(/<user_input/gi, '[user_input').replace(/<\/user_input>/gi, '[/user_input]');
  if (out.length > MAX_IDEA_CHARS) out = out.slice(0, MAX_IDEA_CHARS);
  return out;
}

function isStr(v: unknown): v is string {
  return typeof v === 'string';
}
function strLenIn(v: string, min: number, max: number): boolean {
  return v.length >= min && v.length <= max;
}
function isStrArr(v: unknown): v is string[] {
  return Array.isArray(v) && v.every(isStr);
}

/**
 * Validates a raw OpenRouter assistant content string against the Spark
 * contract. Performs canary detection on the raw text first, then JSON.parse,
 * then strict schema + enum + length-cap validation per docs/spark-plan.md §8.
 *
 * `expectedCurrency` is the currency the server detected from the lead's
 * contact and instructed the model to use; we reject if the model deviated
 * (defense against prompt drift or injection trying to swap currency).
 *
 * Returns a typed `SparkResponse` (plan or refusal) on success, or `null` if
 * any check fails. Callers should log raw text on failure and return a generic
 * 502 to the client.
 */
export function validateSparkResponse(
  rawJson: string,
  nonce: string,
  expectedCurrency: Currency,
): SparkResponse | null {
  if (rawJson.includes(nonce)) {
    if (process.env.NODE_ENV !== 'production') console.warn('[spark-validate] reject: nonce echo');
    return null;
  }
  for (const re of CANARY_PATTERNS) {
    if (re.test(rawJson)) {
      if (process.env.NODE_ENV !== 'production') console.warn('[spark-validate] reject: canary', re);
      return null;
    }
  }

  // Strip optional markdown fence wrap. Even with `response_format: json_object`
  // and explicit "no markdown fences" in the system prompt, Haiku occasionally
  // wraps output in ```json … ```. The canary check above runs on the raw
  // string, so an injection embedded in the fence delimiters still fails.
  let toParse = rawJson.trim();
  if (toParse.startsWith('```')) {
    toParse = toParse
      .replace(/^```(?:json)?\s*\n?/i, '')
      .replace(/\n?```\s*$/, '')
      .trim();
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(toParse);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[spark-validate] reject: json.parse', (err as Error).message, 'first200:', toParse.slice(0, 200));
    }
    return null;
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    if (process.env.NODE_ENV !== 'production') console.warn('[spark-validate] reject: not-object');
    return null;
  }
  const obj = parsed as Record<string, unknown>;

  // Refusal sentinel — must be exactly { refusal: '<<NOT_A_BUILD_REQUEST>>' }, no other keys
  if ('refusal' in obj) {
    if (Object.keys(obj).length !== 1) return null;
    if (obj.refusal !== '<<NOT_A_BUILD_REQUEST>>') return null;
    return { refusal: '<<NOT_A_BUILD_REQUEST>>' };
  }

  // Plan path: the refusal sentinel must NOT appear anywhere in plan output.
  // Checked here (not at raw-text canary stage) so the legitimate refusal
  // response above isn't rejected by its own sentinel.
  if (rawJson.includes('<<NOT_A_BUILD_REQUEST>>')) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[spark-validate] reject: refusal sentinel in plan path');
    }
    return null;
  }

  // Reject any unknown top-level keys to limit injection surface.
  for (const k of Object.keys(obj)) {
    if (!PLAN_KEYS.has(k)) return null;
  }

  // elevator
  if (!isStr(obj.elevator) || !strLenIn(obj.elevator, 1, 280)) return null;

  // costOfInaction
  if (!obj.costOfInaction || typeof obj.costOfInaction !== 'object' || Array.isArray(obj.costOfInaction)) {
    return null;
  }
  const coi = obj.costOfInaction as Record<string, unknown>;
  if (!isStr(coi.currency) || !CURRENCIES.includes(coi.currency as Currency)) return null;
  // Currency lock: model must honor what the server passed in.
  if (coi.currency !== expectedCurrency) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[spark-validate] reject: currency mismatch', {
        expected: expectedCurrency,
        got: coi.currency,
      });
    }
    return null;
  }
  if (!isStr(coi.period) || !PERIODS.includes(coi.period as Period)) return null;
  if (typeof coi.low !== 'number' || !Number.isFinite(coi.low) || coi.low <= 0) return null;
  if (typeof coi.high !== 'number' || !Number.isFinite(coi.high) || coi.high <= 0) return null;
  if (coi.low > coi.high) return null;
  if (coi.high > COI_HIGH_CEILING) return null;
  if (!isStr(coi.basis) || !strLenIn(coi.basis, COI_BASIS_MIN, COI_BASIS_MAX)) return null;
  // Basis must contain a numeric calculation chain — at minimum, one digit.
  if (!/\d/.test(coi.basis)) return null;
  // Reject extra keys on the COI object.
  for (const k of Object.keys(coi)) {
    if (!COI_KEYS.has(k)) return null;
  }

  // scope
  if (!obj.scope || typeof obj.scope !== 'object' || Array.isArray(obj.scope)) return null;
  const scope = obj.scope as Record<string, unknown>;
  if (!isStrArr(scope.in) || scope.in.length < 3 || scope.in.length > 6) return null;
  if (scope.in.some((s) => !strLenIn(s, 1, 120))) return null;
  if (!isStrArr(scope.out) || scope.out.length < 2 || scope.out.length > 4) return null;
  if (scope.out.some((s) => !strLenIn(s, 1, 120))) return null;

  // stack
  if (!isStrArr(obj.stack) || obj.stack.length < 3 || obj.stack.length > 6) return null;
  if (obj.stack.some((s) => !strLenIn(s, 1, 80))) return null;

  // phases
  if (!Array.isArray(obj.phases) || obj.phases.length < 3 || obj.phases.length > 5) return null;
  for (const raw of obj.phases) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const p = raw as Record<string, unknown>;
    if (!isStr(p.label) || !strLenIn(p.label, 1, 24)) return null;
    if (!isStr(p.deliverable) || !strLenIn(p.deliverable, 1, 200)) return null;
    if (!isStr(p.definitionOfDone) || !strLenIn(p.definitionOfDone, 1, 200)) return null;
    if (!isStr(p.complexity) || !COMPLEXITIES.includes(p.complexity as Complexity)) return null;
  }

  // risks
  if (!Array.isArray(obj.risks) || obj.risks.length < 1 || obj.risks.length > 3) return null;
  for (const raw of obj.risks) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const r = raw as Record<string, unknown>;
    if (!isStr(r.title) || !strLenIn(r.title, 1, 120)) return null;
    if (!isStr(r.likelihood) || !LIKELIHOODS.includes(r.likelihood as Likelihood)) return null;
    if (!isStr(r.impact) || !IMPACTS.includes(r.impact as Impact)) return null;
    if (!isStr(r.mitigation) || !strLenIn(r.mitigation, 1, 200)) return null;
  }

  // openQuestions
  if (!isStrArr(obj.openQuestions) || obj.openQuestions.length < 2 || obj.openQuestions.length > 5) {
    return null;
  }
  if (obj.openQuestions.some((s) => !strLenIn(s, 1, 200))) return null;

  // Rebuild a typed object so the return value can't carry attacker-controlled prototype pollution.
  return {
    elevator: obj.elevator,
    costOfInaction: {
      currency: coi.currency as Currency,
      low: coi.low as number,
      high: coi.high as number,
      period: coi.period as Period,
      basis: coi.basis as string,
    },
    scope: { in: scope.in, out: scope.out },
    stack: obj.stack,
    phases: (obj.phases as Array<Record<string, unknown>>).map((p) => ({
      label: p.label as string,
      deliverable: p.deliverable as string,
      definitionOfDone: p.definitionOfDone as string,
      complexity: p.complexity as Complexity,
    })),
    risks: (obj.risks as Array<Record<string, unknown>>).map((r) => ({
      title: r.title as string,
      likelihood: r.likelihood as Likelihood,
      impact: r.impact as Impact,
      mitigation: r.mitigation as string,
    })),
    openQuestions: obj.openQuestions,
  };
}
