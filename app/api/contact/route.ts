import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const MAX_NAME = 200;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;

// Per-IP rate limit. Module-scoped Map persists across requests within a warm
// lambda / dev process. This is a coarse first-line defense — not bulletproof
// across serverless cold starts. For production-grade, swap for Upstash Redis
// or Cloudflare Turnstile; the route shape stays the same.
const RATE_WINDOW_MS = 60_000; // 1 minute
const RATE_MAX = 3; // 3 submissions per minute per IP
const ipHits = new Map<string, number[]>();

function getClientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  const real = request.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}

function checkRateLimit(ip: string): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  const cutoff = now - RATE_WINDOW_MS;
  const hits = (ipHits.get(ip) || []).filter((t) => t > cutoff);

  if (hits.length >= RATE_MAX) {
    const retryAfter = Math.ceil((hits[0]! + RATE_WINDOW_MS - now) / 1000);
    return { ok: false, retryAfter: Math.max(retryAfter, 1) };
  }

  hits.push(now);
  ipHits.set(ip, hits);

  // Opportunistic GC — keeps the Map from growing unbounded under load
  if (ipHits.size > 1000) {
    for (const [k, v] of ipHits) {
      const fresh = v.filter((t) => t > cutoff);
      if (fresh.length === 0) ipHits.delete(k);
      else ipHits.set(k, fresh);
    }
  }

  return { ok: true };
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
    const rate = checkRateLimit(ip);
    if (!rate.ok) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfter) } }
      );
    }

    const body = await request.json();

    // Honeypot — hidden field real users never fill. Bots that auto-fill all
    // inputs trip it. Return 200 silently so the bot can't probe for the trap.
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
