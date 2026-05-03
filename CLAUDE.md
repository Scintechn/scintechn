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
- Page sections are imported and stacked in `app/[locale]/page.tsx`. Current order: `Header → Hero → Work → HowWeWork → About → Contact → Footer`. The page also renders a skip-to-main-content link before the header. Reordering or removing one means editing that page file.
- Most section components are `'use client'` because they use Framer Motion scroll animations (`useInView`) or form state. Server components are limited to layout/page/metadata files.
- `components/ui/` is **shadcn/ui** (New York style, neutral base, Lucide icons — see `components.json`). Add new primitives via `npx shadcn@latest add <name>` rather than hand-rolling.
- Path alias `@/*` maps to the repo root (see `tsconfig.json`). Standard imports: `@/components/...`, `@/components/ui/...`, `@/lib/utils`, `@/hooks/use-toast`.
- `lib/utils.ts` exports `cn()` (clsx + tailwind-merge) — use it for conditional class composition.
- The portfolio (`Work.tsx`) hard-codes the 5 product card metadata (URL + stack chips); the rest of the card copy comes from translations under the `work.items.*` namespace. Adding a product means editing both `Work.tsx` and both translation files.

### Styling
- Tailwind is wired to shadcn HSL CSS variables defined in `app/globals.css` (`:root` and `.dark` blocks). `tailwind.config.ts` references them as `hsl(var(--primary))` etc.
- **Theme: white surface, near-black text, single purple accent.** `--primary` is `hsl(270 60% 44%)` (~7.7:1 contrast on white, AAA). Purple is reserved for CTAs, focused links, and highlights — body uses `--background` / `--foreground` / `--muted-foreground`. Don't introduce gradient backgrounds or full-bleed brand colors; the design relies on minimalism with one accent.
- `tailwind.config.ts` still has a legacy hardcoded `primary.dark: '#3d42a0'` token from the old blue theme. It's not referenced anywhere; safe to remove if you touch the file.
- Dark-mode HSL variables are defined but the site does not toggle dark mode — no theme switcher is wired up.
- Custom keyframes (`fadeIn`) live in `globals.css`, not the Tailwind config.
- Fonts: Roboto (sans, default) and Merriweather (serif, used for headings) loaded via `next/font/google` in `app/[locale]/layout.tsx` and exposed as `--font-roboto` / `--font-merriweather` Tailwind variables.

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
