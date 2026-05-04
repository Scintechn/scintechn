'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { FileCheck2, Repeat, Sparkles, Unlock } from 'lucide-react';

const pillars = [
  { key: 'scope', Icon: FileCheck2 },
  { key: 'cadence', Icon: Repeat },
  { key: 'stack', Icon: Sparkles },
  { key: 'ownership', Icon: Unlock },
] as const;

export default function Approach() {
  const t = useTranslations('approach');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section id="approach" className="py-24 md:py-32 bg-secondary/60" ref={ref}>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map(({ key, Icon }, index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex gap-5 rounded-xl border border-border bg-card p-6 md:p-8"
            >
              <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {t(`pillars.${key}.title`)}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {t(`pillars.${key}.description`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
