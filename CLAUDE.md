# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Marketing site for **Scintechn** (scintechn.com) — an AI software house. Single-page Next.js 15 App Router site with bilingual content (**EN default for worldwide audience, PT secondary**) and a contact form backed by SMTP email. Legal entity: Scint Technologia Serviços Ltda · CNPJ 36.955.612/0001-85.

## Commands

```bash
npm run dev      # Next dev server on http://localhost:3000 (redirects to /en)
npm run build    # Production build
npm start        # Serve the production build
npm run lint     # next lint (eslint-config-next)
```

No test framework is configured — there are no `test`/`vitest`/`jest` scripts.

Localized URLs: `http://localhost:3000/en` (default) and `http://localhost:3000/pt`. Bare `/` returns a 307 redirect to `/en`. If a stale `next dev` process is squatting on a port, Next will pick the next free one (3001, 3002, …) — always confirm the actual port from the dev log before testing.

## Environment

`.env.local` is required for the contact and Spark APIs. See `.env.example`. Required variables:

- `POSTMARK_SERVER_TOKEN` — Postmark Server API Token (transactional email for both `/api/contact` and `/api/spark`)
- `POSTMARK_FROM_EMAIL` — verified Sender Signature or address on a verified Domain (e.g. `development@scintechn.com`)
- `RECIPIENT_EMAIL` — where contact submissions and Spark plans land (e.g. `contact@scintechn.com`)
- `OPENROUTER_API_KEY` — required for Spark; never exposed to client bundles
- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` — optional, enables distributed rate-limit and Spark daily-budget counter; in-memory fallback otherwise

## Architecture

### Routing & i18n
- App Router with a single dynamic locale segment: `app/[locale]/{layout,page,opengraph-image}.tsx`. The home page composes every section component; there are no other routes besides `/api/contact` and `/sitemap.xml`.
- Supported locales are declared in `i18n/request.ts` (`['pt', 'en'] as const`) and consumed by `middleware.ts` and `next.config.ts` (`createNextIntlPlugin('./i18n/request.ts')`).
- Default locale is **`'en'`** in both `i18n/request.ts` and `middleware.ts`. `localePrefix: 'always'` — every URL must carry `/en` or `/pt`.
- Middleware matcher is the canonical next-intl negative-lookahead pattern: `['/((?!api|_next|_vercel|.*\\..*).*)']` — runs middleware on all routes EXCEPT `/api/*`, `/_next/*`, `/_vercel/*`, and any path with a dot extension (so `sitemap.xml`, `robots.txt`, `favicon.ico`, opengraph images all bypass middleware).
- Translation strings live in `messages/{en,pt}.json`. **EN is the master copy**; PT mirrors it. Adding a key requires touching **both** files with identical key trees — `next-intl` will throw at runtime if a key is missing in one locale. Verify parity with: `diff <(jq -S 'paths|join(".")' messages/en.json) <(jq -S 'paths|join(".")' messages/pt.json)`.
- Server components call `getTranslations({ locale, namespace })`; client components call `useTranslations(namespace)`. Locale params are async (`params: Promise<{ locale: string }>`) — Next 15 convention.

### Component layer
- Page sections are imported and stacked in `app/[locale]/page.tsx`. Current order: `Header → Hero → Spark → Work → Approach → About → Contact → Footer`. The page also renders a skip-to-main-content link before the header. Reordering or removing one means editing that page file.
- Most section components are `'use client'` because they use Framer Motion scroll animations (`useInView`) or form state. Server components are limited to layout/page/metadata files.
- `components/ui/` is **shadcn/ui** (New York style, neutral base, Lucide icons — see `components.json`). Add new primitives via `npx shadcn@latest add <name>` rather than hand-rolling.
- Path alias `@/*` maps to the repo root (see `tsconfig.json`). Standard imports: `@/components/...`, `@/components/ui/...`, `@/lib/utils`, `@/hooks/use-toast`.
- `lib/utils.ts` exports `cn()` (clsx + tailwind-merge) — use it for conditional class composition.
- The portfolio (`Work.tsx`) hard-codes the 5 product card metadata (URL + stack chips); the rest of the card copy comes from translations under the `work.items.*` namespace. Adding a product means editing both `Work.tsx` and both translation files.

### Styling — brand v1 (May 2026)
- Tailwind is wired to HSL CSS variables in `app/globals.css` (`:root` + `.dark`). The brand palette:
  - **Ink** `#0B0F14` — `--foreground` — primary text (`hsl(213 29% 6%)`)
  - **Paper** `#F7F6F2` — `--background` — page surface (`hsl(48 26% 96%)`). NOT pure white; the kit explicitly forbids `#FFFFFF` as the ground.
  - **Violet** `#702DB4` — `--primary` — single accent (`hsl(270 60% 44%)`, ~7.7:1 on Paper, AAA). Reserved for CTAs, focused links, the highlighted span on the hero headline, and the violet block in the brand mark. Never gradient or tint it.
  - **Muted** `#6B7280` — `--muted-foreground` — captions, body secondary
  - Cards lift to `hsl(0 0% 100%)` for separation against Paper.
- Dark-mode tokens are defined but the site does not toggle dark mode.
- Brand assets live in `public/brand/` (9 SVGs: lockups, mark variants, wordmarks, favicon, app icon). `scintechn-lockup-light.svg` is the official header logo. See `docs/# Scintechn — Brand Kit.md` for the construction grid and rules.
- Fonts: **Inter Tight** (sans, body + display) and **JetBrains Mono** (mono, eyebrows + tags + footer micro-caps). Loaded via `next/font/google` in `app/[locale]/layout.tsx` (and root `app/layout.tsx`); exposed as `--font-inter-tight` / `--font-jetbrains-mono`. Use `font-mono` utility in `globals.css` for mono spans.
- Headline pattern: `tracking-tight leading-[1.05] text-balance font-bold`. Eyebrow pattern: `font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary`.
- Hero headline uses `t.rich('hero.title', { accent: ... })` — the `<accent>` placeholder in the translation wraps the violet-highlighted segment ("in weeks." / "em semanas.").
- Custom keyframes (`fadeIn`) live in `globals.css`, not the Tailwind config.

### Forms & API
- Contact form (`components/Contact.tsx`) uses **React Hook Form** (no Zod resolver — validation is built into RHF's `register` rules with translated error messages). POSTs to `/api/contact`.
- API route validates required fields, enforces max lengths (name 200, email 254, message 5000), strips CRLF from values used in email headers (header-injection protection), and HTML-escapes values used in the email body via shared `lib/html.ts` (XSS protection). Returns 400 on validation failure, 413 on length, 500 on send failure.
- Both `/api/contact` and `/api/spark` send transactional email via **Postmark HTTP API** (`lib/postmark.ts` — `sendPostmarkEmail()`, direct `fetch` to `api.postmarkapp.com/email`, no SDK). The From address (`POSTMARK_FROM_EMAIL`) must be a verified Sender Signature or on a verified Domain or Postmark returns `ErrorCode 412`.
- Both routes rate-limit via the shared factory in `lib/rate-limit.ts` (Upstash Redis when `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` are set, in-memory `Map` fallback otherwise). Contact: 3/min/IP. Spark: 5/hr/IP. Cloudflare Turnstile is still worth adding before the site goes wide.
- **Spark scoping endpoint (`/api/spark` + `components/Spark.tsx`)**: hero-adjacent engagement device that turns a one-line product idea into a structured 4-week build plan via Claude Haiku 4.5 (OpenRouter). Visitor pastes idea + email-or-mobile → server validates → calls OpenRouter → schema-validates response → emails the plan to RECIPIENT_EMAIL (and to the lead when contact is an email) → renders the plan in the UI. The result panel's "Talk to us about this →" CTA pre-fills the contact form via sessionStorage.
  - **Env**: `OPENROUTER_API_KEY` required (server-only, never reaches the client bundle). Email delivery uses the shared Postmark integration (`POSTMARK_SERVER_TOKEN` + `POSTMARK_FROM_EMAIL`). Optional Upstash vars enable distributed rate-limit + budget counter; otherwise in-memory fallback (fine on a single warm instance, resets on cold start).
  - **Daily $-cap**: `DAILY_BUDGET_USD = 5` in `lib/spark-budget.ts`; pre-flight `wouldExceedBudget` check + post-call `INCRBYFLOAT` (Upstash) or Map increment (in-memory). Returns 503 on exceed.
  - **Security**: per-request 16-byte hex nonce wraps user input as `<user_input id="${nonce}">…</user_input>`; control-char strip + tag-neutralization in `sanitizeIdea`; system-prompt SECURITY RULES block; OpenRouter `response_format: json_object`; output canary check (rejects responses containing `<user_input id=`, `INTERNAL APPROACH`, `OUTPUT FORMAT`, `SECURITY RULES`, `OPENROUTER_API_KEY`, `process.env`, the per-request nonce, or the refusal sentinel outside its dedicated field); schema + enum + length validation; markdown-fence stripping; honeypot + <2s dwell guard. Full threat model in `docs/spark-plan.md` §10.
  - **Bilingual**: Haiku detects input language and mirrors. Single codepath.
  - **Email failure handling**: deliberate deviation from "fail loud" — if `sendPostmarkEmail` throws (network, auth, sender-not-verified, or any non-zero ErrorCode), the lead (idea + plan + contact) is logged at `console.error` level and the plan is still returned 200 to the client. The lead is recoverable from the server log even when delivery is broken.
  - **Files**: `app/api/spark/route.ts`, `lib/spark-{types,security,budget,email}.ts`, `lib/prompts/spark.ts`, `lib/postmark.ts` (shared Postmark wrapper), `lib/html.ts` (shared escapeHtml extracted from contact route), `components/Spark.tsx`. Plan: `docs/spark-plan.md`.

### SEO / Analytics
- Metadata is generated per-locale in `app/[locale]/layout.tsx` (`generateMetadata` reads the `metadata` namespace) and re-exported per-page in `page.tsx`. `metadataBase` and `alternates.languages` are set so OG/canonical URLs resolve correctly.
- The root layout injects: GTM container `GTM-KPXTTSRQ`, an Organization JSON-LD block (with EN/PT in `availableLanguage`), and a noscript GTM iframe. Update the GTM ID and JSON-LD `description` there.
- `app/sitemap.ts` generates the sitemap; `app/[locale]/opengraph-image.tsx` produces the dynamic OG image. The OG image is rendered server-side (edge runtime) and currently hardcodes English copy — it does not localize per route.

## Reference docs in repo

`_backup_static/_docs_pre_repositioning/` (`MIGRATION.md`, `CONTRAST_FIXES.md`, `TRANSLATION_FIXES.md`) describe the **pre-repositioning** static-HTML → Next.js conversion and refer to components that no longer exist (TrustBadges, ROICalculator, Pricing, FAQ, LeadMagnet, Testimonials, etc.). Treat them as historical only — do not use them as guidance for current work. `_backup_static/` itself holds the original static HTML; do not modify or import from it.

## Repo conventions

- The default branch is `main`. `.github/workflows/` contains a Claude PR assistant + review workflow.
- `package-lock.json` is checked in; this is an npm project, not yarn/pnpm.
- React 18 + Next 15 — be careful copying patterns from RSC examples written for React 19 (e.g., `use()` hook).
