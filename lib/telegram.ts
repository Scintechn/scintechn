import 'server-only';

const TELEGRAM_API_BASE = 'https://api.telegram.org';
const TELEGRAM_TIMEOUT_MS = 10_000;
// Telegram caps a single sendMessage payload at 4096 chars; we truncate to stay
// safely under it so a long message body never breaks the notification.
const TELEGRAM_MAX_TEXT = 4000;

export interface TelegramSendArgs {
  text: string;
  // HTML parse_mode by default — caller passes pre-escaped text with the
  // Telegram-supported subset only (<b>, <i>, <u>, <s>, <code>, <pre>, <a>).
  parseMode?: 'HTML' | 'MarkdownV2';
  disableWebPagePreview?: boolean;
}

/**
 * Fires a single Telegram bot notification via sendMessage. Throws on any
 * failure (missing env, network, non-2xx, or ok:false in the JSON body) so
 * callers can choose to swallow it — this is a secondary channel and the
 * contact form's response posture should not depend on Telegram being up.
 *
 * Required env: TELEGRAM_BOT_TOKEN (from @BotFather), TELEGRAM_CHAT_ID
 * (chat id where the bot posts — your DM with the bot, or a group it's in).
 */
export async function sendTelegramMessage(args: TelegramSendArgs): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    throw new Error(
      'Telegram not configured: set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID',
    );
  }

  const text =
    args.text.length > TELEGRAM_MAX_TEXT
      ? args.text.slice(0, TELEGRAM_MAX_TEXT - 1) + '…'
      : args.text;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TELEGRAM_TIMEOUT_MS);

  let resp: Response;
  try {
    resp = await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: args.parseMode ?? 'HTML',
        disable_web_page_preview: args.disableWebPagePreview ?? true,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    if ((err as { name?: string }).name === 'AbortError') {
      throw new Error('Telegram send timed out');
    }
    throw new Error(`Telegram fetch failed: ${(err as Error).message}`);
  }
  clearTimeout(timeout);

  let data: { ok?: boolean; description?: string; error_code?: number };
  try {
    data = (await resp.json()) as typeof data;
  } catch {
    throw new Error(`Telegram returned non-JSON (HTTP ${resp.status})`);
  }

  if (!resp.ok || data.ok !== true) {
    throw new Error(
      `Telegram send failed (code=${data.error_code ?? resp.status}): ${data.description ?? 'unknown'}`,
    );
  }
}
