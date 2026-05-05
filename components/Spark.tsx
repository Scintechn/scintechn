'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  motion,
  AnimatePresence,
  useInView,
  useReducedMotion,
} from 'framer-motion';
import { useForm } from 'react-hook-form';
import { ArrowRight } from 'lucide-react';
import { track } from '@/lib/analytics';

type FormData = {
  idea: string;
  contact: string;
  website?: string; // honeypot — must remain empty
};

import type { SparkPlan, Currency } from '@/lib/spark-types';

// Map our 3 supported currencies to the locale that produces the most natural
// currency-formatted string (right symbol, grouping separator, decimal mark).
// USD → en-US ("$45,000"); BRL → pt-BR ("R$ 45.000"); EUR → pt-PT ("45 000 €").
const LOCALE_BY_CURRENCY: Record<Currency, string> = {
  USD: 'en-US',
  BRL: 'pt-BR',
  EUR: 'pt-PT',
};

function formatCurrency(amount: number, currency: Currency): string {
  return new Intl.NumberFormat(LOCALE_BY_CURRENCY[currency], {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

type ApiSuccess = { ok: true; plan: SparkPlan };
type ApiRefusal = { ok: true; refusal: true };
type ApiError = {
  error: string;
  retryAfter?: number;
  detail?: string;
};
type ApiResponse = ApiSuccess | ApiRefusal | ApiError;

type ResultState =
  | { type: 'idle' }
  | { type: 'plan'; plan: SparkPlan; idea: string }
  | { type: 'refusal' };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+\d{8,15}$/;

export default function Spark() {
  const t = useTranslations('spark');
  const locale = useLocale();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const reduceMotion = useReducedMotion() ?? false;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ResultState>({ type: 'idle' });
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Captured on first client render so the server's bot-timing check (rejects
  // submissions <2s after page load) sees a stable timestamp from the client.
  const startedAtRef = useRef<number>(0);

  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  // Fire spark_view exactly once when the section enters the viewport.
  useEffect(() => {
    if (isInView) track('spark_view', { locale });
  }, [isInView, locale]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    // Keep the previous plan visible until the new request resolves — replaced
    // on success/refusal, preserved on error so the user isn't left empty-handed.

    const contactKind = data.contact.includes('@') ? 'email' : 'phone';
    track('spark_submit', {
      locale,
      idea_length: data.idea.length,
      contact_kind: contactKind,
    });

    try {
      const response = await fetch('/api/spark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: data.idea,
          contact: data.contact,
          startedAt: startedAtRef.current,
          website: data.website,
        }),
      });

      const json = (await response.json().catch(() => ({}))) as ApiResponse;

      if (response.ok && 'ok' in json && json.ok) {
        if ('plan' in json) {
          setResult({ type: 'plan', plan: json.plan, idea: data.idea });
          track('spark_plan_rendered', {
            locale,
            currency: json.plan.costOfInaction.currency,
            period: json.plan.costOfInaction.period,
            phases_count: json.plan.phases.length,
            risks_count: json.plan.risks.length,
          });
        } else {
          setResult({ type: 'refusal' });
          track('spark_refusal', { locale });
        }
        return;
      }

      const code = (json as ApiError).error;
      track('spark_error', {
        locale,
        error_code: code ?? 'unknown',
        http_status: response.status,
      });
      switch (code) {
        case 'rate_limit':
          setSubmitError(t('errors.rateLimited'));
          break;
        case 'budget_exceeded':
          setSubmitError(t('errors.budgetExceeded'));
          break;
        case 'idea_too_short':
          setSubmitError(t('errors.ideaTooShort'));
          break;
        case 'idea_too_long':
          setSubmitError(t('errors.ideaTooLong'));
          break;
        case 'invalid_contact':
          setSubmitError(t('errors.contactInvalid'));
          break;
        default:
          setSubmitError(t('errors.generic'));
      }
    } catch {
      track('spark_error', { locale, error_code: 'network', http_status: 0 });
      setSubmitError(t('errors.generic'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTalkClick = () => {
    if (result.type !== 'plan') return;
    track('spark_talk_clicked', {
      locale,
      currency: result.plan.costOfInaction.currency,
    });
    const message = t('cta.talkPrefill', { idea: result.idea });
    try {
      sessionStorage.setItem(
        'contact-prefill',
        JSON.stringify({ message, source: 'spark' }),
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
    <section
      id="spark"
      ref={ref}
      className="py-24 md:py-32 bg-background"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
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
            className="rounded-2xl border border-border bg-card p-6 md:p-10 space-y-5"
            noValidate
          >
            {/* Honeypot — hidden from real users; bots fill it and get silently dropped server-side */}
            <div aria-hidden="true" className="hidden">
              <label htmlFor="spark-website">Website</label>
              <input
                {...register('website')}
                type="text"
                id="spark-website"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div>
              <label
                htmlFor="spark-idea"
                className="block text-sm font-semibold text-foreground mb-2"
              >
                {t('idea.label')}
              </label>
              <textarea
                {...register('idea', {
                  required: t('errors.ideaRequired'),
                  minLength: { value: 12, message: t('errors.ideaTooShort') },
                  maxLength: { value: 2000, message: t('errors.ideaTooLong') },
                })}
                id="spark-idea"
                rows={4}
                placeholder={t('idea.placeholder')}
                aria-invalid={errors.idea ? 'true' : 'false'}
                aria-describedby={errors.idea ? 'spark-idea-error' : undefined}
                className="w-full min-h-[44px] rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground placeholder:font-mono placeholder:text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition resize-none"
              />
              {errors.idea && (
                <p
                  id="spark-idea-error"
                  className="text-destructive text-sm mt-1.5 font-medium"
                >
                  {errors.idea.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="spark-contact"
                className="block text-sm font-semibold text-foreground mb-2"
              >
                {t('contact.label')}
              </label>
              <div className="flex flex-col md:flex-row md:items-stretch gap-3">
                <input
                  {...register('contact', {
                    required: t('errors.contactRequired'),
                    validate: (value) => {
                      if (!value) return t('errors.contactRequired');
                      const trimmed = value.trim();
                      if (trimmed.includes('@')) {
                        return EMAIL_RE.test(trimmed) || t('errors.contactInvalid');
                      }
                      const stripped = trimmed.replace(/[^\d+]/g, '');
                      return PHONE_RE.test(stripped) || t('errors.contactInvalid');
                    },
                  })}
                  type="text"
                  id="spark-contact"
                  inputMode="text"
                  autoComplete="email"
                  placeholder={t('contact.placeholder')}
                  aria-invalid={errors.contact ? 'true' : 'false'}
                  aria-describedby={
                    errors.contact ? 'spark-contact-error' : 'spark-contact-help'
                  }
                  className="flex-1 min-w-0 min-h-[44px] rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap min-h-[48px]"
                >
                  {isSubmitting ? t('cta.drafting') : t('cta.draft')}
                  {!isSubmitting && <ArrowRight className="h-4 w-4" aria-hidden />}
                </button>
              </div>
              {errors.contact ? (
                <p
                  id="spark-contact-error"
                  className="text-destructive text-sm mt-1.5 font-medium"
                >
                  {errors.contact.message}
                </p>
              ) : (
                <p
                  id="spark-contact-help"
                  className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground mt-2"
                >
                  {t('contact.help')}
                </p>
              )}
            </div>

            {submitError && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive font-medium"
              >
                {submitError}
              </div>
            )}
          </form>

          {/* Persistent live region — must exist in the DOM at announcement time */}
          {/* for screen readers to register, so it sits outside AnimatePresence. */}
          <p aria-live="polite" aria-atomic="true" className="sr-only">
            {result.type === 'plan'
              ? t('result.regionLabel')
              : result.type === 'refusal'
                ? t('refusal')
                : ''}
          </p>

          <AnimatePresence mode="wait">
            {result.type === 'plan' && (
              <motion.section
                key="plan"
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: 12 }}
                transition={{ duration: 0.45 }}
                role="region"
                aria-label={t('result.regionLabel')}
                className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-10 space-y-8"
              >
                <PlanSection delay={0} reduceMotion={reduceMotion}>
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-3">
                    {t('result.elevator')}
                  </h3>
                  <p className="text-lg leading-relaxed text-foreground">
                    {result.plan.elevator}
                  </p>
                </PlanSection>

                <PlanSection delay={30} reduceMotion={reduceMotion}>
                  <div className="rounded-xl border-2 border-primary bg-primary/5 p-5 md:p-6">
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-3">
                      {`// ${t('result.coi.title')}`}
                    </p>
                    {/* flex-wrap with non-breaking tokens so the range never */}
                    {/* breaks mid-amount on a 375px viewport (BRL/EUR ranges */}
                    {/* are wider than ~255px usable inside the panel). */}
                    <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                      <span className="whitespace-nowrap">
                        {formatCurrency(result.plan.costOfInaction.low, result.plan.costOfInaction.currency)}
                      </span>
                      <span className="whitespace-nowrap">–</span>
                      <span className="whitespace-nowrap">
                        {formatCurrency(result.plan.costOfInaction.high, result.plan.costOfInaction.currency)}
                      </span>
                      <span className="text-muted-foreground text-base font-normal whitespace-nowrap">
                        {t(`result.coi.period.${result.plan.costOfInaction.period}`)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      <span className="font-mono text-[11px] uppercase tracking-[0.12em] mr-1">
                        {t('result.coi.basisLabel')}:
                      </span>
                      {result.plan.costOfInaction.basis}
                    </p>
                    <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      {t('result.coi.disclaimer')}
                    </p>
                  </div>
                </PlanSection>

                <PlanSection delay={60} reduceMotion={reduceMotion}>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-3">
                        {t('result.scope.in')}
                      </h3>
                      <ul className="space-y-2 text-sm text-foreground/90">
                        {result.plan.scope.in.map((s, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-muted-foreground" aria-hidden>
                              ·
                            </span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-3">
                        {t('result.scope.out')}
                      </h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {result.plan.scope.out.map((s, i) => (
                          <li key={i} className="flex gap-2">
                            <span aria-hidden>·</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </PlanSection>

                <PlanSection delay={90} reduceMotion={reduceMotion}>
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-3">
                    {t('result.stack')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.plan.stack.map((s, i) => (
                      <span
                        key={i}
                        className="font-mono text-xs border border-border rounded-full px-3 py-1 text-foreground/90"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </PlanSection>

                <PlanSection delay={120} reduceMotion={reduceMotion}>
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-3">
                    {t('result.phases')}
                  </h3>
                  <ul className="space-y-4">
                    {result.plan.phases.map((p, i) => (
                      <li
                        key={i}
                        className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2 md:gap-6"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-semibold text-foreground truncate">
                            {p.label}
                          </span>
                          <span
                            className="flex-none font-mono text-[11px] px-1.5 py-0.5 rounded bg-primary/10 text-primary"
                            title={t(`result.complexity.${p.complexity}`)}
                          >
                            {p.complexity}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-foreground/90">
                            {p.deliverable}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            <span className="font-mono text-[11px] uppercase tracking-[0.12em]">
                              {t('result.dod')}:
                            </span>{' '}
                            {p.definitionOfDone}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </PlanSection>

                <PlanSection delay={150} reduceMotion={reduceMotion}>
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-3">
                    {t('result.risks')}
                  </h3>
                  <ul className="space-y-4">
                    {result.plan.risks.map((r, i) => {
                      const isHighImpact = r.impact === 'high';
                      return (
                        <li
                          key={i}
                          className={`grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-2 md:gap-6 ${
                            isHighImpact ? 'border-l-2 border-primary pl-3' : ''
                          }`}
                        >
                          <p className="text-sm font-medium text-foreground">
                            {r.title}
                          </p>
                          <div className="flex flex-wrap gap-1.5 items-start">
                            <span
                              className="font-mono text-[11px] px-1.5 py-0.5 rounded border border-border bg-background text-foreground/80"
                              aria-label={`${t('result.likelihoodLabel')}: ${t(`result.likelihood.${r.likelihood}`)}`}
                            >
                              {t('result.likelihoodLabel').slice(0, 1)}:{' '}
                              {t(`result.likelihood.${r.likelihood}`)}
                            </span>
                            <span
                              className="font-mono text-[11px] px-1.5 py-0.5 rounded border border-border bg-background text-foreground/80"
                              aria-label={`${t('result.impactLabel')}: ${t(`result.impact.${r.impact}`)}`}
                            >
                              {t('result.impactLabel').slice(0, 1)}:{' '}
                              {t(`result.impact.${r.impact}`)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {r.mitigation}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </PlanSection>

                <PlanSection delay={180} reduceMotion={reduceMotion}>
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-3">
                    {t('result.questions')}
                  </h3>
                  <ul className="space-y-2 text-sm text-foreground/90">
                    {result.plan.openQuestions.map((q, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-muted-foreground" aria-hidden>
                          ·
                        </span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </PlanSection>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    {t('result.ready')}
                  </p>
                  <button
                    type="button"
                    onClick={handleTalkClick}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 min-h-[48px]"
                  >
                    {t('cta.talk')}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </motion.section>
            )}

            {result.type === 'refusal' && (
              <motion.div
                key="refusal"
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: 12 }}
                transition={{ duration: 0.35 }}
                role="status"
                className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8 text-sm text-foreground"
              >
                {t('refusal')}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

function PlanSection({
  delay,
  reduceMotion,
  children,
}: {
  delay: number;
  reduceMotion: boolean;
  children: React.ReactNode;
}) {
  if (reduceMotion) return <div>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay / 1000 }}
    >
      {children}
    </motion.div>
  );
}
