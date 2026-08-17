import en from '@/messages/en.json';
import { SITE, capabilities, products } from '@/lib/site-data';

/**
 * /llms-full.txt — the whole one-pager as a single clean markdown document, so
 * an agent can capture everything Scintechn does in one fetch instead of
 * parsing the rendered app shell. Same EN-only, no-request-scope reasoning as
 * app/llms.txt/route.ts.
 */

export const dynamic = 'force-static';

const TEXT_HEADERS = {
  'Content-Type': 'text/plain; charset=utf-8',
  'Cache-Control': 'public, max-age=3600, s-maxage=86400',
};

/**
 * hero.title carries next-intl rich-text placeholders (<accent>, <break>) that
 * the component fills with markup — they are not HTML and must not reach a
 * plain-text reader. <break></break> stands in for a line break; drop it.
 */
function stripRichTextTags(value: string): string {
  return value
    .replace(/<break><\/break>/g, ' ')
    .replace(/<\/?[a-z]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function GET() {
  const productSections = products.map((product) => {
    const item = en.work.items[product.key];
    return [
      `### ${item.name}`,
      '',
      `- Vertical: ${item.vertical}`,
      `- Positioning: ${item.tagline}`,
      `- Live: ${product.url ?? en.work.inDevelopment}`,
      `- Stack: ${product.stack.join(', ')}`,
      '',
      item.description,
    ].join('\n');
  });

  const capabilitySections = capabilities.map(({ key, stack }) => {
    const item = en.capabilities.items[key];
    return [`### ${item.title}`, '', item.description, '', `Tooling: ${stack.join(', ')}`].join(
      '\n',
    );
  });

  const pillars = (
    ['scope', 'cadence', 'stack', 'ownership'] as const
  ).map((key) => {
    const pillar = en.approach.pillars[key];
    return `### ${pillar.title}\n\n${pillar.description}`;
  });

  const body = `# ${en.metadata.title}

${en.metadata.description}

- Website: ${SITE.baseUrl}/en (English), ${SITE.baseUrl}/pt (Portuguese)
- Contact: ${SITE.contactEmail}
- Legal entity: ${SITE.legalName}, CNPJ ${SITE.cnpj}
- Positioning: ${stripRichTextTags(en.hero.title)} ${en.hero.subtitle}

## Capabilities

${en.capabilities.subtitle}

${capabilitySections.join('\n\n')}

${en.capabilities.footnote}

## Work

${en.work.subtitle}

${productSections.join('\n\n')}

## Approach

${en.approach.subtitle}

${pillars.join('\n\n')}

## About

${en.about.title}

${en.about.paragraph1}

${en.about.paragraph2}

${en.about.paragraph3}

## Contact

${en.contact.subtitle}

- Email: ${SITE.contactEmail}
- Contact form: ${SITE.baseUrl}/en#contact
- Profiles: ${SITE.sameAs.join(', ')}
`;

  return new Response(body, { headers: TEXT_HEADERS });
}
