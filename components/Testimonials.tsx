'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function Testimonials() {
  const t = useTranslations('testimonials');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const testimonials = [
    {
      name: t('testimonial1.name'),
      business: t('testimonial1.business'),
      text: t('testimonial1.text'),
      rating: 5,
      image: '👩‍⚕️',
    },
    {
      name: t('testimonial2.name'),
      business: t('testimonial2.business'),
      text: t('testimonial2.text'),
      rating: 5,
      image: '👨‍🍳',
    },
    {
      name: t('testimonial3.name'),
      business: t('testimonial3.business'),
      text: t('testimonial3.text'),
      rating: 5,
      image: '💇‍♀️',
    },
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg border-2 border-gray-200 hover:border-[#90469b] transition-all"
            >
              <div className="flex items-center mb-4">
                <div className="text-5xl mr-4">{testimonial.image}</div>
                <div>
                  <h3 className="font-bold text-gray-900">{testimonial.name}</h3>
                  <p className="text-sm text-gray-600">{testimonial.business}</p>
                </div>
              </div>

              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">⭐</span>
                ))}
              </div>

              <p className="text-gray-700 italic leading-relaxed">
                &ldquo;{testimonial.text}&rdquo;
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
