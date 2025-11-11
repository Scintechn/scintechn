'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function Pricing() {
  const t = useTranslations('pricing');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const plans = [
    {
      name: t('starter.name'),
      price: t('starter.price'),
      description: t('starter.description'),
      features: [
        t('starter.feature1'),
        t('starter.feature2'),
        t('starter.feature3'),
        t('starter.feature4'),
      ],
      cta: t('starter.cta'),
      popular: false,
    },
    {
      name: t('growth.name'),
      price: t('growth.price'),
      description: t('growth.description'),
      features: [
        t('growth.feature1'),
        t('growth.feature2'),
        t('growth.feature3'),
        t('growth.feature4'),
        t('growth.feature5'),
      ],
      cta: t('growth.cta'),
      popular: true,
    },
    {
      name: t('enterprise.name'),
      price: t('enterprise.price'),
      description: t('enterprise.description'),
      features: [
        t('enterprise.feature1'),
        t('enterprise.feature2'),
        t('enterprise.feature3'),
        t('enterprise.feature4'),
        t('enterprise.feature5'),
        t('enterprise.feature6'),
      ],
      cta: t('enterprise.cta'),
      popular: false,
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50" ref={ref}>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className={`relative bg-white rounded-2xl shadow-lg p-8 border-2 transition-all ${
                plan.popular
                  ? 'border-[#90469b] ring-4 ring-[#90469b]/20 scale-105'
                  : 'border-gray-200 hover:border-[#90469b]'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#90469b] text-white px-6 py-1 rounded-full text-sm font-bold">
                  {t('mostPopular')}
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                <div className="text-5xl font-bold text-[#90469b] mb-2">{plan.price}</div>
                {plan.price !== t('enterprise.price') && (
                  <p className="text-gray-600 text-sm">{t('perMonth')}</p>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1 flex-shrink-0">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className={`block w-full text-center py-4 px-6 rounded-lg font-bold transition-all ${
                  plan.popular
                    ? 'bg-[#90469b] text-white hover:bg-[#7a3a83] shadow-md hover:shadow-lg hover:scale-105'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 text-sm">
            {t('moneyBack')}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
