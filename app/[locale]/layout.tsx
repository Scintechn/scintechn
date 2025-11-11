import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { Roboto, Merriweather } from 'next/font/google';
import type { Metadata } from 'next';
import '../globals.css';

const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
});

const merriweather = Merriweather({
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-merriweather',
  display: 'swap',
  style: ['normal', 'italic'],
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
    keywords: 'digital solutions, automation, business efficiency, innovation, web development, consulting',
    authors: [{ name: 'Scintechn' }],
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: 'https://scintechn.com',
      siteName: 'Scintechn',
      locale: locale,
      type: 'website',
      images: [
        {
          url: '/images/logo-default-362x90.png',
          width: 362,
          height: 90,
          alt: 'Scintechn Logo',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      site: '@scintech',
      creator: '@scintech',
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
    verification: {
      google: 'google-site-verification-code',
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
        <link rel="icon" href="/images/favicon.ico" type="image/x-icon" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-KPXTTSRQ');`
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Scintechn',
              url: 'https://scintechn.com',
              logo: 'https://scintechn.com/images/logo-default-362x90.png',
              sameAs: [
                'https://facebook.com/scintech',
                'https://twitter.com/scintech',
                'https://linkedin.com/company/scintech',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'contact@scintechn.com',
                contactType: 'customer service',
              },
            }),
          }}
        />
      </head>
      <body className={`${roboto.variable} ${merriweather.variable} antialiased`}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KPXTTSRQ"
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
