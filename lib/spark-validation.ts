import 'server-only';
// `/max` carries full phone metadata so getType() reliably returns MOBILE
// vs FIXED_LINE for any country. The default entry uses `min` metadata which
// strips type info and would reject valid mobiles. Server-side only — does
// not affect client bundle size.
import { parsePhoneNumberFromString } from 'libphonenumber-js/max';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LENGTH = 254;

export type ContactValidationError =
  | 'empty'
  | 'too_long'
  | 'invalid_email'
  | 'invalid_phone';

export type ValidatedContact =
  | { kind: 'email'; normalized: string }
  | { kind: 'phone'; normalized: string }
  | { error: ContactValidationError };

export function validateContact(input: unknown): ValidatedContact {
  if (typeof input !== 'string') return { error: 'empty' };
  const trimmed = input.trim();
  if (!trimmed) return { error: 'empty' };
  if (trimmed.length > MAX_LENGTH) return { error: 'too_long' };

  if (trimmed.includes('@')) {
    if (!EMAIL_REGEX.test(trimmed)) return { error: 'invalid_email' };
    return { kind: 'email', normalized: trimmed };
  }

  const phoneCandidate = trimmed.replace(/\s+/g, '');
  const parsed = parsePhoneNumberFromString(phoneCandidate);
  if (!parsed || !parsed.isValid()) return { error: 'invalid_phone' };
  // We intentionally reject FIXED_LINE — Spark uses this contact for WhatsApp
  // delivery of the build plan, which only works on mobile-capable numbers.
  const type = parsed.getType();
  if (type !== 'MOBILE' && type !== 'FIXED_LINE_OR_MOBILE') {
    return { error: 'invalid_phone' };
  }
  return { kind: 'phone', normalized: parsed.format('E.164') };
}
