/**
 * Single source of truth for the locale-independent facts about Scintechn:
 * company identity, the shipped products, and the capability lines.
 *
 * Tool names, URLs and company registration data are identical across locales,
 * so they live here rather than in messages/*.json — that keeps a frequently
 * edited list out of the two files that must stay key-identical, and lets the
 * server-rendered agent surfaces (app/llms.txt, app/llms-full.txt,
 * lib/structured-data.ts) read the same data the page renders.
 *
 * Localized copy for every `key` below lives under the matching
 * `work.items.<key>.*` / `capabilities.items.<key>.*` namespace in
 * messages/{en,pt}.json. Adding a product or capability means editing this
 * file *and* both message files.
 */

export const SITE = {
  baseUrl: 'https://scintechn.com',
  name: 'Scintechn',
  legalName: 'Scint Technologia Serviços Ltda',
  cnpj: '36.955.612/0001-85',
  contactEmail: 'contact@scintechn.com',
  locales: ['en', 'pt'] as const,
  /** Profiles an agent can use to resolve the entity across the web. */
  sameAs: [
    'https://www.linkedin.com/in/scintylla/',
    'https://www.instagram.com/scintechn/',
    'https://github.com/Scintechn',
  ],
} as const;

export type ProductKey =
  | 'flowdeski'
  | 'rentfy'
  | 'riopatinacao'
  | 'carna26'
  | 'mayway';

export type Product = {
  key: ProductKey;
  /** null while a product has no public URL — renders without the live link. */
  url: string | null;
  stack: string[];
};

export const products: Product[] = [
  {
    key: 'flowdeski',
    url: 'https://flowdeski.com',
    stack: ['Next.js', 'PostgreSQL', 'OpenRouter AI', 'Stripe Connect', 'Evolution API'],
  },
  {
    key: 'rentfy',
    url: 'https://www.getrentfy.com',
    stack: ['Next.js', 'Drizzle', 'PostgreSQL', 'Vercel AI SDK', 'Stripe'],
  },
  {
    key: 'riopatinacao',
    url: 'https://www.riopatinacao.com',
    stack: ['Next.js', 'PostgreSQL', 'BDD / Gherkin', 'Vitest', 'Playwright', 'Cucumber'],
  },
  {
    key: 'carna26',
    url: 'https://carna26-rio.vercel.app/discover',
    stack: ['Next.js', 'Supabase', 'Stripe', 'Python', 'Playwright'],
  },
  {
    key: 'mayway',
    url: 'https://mayway.vercel.app/en',
    stack: ['Next.js 16', 'TypeScript', 'Tailwind', 'shadcn/ui', 'next-intl'],
  },
];

export type CapabilityKey = 'product' | 'automation' | 'integrations' | 'run';

export type Capability = {
  key: CapabilityKey;
  stack: string[];
};

export const capabilities: Capability[] = [
  {
    key: 'product',
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Vercel AI SDK', 'OpenRouter', 'Stripe'],
  },
  {
    key: 'automation',
    stack: ['n8n', 'Make', 'Salesforce Agentforce', 'GoHighLevel', 'Webhooks & APIs'],
  },
  {
    key: 'integrations',
    stack: ['Stripe Connect', 'WhatsApp / Evolution API', 'Salesforce', 'Supabase', 'REST'],
  },
  {
    key: 'run',
    stack: ['Vercel', 'CI/CD', 'Playwright', 'Vitest', 'Monitoring'],
  },
];

/** Every distinct technology named on the site — feeds schema.org `knowsAbout`. */
export function allTechnologies(): string[] {
  const seen = new Set<string>();
  for (const { stack } of [...products, ...capabilities]) {
    for (const tech of stack) seen.add(tech);
  }
  return [...seen];
}
