'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';

type FormData = {
  name: string;
  email: string;
  message: string;
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitStatus('success');
        reset();
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-primary to-secondary" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white text-center font-merriweather">
            {t('title')}
          </h2>
          <p className="text-xl text-white/90 text-center mb-8">
            {t('subtitle')}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
            <div className="mb-6">
              <label htmlFor="name" className="block text-gray-900 font-semibold mb-2 text-sm">
                {t('name')}
              </label>
              <input
                {...register('name', { required: 'Name is required' })}
                type="text"
                id="name"
                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition placeholder:text-gray-500"
                placeholder={t('name')}
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1 font-medium">{errors.name.message}</p>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="email" className="block text-gray-900 font-semibold mb-2 text-sm">
                {t('email')}
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                id="email"
                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition placeholder:text-gray-500"
                placeholder={t('email')}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="message" className="block text-gray-900 font-semibold mb-2 text-sm">
                {t('message')}
              </label>
              <textarea
                {...register('message', { required: 'Message is required' })}
                id="message"
                rows={5}
                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition resize-none placeholder:text-gray-500"
                placeholder={t('message')}
              />
              {errors.message && (
                <p className="text-red-600 text-sm mt-1 font-medium">{errors.message.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-white py-5 rounded-lg font-bold text-lg hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02]"
            >
              {isSubmitting ? 'Enviando...' : t('send')}
            </button>

            <p className="text-center text-sm text-gray-600 mt-4">
              {t('guarantee')}
            </p>

            {submitStatus === 'success' && (
              <div className="mt-4 p-4 bg-green-100 border-2 border-green-400 text-green-800 rounded-lg font-semibold">
                ✓ Mensagem enviada com sucesso! Entraremos em contato em breve.
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mt-4 p-4 bg-red-100 border-2 border-red-400 text-red-800 rounded-lg font-semibold">
                ✗ Falha ao enviar mensagem. Configure o arquivo .env.local com suas credenciais SMTP.
              </div>
            )}
          </form>

          <div className="mt-8 text-center text-white/80">
            <p className="text-sm">
              🔒 Seus dados estão seguros e nunca serão compartilhados
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
