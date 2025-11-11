'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Projects() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const t = useTranslations('results');

  const results = [
    {
      business: t('cases.dental.name'),
      result: t('cases.dental.result'),
      metric: t('cases.dental.metric'),
      icon: '🦷'
    },
    {
      business: t('cases.clothing.name'),
      result: t('cases.clothing.result'),
      metric: t('cases.clothing.metric'),
      icon: '👕'
    },
    {
      business: t('cases.restaurant.name'),
      result: t('cases.restaurant.result'),
      metric: t('cases.restaurant.metric'),
      icon: '🍕'
    },
    {
      business: t('cases.gym.name'),
      result: t('cases.gym.result'),
      metric: t('cases.gym.metric'),
      icon: '💪'
    },
    {
      business: t('cases.salon.name'),
      result: t('cases.salon.result'),
      metric: t('cases.salon.metric'),
      icon: '💇'
    },
    {
      business: t('cases.realestate.name'),
      result: t('cases.realestate.result'),
      metric: t('cases.realestate.metric'),
      icon: '🏠'
    },
  ];

  return (
    <section id="our-projects" className="py-20 bg-gray-50" ref={ref}>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {results.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full shadow-sm hover:shadow-xl transition-all border-2 border-gray-200 hover:border-[#90469b] group">
                <CardHeader>
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
                  <CardTitle className="text-lg font-semibold text-gray-600">{item.business}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Badge className="text-2xl font-bold bg-[#90469b] text-white hover:bg-[#7a3a83] transition-colors px-4 py-2">
                    {item.result}
                  </Badge>
                  <p className="text-gray-700 font-medium">{item.metric}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-12"
        >
          <a
            href="#contact"
            className="inline-block bg-[#90469b] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#7a3a83] transition-all hover:scale-105 shadow-lg hover:shadow-xl"
          >
            {t('cta')}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
