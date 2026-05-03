import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n/request';

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: 'en',

  // Always use prefix for locale (e.g., /pt/about, /en/about)
  localePrefix: 'always'
});

export const config = {
  // Match all paths except Next.js internals, API routes, and static assets
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
