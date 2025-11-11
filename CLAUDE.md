# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Scintechn corporate website - a modern Next.js application with TypeScript, Tailwind CSS, and internationalization (Portuguese/English). The site focuses on digital solutions and business automation services.

**Tech Stack**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion, next-intl
**Site Domain**: scintechn.com

## Architecture

### Next.js App Router Structure
```
app/
├── [locale]/          # Internationalized routes (pt, en)
│   ├── layout.tsx     # Root layout with fonts, GTM, structured data
│   ├── page.tsx       # Home page (all sections)
│   └── opengraph-image.tsx  # Dynamic OG image
├── api/
│   └── contact/
│       └── route.ts   # Contact form API endpoint
├── globals.css        # Global Tailwind styles + custom animations
└── sitemap.ts         # Dynamic sitemap generation

components/            # React components
├── Header.tsx         # Sticky navigation with language switcher
├── Hero.tsx           # Animated hero section with gradient
├── About.tsx          # About section with feature cards
├── Services.tsx       # Services grid
├── Projects.tsx       # Project showcase grid
├── Contact.tsx        # Contact form with React Hook Form
└── Footer.tsx         # Footer with social links

i18n/
└── request.ts         # next-intl configuration

messages/              # Translation files
├── pt.json           # Portuguese translations
└── en.json           # English translations
```

### Key Features

1. **Internationalization (i18n)**
   - Uses `next-intl` for translations
   - Locale prefix routing: `/pt/`, `/en/`
   - Translations in `messages/` directory
   - Automatic locale detection via middleware

2. **Animations**
   - Framer Motion for scroll-triggered animations
   - Custom CSS animations for hero section (blob animation)
   - Smooth scroll behavior for anchor navigation

3. **Form Handling**
   - React Hook Form for client-side validation
   - API route at `app/api/contact/route.ts`
   - Nodemailer for email sending
   - Proper error handling and user feedback

4. **SEO & Performance**
   - Server components by default
   - Automatic image optimization with Next.js Image
   - Google Fonts optimization (Roboto, Merriweather)
   - OpenGraph images
   - Structured data (JSON-LD)
   - Dynamic sitemap generation
   - GTM integration for analytics

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

The dev server runs on `http://localhost:3000`
- Portuguese: `http://localhost:3000/pt`
- English: `http://localhost:3000/en`

## Environment Variables

Create `.env.local` file (see `.env.example`):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
RECIPIENT_EMAIL=contact@scintechn.com
```

**Important**: Never commit `.env.local` to version control. Use app-specific passwords for Gmail, not your account password.

## Component Architecture

### Server Components (Default)
- `app/[locale]/page.tsx` - Main page
- `app/[locale]/layout.tsx` - Root layout
- All metadata generation

### Client Components ('use client')
- `Header.tsx` - Needs useState for menu toggle, scroll detection
- `Hero.tsx` - Framer Motion animations
- `About.tsx`, `Services.tsx`, `Projects.tsx` - Scroll animations
- `Contact.tsx` - Form state management
- `Footer.tsx` - Interactive elements

## Styling Approach

- **Tailwind CSS**: Utility-first for rapid development
- **Custom colors**: Defined in `tailwind.config.ts`
  - `primary`: #4e54c8 (brand blue)
  - `secondary`: #8f94fb (lighter blue)
- **Font variables**: CSS variables for Roboto (sans) and Merriweather (serif)
- **Responsive**: Mobile-first with Tailwind breakpoints (sm, md, lg, xl)

## Common Development Tasks

### Adding New Content Section
1. Create component in `components/`
2. Add translations to `messages/pt.json` and `messages/en.json`
3. Import and add to `app/[locale]/page.tsx`
4. Update navigation links in `Header.tsx` if needed

### Modifying Translations
Edit files in `messages/` directory:
- `pt.json` - Portuguese
- `en.json` - English

### Updating Contact Form
1. **Add field**: Edit `components/Contact.tsx` - add to `FormData` type and form JSX
2. **API handling**: Modify `app/api/contact/route.ts` to process new field
3. **Email template**: Update HTML template in API route

### Changing Colors/Branding
1. Update `tailwind.config.ts` for color palette
2. Modify logo references in `Header.tsx` and `Footer.tsx`
3. Update gradient in `Hero.tsx` component

### SEO Updates
- **Metadata**: Edit `app/[locale]/layout.tsx` - `generateMetadata()` function
- **Structured data**: Modify JSON-LD in layout head
- **Translations**: Update `messages/{locale}.json` - `metadata` namespace

## Email Configuration

The contact form uses Nodemailer with SMTP:
- Configure via environment variables
- For Gmail: Enable 2FA and use App Password
- Email template in `app/api/contact/route.ts` includes HTML styling
- Form validation prevents empty/invalid submissions

## Important Notes

1. **Image Optimization**: Always use `next/image` component, images in `public/` directory
2. **Font Loading**: Configured in layout with `next/font/google` for optimal performance
3. **Middleware**: Handles locale detection and routing - see `middleware.ts`
4. **Static Assets**: Place in `public/` directory (images, fonts, favicon)
5. **Build Output**: Next.js generates optimized static pages where possible

## Backup

Original static HTML files are preserved in `_backup_static/` directory for reference.
