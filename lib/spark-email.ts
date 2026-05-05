import 'server-only';
import { escapeHtml } from './html';
import { sendPostmarkEmail } from './postmark';
import type { SparkPlan, Currency } from './spark-types';

// Email labels are intentionally hardcoded English (operator-facing primary
// inbox); the plan content itself is in the lead's language. Threading i18n
// into email render added complexity we deliberately avoided.

const LOCALE_BY_CURRENCY: Record<Currency, string> = {
  USD: 'en-US',
  BRL: 'pt-BR',
  EUR: 'pt-PT',
};

function formatCurrency(amount: number, currency: Currency): string {
  return new Intl.NumberFormat(LOCALE_BY_CURRENCY[currency], {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

const PERIOD_SUFFIX_EMAIL: Record<'month' | 'quarter' | 'year', string> = {
  year: '/year',
  quarter: '/quarter',
  month: '/month',
};

export interface SparkEmailContact {
  kind: 'email' | 'phone';
  normalized: string;
}

export interface SparkEmailArgs {
  plan: SparkPlan;
  contact: SparkEmailContact;
  idea: string;
}

/**
 * Sends the generated plan via Postmark to RECIPIENT_EMAIL and CC's the lead
 * when they provided an email. Throws on Postmark error — the caller in
 * app/api/spark/route.ts catches and logs the lead so it remains recoverable
 * even when delivery fails.
 */
export async function sendSparkEmail({ plan, contact, idea }: SparkEmailArgs): Promise<void> {
  const recipientEmail = process.env.RECIPIENT_EMAIL;
  if (!recipientEmail) {
    throw new Error('RECIPIENT_EMAIL not configured');
  }

  const cc = contact.kind === 'email' ? contact.normalized : undefined;
  const replyTo = contact.kind === 'email' ? contact.normalized : undefined;

  await sendPostmarkEmail({
    to: recipientEmail,
    cc,
    replyTo,
    // Strip CRLF before slicing — defense against header injection if the
    // model ever emits a newline mid-elevator.
    subject: `[Spark] ${plan.elevator.replace(/[\r\n]+/g, ' ').slice(0, 80)}`,
    html: renderPlanHtml({ plan, contact, idea }),
    text: renderPlanText({ plan, contact, idea }),
  });
}

function renderPlanHtml({ plan, contact, idea }: SparkEmailArgs): string {
  const e = escapeHtml;
  const contactKindLabel = contact.kind === 'email' ? 'Email' : 'WhatsApp';
  const scopeIn = plan.scope.in.map((s) => `<li>${e(s)}</li>`).join('');
  const scopeOut = plan.scope.out.map((s) => `<li>${e(s)}</li>`).join('');
  const stackChips = plan.stack
    .map((s) => `<span class="chip">${e(s)}</span>`)
    .join(' ');
  const phaseRows = plan.phases
    .map(
      (p) => `
        <tr>
          <td class="phase-label">
            <strong>${e(p.label)}</strong>
            <span class="cx">${e(p.complexity)}</span>
          </td>
          <td>
            <div>${e(p.deliverable)}</div>
            <div class="dod">DoD: ${e(p.definitionOfDone)}</div>
          </td>
        </tr>
      `,
    )
    .join('');
  const riskItems = plan.risks
    .map(
      (r) => `
        <li>
          <strong>${e(r.title)}</strong>
          <span class="risk-meta">likelihood: ${e(r.likelihood)} · impact: ${e(r.impact)}</span>
          <div class="mit">Mitigation: ${e(r.mitigation)}</div>
        </li>
      `,
    )
    .join('');
  const questionItems = plan.openQuestions
    .map((q) => `<li>${e(q)}</li>`)
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.55; color: #0B0F14; background: #F7F6F2; margin: 0; padding: 24px; }
  .container { max-width: 680px; margin: 0 auto; }
  .header { background: hsl(270 60% 44%); color: white; padding: 24px; border-radius: 8px 8px 0 0; }
  .header h1 { margin: 0; font-size: 20px; }
  .header p { margin: 4px 0 0; opacity: 0.9; }
  .content { background: white; padding: 28px; border-radius: 0 0 8px 8px; border: 1px solid #e5e5e9; border-top: none; }
  .meta { background: #F7F6F2; border-radius: 6px; padding: 14px 16px; font-size: 13px; margin-bottom: 24px; }
  .meta-label { color: #6B7280; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; margin-bottom: 4px; }
  .meta-block + .meta-block { margin-top: 12px; }
  h2 { color: hsl(270 60% 44%); font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; margin: 28px 0 10px; }
  h2:first-of-type { margin-top: 0; }
  .elevator { font-size: 16px; line-height: 1.5; margin: 0; }
  ul { margin: 0; padding-left: 20px; }
  li { margin-bottom: 8px; }
  .chip { display: inline-block; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; padding: 4px 10px; border: 1px solid #d4d4d8; border-radius: 999px; margin: 0 6px 6px 0; }
  table { border-collapse: collapse; width: 100%; }
  td { padding: 10px 0; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
  td.phase-label { width: 130px; padding-right: 16px; white-space: nowrap; }
  .cx { display: inline-block; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; padding: 2px 6px; background: rgba(112, 45, 180, 0.1); color: hsl(270 60% 44%); border-radius: 3px; margin-left: 4px; }
  .dod { color: #6B7280; font-size: 13px; margin-top: 4px; }
  .risk-meta { color: #6B7280; font-size: 12px; margin-left: 8px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .mit { color: #6B7280; font-size: 13px; margin-top: 4px; }
  .coi { border: 2px solid hsl(270 60% 44%); background: rgba(112, 45, 180, 0.05); border-radius: 10px; padding: 18px 20px; margin: 16px 0 8px; }
  .coi-amount { font-size: 26px; font-weight: 700; color: #0B0F14; line-height: 1.2; margin: 0 0 8px; }
  .coi-period { color: #6B7280; font-size: 14px; font-weight: 400; margin-left: 6px; }
  .coi-basis { color: #6B7280; font-size: 13px; line-height: 1.5; margin: 8px 0 0; }
  .coi-basis-label { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; margin-right: 6px; }
  .coi-disclaimer { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #6B7280; margin: 10px 0 0; }
  .footer { text-align: center; margin-top: 18px; color: #6B7280; font-size: 12px; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Spark plan</h1>
      <p>From scintechn.com</p>
    </div>
    <div class="content">
      <div class="meta">
        <div class="meta-block">
          <div class="meta-label">${e(contactKindLabel)}</div>
          <div>${e(contact.normalized)}</div>
        </div>
        <div class="meta-block">
          <div class="meta-label">Original idea</div>
          <div>${e(idea)}</div>
        </div>
      </div>

      <h2>Elevator</h2>
      <p class="elevator">${e(plan.elevator)}</p>

      <h2>Cost of inaction</h2>
      <div class="coi">
        <p class="coi-amount">
          ${e(formatCurrency(plan.costOfInaction.low, plan.costOfInaction.currency))}
          &ndash;
          ${e(formatCurrency(plan.costOfInaction.high, plan.costOfInaction.currency))}
          <span class="coi-period">${e(PERIOD_SUFFIX_EMAIL[plan.costOfInaction.period])}</span>
        </p>
        <p class="coi-basis">
          <span class="coi-basis-label">Basis:</span>${e(plan.costOfInaction.basis)}
        </p>
        <p class="coi-disclaimer">Rough estimate, refined in the first call.</p>
      </div>

      <h2>In scope (v1)</h2>
      <ul>${scopeIn}</ul>

      <h2>Out of scope</h2>
      <ul>${scopeOut}</ul>

      <h2>Stack</h2>
      <div>${stackChips}</div>

      <h2>Phases</h2>
      <table>${phaseRows}</table>

      <h2>Risks</h2>
      <ul>${riskItems}</ul>

      <h2>Open questions</h2>
      <ul>${questionItems}</ul>
    </div>
    <div class="footer">
      <p>Generated by Scintechn Spark · &copy; ${new Date().getFullYear()} Scint Technologia Serviços Ltda</p>
    </div>
  </div>
</body>
</html>`;
}

function renderPlanText({ plan, contact, idea }: SparkEmailArgs): string {
  const lines: string[] = [];
  lines.push(`Contact (${contact.kind}): ${contact.normalized}`);
  lines.push('');
  lines.push('Original idea:');
  lines.push(idea);
  lines.push('');
  lines.push('ELEVATOR');
  lines.push(plan.elevator);
  lines.push('');
  lines.push('COST OF INACTION');
  lines.push(
    `${formatCurrency(plan.costOfInaction.low, plan.costOfInaction.currency)} - ` +
      `${formatCurrency(plan.costOfInaction.high, plan.costOfInaction.currency)} ` +
      `${PERIOD_SUFFIX_EMAIL[plan.costOfInaction.period]}`,
  );
  lines.push(`Basis: ${plan.costOfInaction.basis}`);
  lines.push('(Rough estimate, refined in the first call.)');
  lines.push('');
  lines.push('IN SCOPE');
  for (const s of plan.scope.in) lines.push(`- ${s}`);
  lines.push('');
  lines.push('OUT OF SCOPE');
  for (const s of plan.scope.out) lines.push(`- ${s}`);
  lines.push('');
  lines.push('STACK');
  for (const s of plan.stack) lines.push(`- ${s}`);
  lines.push('');
  lines.push('PHASES');
  for (const p of plan.phases) {
    lines.push(`${p.label} [${p.complexity}]`);
    lines.push(`  ${p.deliverable}`);
    lines.push(`  DoD: ${p.definitionOfDone}`);
  }
  lines.push('');
  lines.push('RISKS');
  for (const r of plan.risks) {
    lines.push(`- ${r.title} (${r.likelihood}/${r.impact})`);
    lines.push(`  Mitigation: ${r.mitigation}`);
  }
  lines.push('');
  lines.push('OPEN QUESTIONS');
  for (const q of plan.openQuestions) lines.push(`- ${q}`);
  return lines.join('\n');
}
