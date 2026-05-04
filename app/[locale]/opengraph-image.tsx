import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Scintechn — AI Software House';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

const COPY = {
  en: {
    eyebrow: 'Scintechn · AI Software House',
    title: 'From requirement to working software — in weeks.',
    subtitle: 'We design, build and ship AI-powered SaaS products. Delivery-led, worldwide.',
    languages: 'EN · PT',
  },
  pt: {
    eyebrow: 'Scintechn · AI Software House',
    title: 'Do requisito ao software funcionando — em semanas.',
    subtitle:
      'Desenhamos, construímos e entregamos produtos SaaS com IA. Liderada por entrega, atuação global.',
    languages: 'PT · EN',
  },
} as const;

type Locale = keyof typeof COPY;

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const copy = COPY[locale as Locale] ?? COPY.en;

  return new ImageResponse(
    (
      <div
        style={{
          background: '#ffffff',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px 96px',
          fontFamily: 'sans-serif',
          backgroundImage:
            'radial-gradient(ellipse 60% 50% at 100% 0%, rgba(155, 70, 196, 0.12), transparent 60%), radial-gradient(ellipse 50% 40% at 0% 100%, rgba(155, 70, 196, 0.08), transparent 60%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 24,
            fontWeight: 700,
            color: '#9333ea',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          {copy.eyebrow}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h1
            style={{
              fontSize: 80,
              fontWeight: 800,
              color: '#0f0f14',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              margin: 0,
              maxWidth: 980,
            }}
          >
            {copy.title}
          </h1>
          <p
            style={{
              fontSize: 28,
              color: '#5a5a6a',
              margin: 0,
              maxWidth: 900,
              lineHeight: 1.4,
            }}
          >
            {copy.subtitle}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 22,
            color: '#5a5a6a',
          }}
        >
          <span>scintechn.com</span>
          <span style={{ color: '#9333ea', fontWeight: 600 }}>{copy.languages}</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
