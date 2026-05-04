import { getTranslations } from 'next-intl/server';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Work from '@/components/Work';
import Approach from '@/components/Approach';
import About from '@/components/About';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tA11y = await getTranslations({ locale, namespace: 'a11y' });

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lg"
      >
        {tA11y('skipToContent')}
      </a>
      <Header />
      <main id="main-content" className="min-h-screen bg-background">
        <Hero />
        <Work />
        <Approach />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
