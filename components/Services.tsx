'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Services() {
  const t = useTranslations('services');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const services = [
    {
      title: t('items.whatsapp.title'),
      description: t('items.whatsapp.description'),
      icon: '💬',
      highlight: true
    },
    {
      title: t('items.automation.title'),
      description: t('items.automation.description'),
      icon: '⚙️',
      highlight: false
    },
    {
      title: t('items.integration.title'),
      description: t('items.integration.description'),
      icon: '🔗',
      highlight: false
    },
  ];

  return (
    <section id="what-we-do" className="py-20 bg-gradient-to-b from-gray-50 to-white" ref={ref}>
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
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="relative"
            >
              {service.highlight && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10 bg-primary text-white hover:bg-primary-dark">
                  {t('popular')}
                </Badge>
              )}
              <Card className={`h-full hover:shadow-2xl transition-all ${
                service.highlight
                  ? 'border-primary ring-4 ring-primary/20'
                  : 'border-gray-200 hover:border-primary'
              }`}>
                <CardHeader>
                  <div className="text-6xl mb-4">{service.icon}</div>
                  <CardTitle className="text-2xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-base text-gray-700 font-medium leading-relaxed">
                    {service.description}
                  </CardDescription>
                  <a
                    href="#contact"
                    className={`inline-block font-semibold ${
                      service.highlight
                        ? 'text-primary hover:text-primary-dark'
                        : 'text-gray-600 hover:text-primary'
                    }`}
                  >
                    {t('learnMore')}
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
