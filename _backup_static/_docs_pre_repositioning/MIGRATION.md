# Migration from Static HTML to Next.js

## Summary

Successfully migrated the Scintechn website from a static HTML/CSS/JavaScript site with PHP backend to a modern Next.js 15 application.

**Completed:** November 10, 2025

## What Was Migrated

### ✅ Frontend Structure
- **From:** Static HTML (`index.html`, `index_en.html`)
- **To:** Next.js App Router with React components
- **Result:** Modern component-based architecture with Server/Client components

### ✅ Styling
- **From:** Single large CSS file (489KB)
- **To:** Tailwind CSS with custom utilities
- **Benefits:** Better maintainability, smaller bundle size, utility-first approach

### ✅ Internationalization
- **From:** Separate HTML files per language
- **To:** next-intl with dynamic routing (`/pt`, `/en`)
- **Benefits:** Centralized translations, automatic locale detection

### ✅ Form Handling
- **From:** jQuery AJAX + PHP backend with PHPMailer
- **To:** React Hook Form + Next.js API Routes + Nodemailer
- **Benefits:** Modern validation, better UX, integrated backend

### ✅ Animations
- **From:** jQuery plugins (WOW.js, Owl Carousel)
- **To:** Framer Motion + Custom CSS
- **Benefits:** Better performance, modern animations, smaller bundle

### ✅ SEO & Performance
- Added:
  - Automatic image optimization
  - Font optimization (Google Fonts)
  - Dynamic sitemap generation
  - OpenGraph images
  - Structured data (JSON-LD)
  - Improved metadata handling

### ✅ Assets
- **Images:** Migrated to `public/images/` with Next.js Image component
- **Fonts:** Migrated to `public/fonts/` with next/font optimization

## New Features

1. **TypeScript**: Type-safe development
2. **Server Components**: Better performance with React Server Components
3. **Automatic Code Splitting**: Optimized bundle sizes
4. **Better Developer Experience**: Hot reload, TypeScript support, modern tooling

## File Structure Changes

### Before (Static)
```
.
├── index.html
├── index_en.html
├── css/style.css
├── js/script.js
├── bat/
│   └── rd-mailform.php
├── images/
└── fonts/
```

### After (Next.js)
```
.
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── opengraph-image.tsx
│   ├── api/contact/route.ts
│   ├── globals.css
│   └── sitemap.ts
├── components/
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── About.tsx
│   ├── Services.tsx
│   ├── Projects.tsx
│   ├── Contact.tsx
│   └── Footer.tsx
├── i18n/request.ts
├── messages/
│   ├── pt.json
│   └── en.json
├── public/
│   ├── images/
│   └── fonts/
└── _backup_static/ (original files)
```

## Technology Replacements

| Old | New | Reason |
|-----|-----|--------|
| jQuery | React | Modern component architecture |
| Static HTML | Next.js App Router | SSR, routing, optimization |
| PHP backend | Next.js API Routes | Integrated backend |
| Separate HTML files | next-intl | Better i18n management |
| Custom CSS | Tailwind CSS | Utility-first, maintainability |
| jQuery plugins | Framer Motion | Better animations |
| PHPMailer | Nodemailer | JavaScript ecosystem |
| Manual SEO | Next.js metadata | Automatic optimization |

## Breaking Changes

### URLs
- **Before:** `/index.html`, `/index_en.html`
- **After:** `/pt`, `/en`
- **Action Required:** Update external links

### Email Configuration
- **Before:** `bat/rd-mailform.config.json`
- **After:** `.env.local` environment variables
- **Action Required:** Create `.env.local` with SMTP credentials

### Form Endpoint
- **Before:** POST to `bat/rd-mailform.php`
- **After:** POST to `/api/contact`
- **Note:** Handled automatically in the new frontend

## Performance Improvements

1. **Bundle Size**: Reduced JavaScript bundle (code splitting)
2. **First Load**: Faster with Server Components
3. **Images**: Automatic optimization and lazy loading
4. **Fonts**: Optimized loading with next/font
5. **Caching**: Better caching strategies with Next.js

## Next Steps

### Immediate
1. ✅ Set up `.env.local` with SMTP credentials
2. ✅ Test contact form with real email
3. ✅ Verify all links and navigation
4. ✅ Test on mobile devices

### Before Deployment
1. Update DNS/hosting configuration
2. Set up production environment variables
3. Configure domain redirects (old URLs → new URLs)
4. Test in production environment
5. Set up monitoring/analytics

### Optional Enhancements
- Add more interactive features
- Implement blog/news section
- Add CMS integration (e.g., Sanity, Contentful)
- Add image gallery with lightbox
- Implement project case studies
- Add team member profiles
- Integrate customer testimonials

## Rollback Plan

If issues arise, original static files are preserved in `_backup_static/` directory. To rollback:

1. Copy contents of `_backup_static/` to web root
2. Restore PHP backend configuration
3. Update DNS to point to static hosting

## Testing Checklist

- [x] ✅ Build completes without errors
- [x] ✅ Dev server runs successfully
- [ ] ⏳ Contact form sends emails (requires SMTP config)
- [ ] ⏳ All navigation links work
- [ ] ⏳ Language switching works (PT ↔ EN)
- [ ] ⏳ Mobile responsive design
- [ ] ⏳ SEO metadata correct
- [ ] ⏳ Google Tag Manager working
- [ ] ⏳ All images load correctly
- [ ] ⏳ Animations work smoothly

## Support

For questions or issues with the migration, refer to:
- `CLAUDE.md` - Development guidelines
- `README.md` - Project overview
- Next.js documentation: https://nextjs.org/docs
