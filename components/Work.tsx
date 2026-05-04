'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';

type ProductKey = 'flowdeski' | 'rentfy' | 'riopatinacao' | 'carna26' | 'mayway';

type Product = {
  key: ProductKey;
  url: string | null;
  stack: string[];
};

const products: Product[] = [
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

export default function Work() {
  const t = useTranslations('work');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section id="work" className="py-24 md:py-32 bg-background" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-16"
        >
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-4">
            {t('eyebrow')}
          </p>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground tracking-tight leading-[1.05] text-balance">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <motion.article
              key={product.key}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group relative flex flex-col rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-2">
                    {t(`items.${product.key}.vertical`)}
                  </p>
                  <h3 className="text-2xl font-bold text-foreground">
                    {t(`items.${product.key}.name`)}
                  </h3>
                </div>
                {product.url && (
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${t(`items.${product.key}.name`)} — ${t('viewLive')}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-all group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                )}
              </div>

              <p className="text-base font-medium text-primary mb-3 italic">
                &ldquo;{t(`items.${product.key}.tagline`)}&rdquo;
              </p>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-grow">
                {t(`items.${product.key}.description`)}
              </p>

              <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                {product.stack.map((tech) => (
                  <span
                    key={tech}
                    className="font-mono inline-flex items-center rounded-md bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
