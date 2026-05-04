import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const MAX_NAME = 200;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;

const RATE_WINDOW_MS = 60_000; // 1 minute
const RATE_MAX = 3; // 3 submissions / window / IP

// --- Rate-limit backend selection -----------------------------------------
// Production: Upstash Redis when both env vars are set (durable, survives
// cold starts, works across serverless instances).
// Dev / fallback: in-memory Map (good enough on a single warm instance).

const upstashLimiter = (() => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(RATE_MAX, '60 s'),
    prefix: 'scintechn:contact',
    analytics: true,
  });
})();

const ipHits = new Map<string, number[]>();

function inMemoryCheck(ip: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const cutoff = now - RATE_WINDOW_MS;
  const hits = (ipHits.get(ip) || []).filter((t) => t > cutoff);
  if (hits.length >= RATE_MAX) {
    const retryAfter = Math.ceil((hits[0]! + RATE_WINDOW_MS - now) / 1000);
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

async function checkRateLimit(ip: string): Promise<{ ok: boolean; retryAfter: number }> {
  if (upstashLimiter) {
    const { success, reset } = await upstashLimiter.limit(ip);
    if (success) return { ok: true, retryAfter: 0 };
    return { ok: false, retryAfter: Math.max(Math.ceil((reset - Date.now()) / 1000), 1) };
  }
  return inMemoryCheck(ip);
}

function getClientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  const real = request.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}

const stripCrlf = (s: string) => s.replace(/[\r\n]+/g, ' ').trim();

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rate = await checkRateLimit(ip);
    if (!rate.ok) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfter) } }
      );
    }

    const body = await request.json();

    // Honeypot — hidden field real users never fill. 200 silently on trip
    // so bots can't probe the trap.
    if (typeof body.website === 'string' && body.website.trim() !== '') {
      return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
    }

    const rawName = typeof body.name === 'string' ? body.name : '';
    const rawEmail = typeof body.email === 'string' ? body.email : '';
    const rawMessage = typeof body.message === 'string' ? body.message : '';

    if (!rawName.trim() || !rawEmail.trim() || !rawMessage.trim()) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (
      rawName.length > MAX_NAME ||
      rawEmail.length > MAX_EMAIL ||
      rawMessage.length > MAX_MESSAGE
    ) {
      return NextResponse.json({ error: 'Input too long' }, { status: 413 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(rawEmail)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const safeName = stripCrlf(rawName).slice(0, MAX_NAME);
    const safeEmail = stripCrlf(rawEmail).slice(0, MAX_EMAIL);

    const htmlName = escapeHtml(safeName);
    const htmlEmail = escapeHtml(safeEmail);
    const htmlMessage = escapeHtml(rawMessage).replace(/\n/g, '<br>');

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, hsl(270 60% 44%) 0%, hsl(270 50% 60%) 100%); color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f7f7f8; padding: 28px; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 18px; }
            .label { font-weight: 600; color: hsl(270 60% 44%); font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; }
            .value { margin-top: 6px; padding: 12px 14px; background: white; border-radius: 6px; border: 1px solid #e5e5e9; }
            .footer { text-align: center; margin-top: 18px; color: #6b6b75; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin:0;font-size:20px;">New contact form submission</h1>
              <p style="margin:6px 0 0 0;opacity:0.9;">From scintechn.com</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Name</div>
                <div class="value">${htmlName}</div>
              </div>
              <div class="field">
                <div class="label">Email</div>
                <div class="value">${htmlEmail}</div>
              </div>
              <div class="field">
                <div class="label">Message</div>
                <div class="value">${htmlMessage}</div>
              </div>
            </div>
            <div class="footer">
              <p>Sent from the Scintechn contact form &middot; &copy; ${new Date().getFullYear()} Scint Technologia Serviços Ltda</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Scintechn Contact Form" <${process.env.SMTP_USER}>`,
      to: process.env.RECIPIENT_EMAIL || process.env.SMTP_USER,
      replyTo: safeEmail,
      subject: `New contact from ${safeName}`,
      html: emailHtml,
      text: `Name: ${safeName}\nEmail: ${safeEmail}\n\nMessage:\n${rawMessage}`,
    });

    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
