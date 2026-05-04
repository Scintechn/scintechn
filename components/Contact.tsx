'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { ArrowRight } from 'lucide-react';

type FormData = {
  name: string;
  email: string;
  message: string;
  website?: string; // honeypot — must remain empty
};

export default function Contact() {
  const t = useTranslations('contact');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitStatus('success');
        reset();
        setTimeout(() => setSubmitStatus('idle'), 6000);
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 md:py-32 bg-background" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-10">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-4">
              {t('eyebrow')}
            </p>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground tracking-tight leading-[1.05] text-balance">
              {t('title')}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('subtitle')}
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-5"
          >
            {/* Honeypot — hidden from real users, bots fill it and get silently dropped */}
            <div aria-hidden="true" className="hidden">
              <label htmlFor="website">Website</label>
              <input
                {...register('website')}
                type="text"
                id="website"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
                {t('name')}
              </label>
              <input
                {...register('name', { required: t('validation.nameRequired') })}
                type="text"
                id="name"
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
              />
              {errors.name && (
                <p className="text-destructive text-sm mt-1.5 font-medium">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                {t('email')}
              </label>
              <input
                {...register('email', {
                  required: t('validation.emailRequired'),
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: t('validation.emailInvalid'),
                  },
                })}
                type="email"
                id="email"
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
              />
              {errors.email && (
                <p className="text-destructive text-sm mt-1.5 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-foreground mb-2">
                {t('message')}
              </label>
              <textarea
                {...register('message', { required: t('validation.messageRequired') })}
                id="message"
                rows={5}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition resize-none"
              />
              {errors.message && (
                <p className="text-destructive text-sm mt-1.5 font-medium">{errors.message.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('sending') : t('send')}
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </button>

            {submitStatus === 'success' && (
              <div
                role="status"
                className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-foreground"
              >
                <p className="font-semibold">{t('successTitle')}</p>
                <p className="text-muted-foreground mt-0.5">{t('successMessage')}</p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm"
              >
                <p className="font-semibold text-destructive">{t('errorTitle')}</p>
                <p className="text-muted-foreground mt-0.5">{t('errorMessage')}</p>
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
}
