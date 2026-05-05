import 'server-only';

const POSTMARK_EMAIL_API = 'https://api.postmarkapp.com/email';
const POSTMARK_TIMEOUT_MS = 15_000;

export interface PostmarkSendArgs {
  to: string;
  cc?: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
  messageStream?: string;
}

/**
 * Sends a transactional email via Postmark's HTTP API. Throws on any failure
 * (network, non-2xx, or non-zero ErrorCode in the JSON body) so callers'
 * existing try/catch wrapping a previous nodemailer call works unchanged.
 *
 * Required env: POSTMARK_SERVER_TOKEN (Server API Token), POSTMARK_FROM_EMAIL
 * (a verified Sender Signature or address on a verified domain).
 */
export async function sendPostmarkEmail(args: PostmarkSendArgs): Promise<{ messageId: string }> {
  const token = process.env.POSTMARK_SERVER_TOKEN;
  const from = process.env.POSTMARK_FROM_EMAIL;
  if (!token || !from) {
    throw new Error(
      'Postmark not configured: set POSTMARK_SERVER_TOKEN and POSTMARK_FROM_EMAIL',
    );
  }

  const payload: Record<string, string> = {
    From: from,
    To: args.to,
    Subject: args.subject,
    HtmlBody: args.html,
    TextBody: args.text,
    MessageStream: args.messageStream ?? 'outbound',
  };
  if (args.cc) payload.Cc = args.cc;
  if (args.replyTo) payload.ReplyTo = args.replyTo;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), POSTMARK_TIMEOUT_MS);

  let resp: Response;
  try {
    resp = await fetch(POSTMARK_EMAIL_API, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': token,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    if ((err as { name?: string }).name === 'AbortError') {
      throw new Error('Postmark send timed out');
    }
    throw new Error(`Postmark fetch failed: ${(err as Error).message}`);
  }
  clearTimeout(timeout);

  let data: { ErrorCode?: number; Message?: string; MessageID?: string };
  try {
    data = (await resp.json()) as typeof data;
  } catch {
    throw new Error(`Postmark returned non-JSON (HTTP ${resp.status})`);
  }

  if (!resp.ok || data.ErrorCode !== 0) {
    throw new Error(
      `Postmark send failed (code=${data.ErrorCode ?? resp.status}): ${data.Message ?? 'unknown'}`,
    );
  }

  return { messageId: data.MessageID ?? '' };
}
