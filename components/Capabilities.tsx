'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { Activity, ArrowRight, Boxes, Plug, Workflow } from 'lucide-react';
import { track } from '@/lib/analytics';

type CapabilityKey = 'product' | 'automation' | 'integrations' | 'run';

type Capability = {
  key: CapabilityKey;
  Icon: typeof Boxes;
  stack: string[];
};

// Tool names are identical across locales, so the chips live here rather than
// in messages/*.json — same pattern as products[] in Work.tsx. Keeps a
// frequently-edited list out of the two files that must stay key-identical.
const capabilities: Capability[] = [
  {
    key: 'product',
    Icon: Boxes,
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Vercel AI SDK', 'OpenRouter', 'Stripe'],
  },
  {
    key: 'automation',
    Icon: Workflow,
    stack: ['n8n', 'Make', 'Salesforce Agentforce', 'GoHighLevel', 'Webhooks & APIs'],
  },
  {
    key: 'integrations',
    Icon: Plug,
    stack: ['Stripe Connect', 'WhatsApp / Evolution API', 'Salesforce', 'Supabase', 'REST'],
  },
  {
    key: 'run',
    Icon: Activity,
    stack: ['Vercel', 'CI/CD', 'Playwright', 'Vitest', 'Monitoring'],
  },
];

export default function Capabilities() {
  const t = useTranslations('capabilities');
  const params = useParams();
  const locale = (params.locale as string) ?? 'en';
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const reduceMotion = useReducedMotion() ?? false;

  useEffect(() => {
    if (isInView) track('capabilities_view', { locale });
  }, [isInView, locale]);

  // Mirrors Spark's "Talk to us about this →" bridge: write a localized
  // pre-fill to sessionStorage, then move the hash so <Contact /> drains it.
  const handleCtaClick = () => {
    track('cta_click', {
      location: 'capabilities',
      label: 'talk_requirement',
      destination: '#contact',
      locale,
    });
    try {
      sessionStorage.setItem(
        'contact-prefill',
        JSON.stringify({ message: t('ctaPrefill'), source: 'capabilities' }),
      );
    } catch {
      // sessionStorage unavailable — proceed without prefill (anchor still works).
    }
    if (window.location.hash === '#contact') {
      // Hashchange wouldn't fire if we're already there — dispatch a synthetic
      // event so Contact picks up the prefill anyway.
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } else {
      window.location.hash = '#contact';
    }
  };

  return (
    <section id="capabilities" className="py-24 md:py-32 bg-secondary/60" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {capabilities.map(({ key, Icon, stack }, index) => (
            <motion.article
              key={key}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={isInView || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: reduceMotion ? 0 : index * 0.1 }}
              className="flex flex-col rounded-xl border border-border bg-card p-6 md:p-8"
            >
              <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-primary/10 text-primary mb-5">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t(`items.${key}.title`)}
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed mb-6 flex-grow">
                {t(`items.${key}.description`)}
              </p>
              <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                {stack.map((tech) => (
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

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.45 }}
          className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between"
        >
          <p className="text-sm text-muted-foreground">{t('footnote')}</p>
          <a
            href="#contact"
            onClick={handleCtaClick}
            className="inline-flex flex-none items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
          >
            {t('cta')}
            <ArrowRight className="h-4 w-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
