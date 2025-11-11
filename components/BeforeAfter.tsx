'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function BeforeAfter() {
  const t = useTranslations('beforeAfter');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const beforeItems = [
    { icon: '😰', text: t('before.item1') },
    { icon: '⏰', text: t('before.item2') },
    { icon: '❌', text: t('before.item3') },
    { icon: '📉', text: t('before.item4') },
    { icon: '💸', text: t('before.item5') },
  ];

  const afterItems = [
    { icon: '⚡', text: t('after.item1') },
    { icon: '🤖', text: t('after.item2') },
    { icon: '💚', text: t('after.item3') },
    { icon: '📈', text: t('after.item4') },
    { icon: '💰', text: t('after.item5') },
  ];

  return (
    <section className="py-20 bg-white" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 font-merriweather">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto font-medium">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Before Column */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-8 border-2 border-red-200"
          >
            <div className="text-center mb-8">
              <div className="inline-block bg-red-600 text-white px-6 py-2 rounded-full font-bold text-lg mb-4">
                {t('beforeTitle')}
              </div>
              <p className="text-gray-700">{t('beforeSubtitle')}</p>
            </div>

            <div className="space-y-4">
              {beforeItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="flex items-start bg-white rounded-lg p-4 shadow-md"
                >
                  <span className="text-3xl mr-3 flex-shrink-0">{item.icon}</span>
                  <p className="text-gray-800 font-medium">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* After Column */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border-2 border-green-200"
          >
            <div className="text-center mb-8">
              <div className="inline-block bg-green-600 text-white px-6 py-2 rounded-full font-bold text-lg mb-4">
                {t('afterTitle')}
              </div>
              <p className="text-gray-700">{t('afterSubtitle')}</p>
            </div>

            <div className="space-y-4">
              {afterItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="flex items-start bg-white rounded-lg p-4 shadow-md"
                >
                  <span className="text-3xl mr-3 flex-shrink-0">{item.icon}</span>
                  <p className="text-gray-800 font-medium">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center mt-12"
        >
          <a
            href="#contact"
            className="inline-block bg-[#90469b] text-white px-12 py-5 rounded-full font-bold text-lg hover:bg-[#7a3a83] transition-all hover:scale-105 shadow-lg hover:shadow-xl"
          >
            {t('cta')} →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
