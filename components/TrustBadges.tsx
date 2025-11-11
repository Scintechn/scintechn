'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function TrustBadges() {
  const t = useTranslations('trustBadges');

  const badges = [
    {
      icon: '🏢',
      number: '500+',
      label: t('businesses'),
    },
    {
      icon: '💬',
      number: '2M+',
      label: t('messages'),
    },
    {
      icon: '⚡',
      number: '< 3s',
      label: t('responseTime'),
    },
    {
      icon: '✅',
      number: '99.9%',
      label: t('uptime'),
    },
  ];

  return (
    <section className="py-12 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {badges.map((badge, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl mb-2">{badge.icon}</div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                {badge.number}
              </div>
              <div className="text-sm text-gray-400">{badge.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
