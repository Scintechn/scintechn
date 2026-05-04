'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-background pt-28">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-5xl"
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-mono inline-block text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-8"
          >
            {t('eyebrow')}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight leading-[1.02] text-foreground mb-8 text-balance"
          >
            {t.rich('title', {
              accent: (chunks) => (
                <span className="text-primary">{chunks}</span>
              ),
            })}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mb-10"
          >
            {t('subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
            >
              {t('primaryCta')}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#work"
              className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground transition-all hover:border-primary/40 hover:text-primary"
            >
              {t('secondaryCta')}
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
