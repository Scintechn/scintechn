import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import TrustBadges from '@/components/TrustBadges';
import About from '@/components/About';
import Services from '@/components/Services';
import BeforeAfter from '@/components/BeforeAfter';
import ROICalculator from '@/components/ROICalculator';
import Projects from '@/components/Projects';
import Testimonials from '@/components/Testimonials';
import Pricing from '@/components/Pricing';
import Guarantee from '@/components/Guarantee';
import FAQ from '@/components/FAQ';
import LeadMagnet from '@/components/LeadMagnet';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import WhatsAppWidget from '@/components/WhatsAppWidget';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <TrustBadges />
      <About />
      <Services />
      <BeforeAfter />
      <ROICalculator />
      <Projects />
      <Testimonials />
      <Pricing />
      <Guarantee />
      <FAQ />
      <LeadMagnet />
      <Contact />
      <Footer />
      <WhatsAppWidget />
    </main>
  );
}
