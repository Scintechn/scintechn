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

`.env.local` is required for the contact API to work. See `.env.example`. Variables consumed by `app/api/contact/route.ts`:

- `SMTP_HOST`, `SMTP_PORT` (defaults: smtp.gmail.com:465, secure SSL)
- `SMTP_USER`, `SMTP_PASSWORD` (Gmail requires an App Password, not the account password)
- `RECIPIENT_EMAIL` (falls back to `SMTP_USER` if unset)

## Architecture

### Routing & i18n
- App Router with a single dynamic locale segment: `app/[locale]/{layout,page,opengraph-image}.tsx`. The home page composes every section component; there are no other routes besides `/api/contact` and `/sitemap.xml`.
- Supported locales are declared in `i18n/request.ts` (`['pt', 'en'] as const`) and consumed by `middleware.ts` and `next.config.ts` (`createNextIntlPlugin('./i18n/request.ts')`).
- Default locale is **`'en'`** in both `i18n/request.ts` and `middleware.ts`. `localePrefix: 'always'` — every URL must carry `/en` or `/pt`.
- Middleware matcher is the canonical next-intl negative-lookahead pattern: `['/((?!api|_next|_vercel|.*\\..*).*)']` — runs middleware on all routes EXCEPT `/api/*`, `/_next/*`, `/_vercel/*`, and any path with a dot extension (so `sitemap.xml`, `robots.txt`, `favicon.ico`, opengraph images all bypass middleware).
- Translation strings live in `messages/{en,pt}.json`. **EN is the master copy**; PT mirrors it. Adding a key requires touching **both** files with identical key trees — `next-intl` will throw at runtime if a key is missing in one locale. Verify parity with: `diff <(jq -S 'paths|join(".")' messages/en.json) <(jq -S 'paths|join(".")' messages/pt.json)`.
- Server components call `getTranslations({ locale, namespace })`; client components call `useTranslations(namespace)`. Locale params are async (`params: Promise<{ locale: string }>`) — Next 15 convention.

### Component layer
- Page sections are imported and stacked in `app/[locale]/page.tsx`. Current order: `Header → Hero → Work → Approach → About → Contact → Footer`. The page also renders a skip-to-main-content link before the header. Reordering or removing one means editing that page file.
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
- API route validates required fields, enforces max lengths (name 200, email 254, message 5000), strips CRLF from values used in SMTP headers (header-injection protection), and HTML-escapes values used in the email body (XSS protection). Sends through Nodemailer; returns 400 on validation failure, 413 on length, 500 on send failure.
- **No rate limiting** — anyone on the internet can POST. Add Vercel KV throttle, Cloudflare Turnstile, or similar before the site goes wide.

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
