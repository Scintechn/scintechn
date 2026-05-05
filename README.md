# Scintechn

Marketing site for **Scintechn** — an AI software house. We design, build and ship AI-powered SaaS products. Delivery-led, worldwide.

Built with Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, and next-intl.

🌐 **scintechn.com**

## What we build

The portfolio rendered on the site:

| Product | Vertical | Live |
|---|---|---|
| **FlowDeski** | White-label business OS | [flowdeski.com](https://flowdeski.com) |
| **Rentfy** | Proptech — landlord management | [getrentfy.com](https://www.getrentfy.com) |
| **Rio Patinação** | Sports operations + public site | [riopatinacao.com](https://www.riopatinacao.com) |
| **Carna26 Rio** | Consumer events / Carnival 2026 | [carna26-rio.vercel.app](https://carna26-rio.vercel.app/discover) |
| **Mayway** | EdTech — English school | [mayway.vercel.app](https://mayway.vercel.app/en) |

## Site features

- **Bilingual** EN (default, worldwide) / PT (secondary), via `next-intl` with `localePrefix: 'always'`.
- **Spark** (`/api/spark` + `<Spark />` section): a hero-adjacent engagement device that turns a one-line product idea into a structured 4-week build plan via Claude Haiku 4.5 (OpenRouter). Every plan includes a **Cost of Inaction** estimate — a server-locked currency-banded projection of what waiting costs the business, anchored to a numeric calculation chain. Plan emails to `RECIPIENT_EMAIL` and to the lead. Per-IP rate limit (5/hr), daily $5 budget cap, multi-layer prompt-injection + hallucination defenses (currency lock, output canary, schema validation with non-zero digit requirement, single-retry on validation failure). See [`docs/spark-plan.md`](docs/spark-plan.md) for the full design and threat model.
- **Contact form** (`/api/contact`): RHF + Postmark, rate-limited, honeypot + CRLF/HTML hardening.
- **Dynamic OG image** rendered server-side at `/[locale]/opengraph-image`.
- **Sitemap + JSON-LD Organization** for SEO.

## Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI**: Tailwind CSS + shadcn/ui (New York, Lucide icons)
- **i18n**: next-intl 3 — EN default, PT secondary, `localePrefix: 'always'`
- **Animations**: Framer Motion
- **Forms**: React Hook Form
- **AI**: OpenRouter (`anthropic/claude-haiku-4.5`) for the Spark scoping engine
- **Email**: Postmark HTTP API (transactional, both contact form + Spark)
- **Rate limit + budget counter**: Upstash Redis when configured, in-memory `Map` fallback
- **Phone validation**: `libphonenumber-js/max` (server-only, behind `'server-only'`)
- **Analytics**: Google Tag Manager (`GTM-KPXTTSRQ`) via `next/script`

## Getting started

```bash
# Install
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Postmark + OpenRouter credentials

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — bare `/` redirects to `/en`. PT version at [http://localhost:3000/pt](http://localhost:3000/pt).

If port 3000 is occupied, Next picks the next free port — check the dev log for the actual URL.

## Production

```bash
npm run build
npm start
```

## Environment variables

Required for the contact + Spark APIs. See `.env.example`.

```env
# Email — Postmark (required for both /api/contact and /api/spark)
POSTMARK_SERVER_TOKEN=        # Server API Token from postmarkapp.com
POSTMARK_FROM_EMAIL=          # Verified Sender Signature or domain address
RECIPIENT_EMAIL=              # Where contact + Spark plans land

# OpenRouter (required for /api/spark — Claude Haiku 4.5 via OpenRouter)
OPENROUTER_API_KEY=           # Server-only, never bundled to the client
```

Optional — distributed rate-limit and Spark daily-budget counter (in-memory fallback otherwise):

```env
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

The Postmark From address must be a **verified Sender Signature** or an address on a **verified Domain** (DKIM + Return-Path on DNS). During Postmark's pending-approval period, sends are restricted to recipients on the From domain — request approval before sending to external addresses.

## Project structure

```
app/
├── [locale]/                # /en + /pt routes
│   ├── layout.tsx           # GTM, fonts, JSON-LD, metadata
│   ├── page.tsx             # Hero → Spark → Work → Approach → About → Contact
│   └── opengraph-image.tsx
├── api/
│   ├── contact/             # Contact form (Postmark, rate-limited, honeypot)
│   └── spark/               # Scoping engine (Haiku via OpenRouter)
└── globals.css              # shadcn HSL variables — Ink/Paper/Violet brand v1

components/
├── Header.tsx · Hero.tsx · Spark.tsx · Work.tsx
├── Approach.tsx · About.tsx · Contact.tsx · Footer.tsx
└── ui/                      # shadcn primitives

lib/
├── rate-limit.ts            # Shared factory (Upstash + in-memory fallback)
├── postmark.ts              # Postmark HTTP API wrapper
├── html.ts                  # escapeHtml (shared between routes)
├── spark-types.ts           # SparkPlan / SparkRisk / SparkPhase / SparkRefusal
├── spark-security.ts        # Nonce, sanitization, canary, schema validation
├── spark-budget.ts          # Daily $-cap (Upstash INCRBYFLOAT or in-memory)
├── spark-email.ts           # Plan render (HTML + text) + Postmark send
├── spark-validation.ts      # Email + E.164 mobile validation
└── prompts/spark.ts         # System prompt + few-shot examples (EN + PT)

i18n/request.ts              # Locale config (default: 'en')
messages/{en,pt}.json        # EN is master, PT mirrors (jq parity required)
middleware.ts                # next-intl negative-lookahead matcher
```

See [`CLAUDE.md`](./CLAUDE.md) for architecture details and conventions, and [`docs/spark-plan.md`](./docs/spark-plan.md) for the Spark design + threat model + as-built notes.

## Legal

**Scint Technologia Serviços Ltda** · CNPJ 36.955.612/0001-85

## Contact

- Email: [contact@scintechn.com](mailto:contact@scintechn.com)
- WhatsApp BR: [+55 11 96911-1424](https://wa.me/5511969111424)
- WhatsApp PT: [+351 931 852 422](https://wa.me/351931852422)
- LinkedIn: [in/scintylla](https://www.linkedin.com/in/scintylla/)
- Instagram: [@scintechn](https://www.instagram.com/scintechn/)

## License

Private — all rights reserved.
