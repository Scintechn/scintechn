import en from '@/messages/en.json';
import { SITE, capabilities, products } from '@/lib/site-data';

/**
 * /llms.txt — the machine-readable index of this site, per llmstxt.org.
 *
 * Route handlers live outside the [locale] segment and therefore have no
 * next-intl request scope, so the copy is imported straight from the EN
 * message file (EN is the master copy). middleware.ts does not touch paths
 * containing a dot, so this is served as-is rather than redirected to /en.
 */

export const dynamic = 'force-static';

const TEXT_HEADERS = {
  'Content-Type': 'text/plain; charset=utf-8',
  'Cache-Control': 'public, max-age=3600, s-maxage=86400',
};

export function GET() {
  const work = products.map((product) => {
    const item = en.work.items[product.key];
    const label = product.url
      ? `[${item.name}](${product.url})`
      : `${item.name} (${en.work.inDevelopment})`;
    return `- ${label}: ${item.tagline} — ${item.vertical}. ${item.description} Stack: ${product.stack.join(', ')}.`;
  });

  const services = capabilities.map(({ key, stack }) => {
    const item = en.capabilities.items[key];
    return `- ${item.title}: ${item.description} Tooling: ${stack.join(', ')}.`;
  });

  const body = `# ${SITE.name}

> ${en.metadata.description}
> ${SITE.legalName} · CNPJ ${SITE.cnpj} · ${SITE.contactEmail}

## Full content

- [Everything on one page, in markdown](${SITE.baseUrl}/llms-full.txt): company, capabilities, delivery approach and every shipped product.

## Work

${work.join('\n')}

## Capabilities

${services.join('\n')}

## Site

- [Home (English)](${SITE.baseUrl}/en): the full one-page site.
- [Home (Portuguese)](${SITE.baseUrl}/pt): the same content in pt-BR.
- [Contact](${SITE.baseUrl}/en#contact): contact form, or email ${SITE.contactEmail}.
`;

  return new Response(body, { headers: TEXT_HEADERS });
}
