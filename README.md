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

## Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI**: Tailwind CSS + shadcn/ui (New York, Lucide icons)
- **i18n**: next-intl 3 — EN default, PT secondary, `localePrefix: always`
- **Animations**: Framer Motion
- **Forms**: React Hook Form
- **Email**: Nodemailer over SMTP
- **Analytics**: Google Tag Manager (`GTM-KPXTTSRQ`) via `next/script`

## Getting started

```bash
# Install
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your SMTP credentials

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

Required for the contact API. See `.env.example`.

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
RECIPIENT_EMAIL=contact@scintechn.com
```

Gmail requires an **App Password**, not the account password.

## Project structure

```
app/
├── [locale]/         # /en + /pt routes
│   ├── layout.tsx    # GTM, fonts, JSON-LD, metadata
│   ├── page.tsx      # Hero → Work → HowWeWork → About → Contact
│   └── opengraph-image.tsx
├── api/contact/      # SMTP-backed contact form (rate-limited, honeypot)
└── globals.css       # shadcn HSL variables — purple-on-white theme

components/
├── Header.tsx · Hero.tsx · Work.tsx · HowWeWork.tsx
├── About.tsx · Contact.tsx · Footer.tsx
└── ui/               # shadcn primitives

i18n/request.ts       # Locale config (default: 'en')
messages/{en,pt}.json # EN is master, PT mirrors
middleware.ts         # next-intl negative-lookahead matcher
```

See [`CLAUDE.md`](./CLAUDE.md) for architecture details and conventions.

## Legal

**Scint Technologia Serviços Ltda** · CNPJ 36.955.612/0001-85

## Contact

- Email: [contact@scintechn.com](mailto:contact@scintechn.com)
- WhatsApp: [+55 11 96911-1424](https://wa.me/5511969111424)
- LinkedIn: [in/scintylla](https://www.linkedin.com/in/scintylla/)
- Instagram: [@scintechn](https://www.instagram.com/scintechn/)

## License

Private — all rights reserved.
