import 'server-only';
import { escapeHtml } from './html';
import { sendTelegramMessage } from './telegram';
import type { Currency, SparkPlan } from './spark-types';

// Telegram messages cap at 4096 chars; the full Spark plan is well over that.
// This sends a summary (idea, elevator, COI, stack count, phase count) so the
// owner gets the push, and the email holds the full plan. Idea is truncated
// to keep the summary comfortably under the cap even at max idea length.

const IDEA_TRUNCATE = 600;

const LOCALE_BY_CURRENCY: Record<Currency, string> = {
  USD: 'en-US',
  BRL: 'pt-BR',
  EUR: 'pt-PT',
};

const PERIOD_SUFFIX: Record<'month' | 'quarter' | 'year', string> = {
  year: '/year',
  quarter: '/quarter',
  month: '/month',
};

function formatCurrency(amount: number, currency: Currency): string {
  return new Intl.NumberFormat(LOCALE_BY_CURRENCY[currency], {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export interface SparkTelegramArgs {
  plan: SparkPlan;
  contact: { kind: 'email' | 'phone'; normalized: string };
  idea: string;
}

export async function sendSparkTelegram({ plan, contact, idea }: SparkTelegramArgs): Promise<void> {
  const truncatedIdea =
    idea.length > IDEA_TRUNCATE ? idea.slice(0, IDEA_TRUNCATE - 1) + '…' : idea;
  const contactKindLabel = contact.kind === 'email' ? 'email' : 'WhatsApp';
  const coi = plan.costOfInaction;
  const coiRange = `${formatCurrency(coi.low, coi.currency)} – ${formatCurrency(coi.high, coi.currency)} ${PERIOD_SUFFIX[coi.period]}`;

  const text = [
    `🔥 <b>Scintechn — new Spark plan</b>`,
    ``,
    `<b>Contact (${contactKindLabel}):</b> ${escapeHtml(contact.normalized)}`,
    ``,
    `<b>Idea:</b>`,
    escapeHtml(truncatedIdea),
    ``,
    `<b>Elevator:</b>`,
    escapeHtml(plan.elevator),
    ``,
    `<b>Cost of inaction:</b>`,
    escapeHtml(coiRange),
    `<i>Basis:</i> ${escapeHtml(coi.basis)}`,
    ``,
    `<b>Stack:</b> ${escapeHtml(plan.stack.join(', '))}`,
    `<b>Phases:</b> ${plan.phases.length} · <b>Risks:</b> ${plan.risks.length} · <b>Open questions:</b> ${plan.openQuestions.length}`,
    ``,
    `📧 Full plan in your inbox.`,
  ].join('\n');

  await sendTelegramMessage({ text });
}
