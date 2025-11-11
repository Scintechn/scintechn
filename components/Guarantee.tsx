'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function Guarantee() {
  const t = useTranslations('guarantee');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const benefits = [
    { icon: '✅', text: t('benefit1') },
    { icon: '🔒', text: t('benefit2') },
    { icon: '🚀', text: t('benefit3') },
    { icon: '💪', text: t('benefit4') },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-purple-600 via-[#90469b] to-purple-800" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : { scale: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="inline-block mb-6"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
                  <span className="text-6xl">🛡️</span>
                </div>
              </motion.div>

              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 font-merriweather">
                {t('title')}
              </h2>
              <div className="inline-block bg-green-100 text-green-800 px-8 py-3 rounded-full font-bold text-2xl mb-6">
                {t('period')}
              </div>
              <p className="text-xl text-gray-700 font-medium">
                {t('description')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="flex items-start bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border-2 border-gray-200"
                >
                  <span className="text-3xl mr-4 flex-shrink-0">{benefit.icon}</span>
                  <p className="text-gray-800 font-medium">{benefit.text}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 border-2 border-green-200"
            >
              <div className="text-center">
                <p className="text-lg text-gray-800 font-semibold mb-6">
                  {t('promise')}
                </p>
                <a
                  href="#contact"
                  className="inline-block bg-[#90469b] text-white px-12 py-5 rounded-full font-bold text-lg hover:bg-[#7a3a83] transition-all hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  {t('cta')} →
                </a>
                <p className="text-sm text-gray-600 mt-4">
                  {t('noQuestions')}
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
