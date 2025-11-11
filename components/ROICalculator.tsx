'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function ROICalculator() {
  const t = useTranslations('roiCalculator');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const [customers, setCustomers] = useState(50);
  const [lostPercent, setLostPercent] = useState(30);
  const [avgValue, setAvgValue] = useState(150);

  const lostCustomers = Math.round((customers * lostPercent) / 100);
  const monthlyLoss = lostCustomers * avgValue * 30; // 30 days
  const automationCost = 697;
  const savings = monthlyLoss - automationCost;
  const roi = Math.round((savings / automationCost) * 100);

  return (
    <section className="py-20 bg-gradient-to-br from-primary to-secondary" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white font-merriweather">
              {t('title')}
            </h2>
            <p className="text-xl text-white/90">
              {t('subtitle')}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Inputs */}
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-900 font-semibold mb-3">
                    {t('customersPerDay')}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    value={customers}
                    onChange={(e) => setCustomers(Number(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="text-center mt-2">
                    <span className="text-4xl font-bold text-primary">{customers}</span>
                    <span className="text-gray-600 ml-2">{t('customers')}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-900 font-semibold mb-3">
                    {t('lostPercentage')}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    value={lostPercent}
                    onChange={(e) => setLostPercent(Number(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="text-center mt-2">
                    <span className="text-4xl font-bold text-primary">{lostPercent}%</span>
                    <span className="text-gray-600 ml-2">{t('lost')}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-900 font-semibold mb-3">
                    {t('avgCustomerValue')}
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="10"
                    value={avgValue}
                    onChange={(e) => setAvgValue(Number(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="text-center mt-2">
                    <span className="text-4xl font-bold text-primary">R$ {avgValue}</span>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="bg-gradient-to-br from-red-50 to-green-50 rounded-xl p-8 space-y-6">
                <div className="text-center pb-6 border-b-2 border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">{t('youAreLosing')}</div>
                  <div className="text-4xl font-bold text-red-600">
                    R$ {monthlyLoss.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{t('perMonth')}</div>
                </div>

                <div className="text-center pb-6 border-b-2 border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">{t('automationCost')}</div>
                  <div className="text-3xl font-bold text-gray-900">
                    R$ {automationCost.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{t('perMonth')}</div>
                </div>

                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">{t('yourSavings')}</div>
                  <div className="text-5xl font-bold text-green-600">
                    R$ {savings.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{t('perMonth')}</div>
                  <div className="mt-4 inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold">
                    ROI: {roi}%
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <a
                href="#contact"
                className="inline-block bg-primary text-white px-12 py-5 rounded-full font-bold text-lg hover:bg-primary-dark transition-all hover:scale-105 shadow-xl"
              >
                {t('cta')} →
              </a>
              <p className="text-gray-600 text-sm mt-4">{t('guarantee')}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
