'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function LeadMagnet() {
  const t = useTranslations('leadMagnet');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const resources = [
    { icon: '📊', text: t('resource1') },
    { icon: '✅', text: t('resource2') },
    { icon: '💡', text: t('resource3') },
    { icon: '🎯', text: t('resource4') },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setSubmitted(true);
    setIsSubmitting(false);
    setEmail('');
    setName('');

    // Reset after 3 seconds
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="inline-block bg-green-100 text-green-800 px-6 py-2 rounded-full font-bold text-sm mb-6">
              {t('badge')}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 font-merriweather">
              {t('title')}
            </h2>
            <p className="text-xl text-gray-700 font-medium">
              {t('subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Resources List */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {t('whatYouGet')}
                </h3>
                <div className="space-y-4">
                  {resources.map((resource, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                      transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                      className="flex items-start"
                    >
                      <span className="text-3xl mr-3 flex-shrink-0">{resource.icon}</span>
                      <p className="text-gray-700 font-medium pt-1">{resource.text}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-2xl p-8"
            >
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="text-5xl mb-4">🎁</div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {t('formTitle')}
                    </h3>
                    <p className="text-white/90 text-sm">
                      {t('formSubtitle')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">
                      {t('nameLabel')}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-4 py-3 text-gray-900 bg-white rounded-lg focus:ring-2 focus:ring-white focus:outline-none"
                      placeholder={t('namePlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">
                      {t('emailLabel')}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 text-gray-900 bg-white rounded-lg focus:ring-2 focus:ring-white focus:outline-none"
                      placeholder={t('emailPlaceholder')}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-white text-primary py-4 px-6 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? t('sending') : t('cta')}
                  </button>

                  <p className="text-white/80 text-xs text-center">
                    {t('privacy')}
                  </p>
                </form>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {t('successTitle')}
                  </h3>
                  <p className="text-white/90">
                    {t('successMessage')}
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center mt-8"
          >
            <p className="text-gray-600 text-sm">
              {t('disclaimer')}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
