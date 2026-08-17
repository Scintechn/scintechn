import { SITE, allTechnologies, capabilities, products } from '@/lib/site-data';

/**
 * schema.org JSON-LD builders, emitted as one @graph from the locale layout.
 *
 * The nodes cross-reference by @id (#organization, #website) so a consumer
 * resolves them as one entity instead of three unrelated blobs. Copy is passed
 * in from the caller's `getTranslations` so the graph is localized per route;
 * everything locale-independent comes from lib/site-data.ts.
 */

type LocalizedText = (key: string) => string;

const ORGANIZATION_ID = `${SITE.baseUrl}/#organization`;
const WEBSITE_ID = `${SITE.baseUrl}/#website`;

/** BCP 47 tags — schema.org expects the regional form for pt-BR. */
function inLanguage(locale: string): string {
  return locale === 'pt' ? 'pt-BR' : 'en';
}

export function organizationSchema(description: string, tCapabilities: LocalizedText) {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE.name,
    alternateName: 'Scintech Services',
    legalName: SITE.legalName,
    url: SITE.baseUrl,
    logo: `${SITE.baseUrl}/brand/scintechn-lockup-light.svg`,
    description,
    sameAs: SITE.sameAs,
    identifier: {
      '@type': 'PropertyValue',
      name: 'CNPJ',
      value: SITE.cnpj,
    },
    knowsAbout: allTechnologies(),
    contactPoint: {
      '@type': 'ContactPoint',
      email: SITE.contactEmail,
      contactType: 'sales',
      availableLanguage: ['en', 'pt'],
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: tCapabilities('title'),
      itemListElement: capabilities.map(({ key }) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: tCapabilities(`items.${key}.title`),
          description: tCapabilities(`items.${key}.description`),
          serviceType: tCapabilities(`items.${key}.title`),
          provider: { '@id': ORGANIZATION_ID },
        },
      })),
    },
  };
}

/**
 * The shipped products as an ItemList of SoftwareApplication nodes — this is
 * what makes the portfolio legible to structured-data consumers, which
 * previously saw no work at all.
 */
export function workItemListSchema(tWork: LocalizedText) {
  return {
    '@type': 'ItemList',
    '@id': `${SITE.baseUrl}/#work`,
    name: tWork('title'),
    description: tWork('subtitle'),
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'SoftwareApplication',
        name: tWork(`items.${product.key}.name`),
        description: tWork(`items.${product.key}.description`),
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: tWork(`items.${product.key}.vertical`),
        slogan: tWork(`items.${product.key}.tagline`),
        keywords: product.stack.join(', '),
        operatingSystem: 'Web',
        creator: { '@id': ORGANIZATION_ID },
        ...(product.url ? { url: product.url } : {}),
      },
    })),
  };
}

export function websiteSchema(locale: string, name: string, description: string) {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE.baseUrl}/${locale}`,
    name,
    description,
    inLanguage: inLanguage(locale),
    publisher: { '@id': ORGANIZATION_ID },
  };
}

export function siteGraph({
  locale,
  title,
  description,
  tWork,
  tCapabilities,
}: {
  locale: string;
  title: string;
  description: string;
  tWork: LocalizedText;
  tCapabilities: LocalizedText;
}) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationSchema(description, tCapabilities),
      websiteSchema(locale, title, description),
      workItemListSchema(tWork),
    ],
  };
}
