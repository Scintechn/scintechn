import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { Inter_Tight, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import type { Metadata } from 'next';
import '../globals.css';

const GTM_ID = 'GTM-KPXTTSRQ';

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter-tight',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('title'),
    description: t('description'),
    keywords:
      'AI software house, AI agency, custom AI development, AI SaaS, agentic AI, software delivery, BDD, Next.js, Brazil, worldwide',
    authors: [{ name: 'Scintechn' }],
    metadataBase: new URL('https://scintechn.com'),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: '/en',
        pt: '/pt',
      },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `https://scintechn.com/${locale}`,
      siteName: 'Scintechn',
      locale: locale === 'pt' ? 'pt_BR' : 'en_US',
      type: 'website',
      images: [
        {
          url: '/brand/scintechn-lockup-light.svg',
          width: 362,
          height: 90,
          alt: 'Scintechn — AI Software House',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/brand/scintechn-favicon-32.svg" />
        <link rel="apple-touch-icon" href="/brand/scintechn-app-icon-512.svg" />
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Scintechn',
              alternateName: 'Scintech Services',
              url: 'https://scintechn.com',
              logo: 'https://scintechn.com/brand/scintechn-lockup-light.svg',
              description:
                'AI software house. We design, build and ship AI-powered SaaS products — from requirement to working software, in weeks.',
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'contact@scintechn.com',
                contactType: 'sales',
                availableLanguage: ['en', 'pt'],
              },
            }),
          }}
        />
      </head>
      <body className={`${interTight.variable} ${jetbrainsMono.variable} antialiased`}>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
