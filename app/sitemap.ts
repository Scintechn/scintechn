import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site-data';

/**
 * The site is a single page per locale — there are no /about, /services,
 * /projects or /contact routes (those are in-page anchors), so the sitemap
 * lists exactly the two URLs that resolve.
 *
 * lastModified is fixed at module scope so the value is stable for a given
 * build instead of changing on every request.
 */

const LAST_MODIFIED = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    SITE.locales.map((locale) => [locale, `${SITE.baseUrl}/${locale}`]),
  );

  return SITE.locales.map((locale) => ({
    url: `${SITE.baseUrl}/${locale}`,
    lastModified: LAST_MODIFIED,
    changeFrequency: 'weekly',
    priority: 1,
    alternates: { languages },
  }));
}
