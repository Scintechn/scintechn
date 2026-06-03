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
// Telemetry tag is stable so log searches in Vercel work: filter `[telegram]`.
const tag = '[telegram]';

export async function sendTelegramMessage(args: TelegramSendArgs): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  // Surfacing env presence is the #1 thing we want from production logs.
  // Tokens themselves are NOT logged — only "present + length" so we can tell
  // missing-vs-empty-string-vs-truncated-paste without leaking the secret.
  console.log(`${tag} env check`, {
    hasToken: !!token,
    tokenLen: token?.length ?? 0,
    hasChatId: !!chatId,
    chatIdLen: chatId?.length ?? 0,
    // Telegram chat IDs are 9-13 digit ints (or "-100…" for supergroups); the
    // first char tells us the rough shape without leaking the full id.
    chatIdPrefix: chatId ? chatId.slice(0, 2) : null,
  });

  if (!token || !chatId) {
    throw new Error(
      'Telegram not configured: set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID',
    );
  }

  const text =
    args.text.length > TELEGRAM_MAX_TEXT
      ? args.text.slice(0, TELEGRAM_MAX_TEXT - 1) + '…'
      : args.text;

  console.log(`${tag} sending`, {
    textLen: text.length,
    parseMode: args.parseMode ?? 'HTML',
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TELEGRAM_TIMEOUT_MS);

  let resp: Response;
  const startedAt = Date.now();
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
    const elapsed = Date.now() - startedAt;
    if ((err as { name?: string }).name === 'AbortError') {
      console.error(`${tag} fetch aborted (timeout)`, { elapsedMs: elapsed });
      throw new Error('Telegram send timed out');
    }
    console.error(`${tag} fetch threw`, { elapsedMs: elapsed, err: (err as Error).message });
    throw new Error(`Telegram fetch failed: ${(err as Error).message}`);
  }
  clearTimeout(timeout);

  const elapsedMs = Date.now() - startedAt;
  const rawBody = await resp.text().catch(() => '');
  console.log(`${tag} response`, {
    status: resp.status,
    ok: resp.ok,
    elapsedMs,
    bodyHead: rawBody.slice(0, 400),
  });

  let data: { ok?: boolean; description?: string; error_code?: number };
  try {
    data = JSON.parse(rawBody) as typeof data;
  } catch {
    throw new Error(`Telegram returned non-JSON (HTTP ${resp.status})`);
  }

  if (!resp.ok || data.ok !== true) {
    throw new Error(
      `Telegram send failed (code=${data.error_code ?? resp.status}): ${data.description ?? 'unknown'}`,
    );
  }
}
