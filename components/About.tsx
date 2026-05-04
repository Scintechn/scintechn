'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function About() {
  const t = useTranslations('about');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section id="about" className="py-24 md:py-32 bg-background" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-4">
            {t('eyebrow')}
          </p>
          <h2 className="text-3xl md:text-5xl font-bold mb-8 text-foreground tracking-tight leading-[1.05] text-balance">
            {t('title')}
          </h2>
          <div className="space-y-5 text-lg text-muted-foreground leading-relaxed">
            <p>{t('paragraph1')}</p>
            <p>{t('paragraph2')}</p>
            <p>{t('paragraph3')}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
