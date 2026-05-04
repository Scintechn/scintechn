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
    eyebrow: 'DELIVERY-LED · AI SAAS',
    titleLead: 'From requirement to working software,',
    titleAccent: 'in weeks.',
    subtitle: 'We design, build and ship AI-powered SaaS products. Delivery-led, worldwide.',
    languages: 'EN · PT',
  },
  pt: {
    eyebrow: 'LIDERADO POR ENTREGA · AI SAAS',
    titleLead: 'Do requisito ao software funcionando,',
    titleAccent: 'em semanas.',
    subtitle:
      'Desenhamos, construímos e entregamos produtos SaaS com IA. Liderada por entrega, atuação global.',
    languages: 'PT · EN',
  },
} as const;

type Locale = keyof typeof COPY;

const INK = '#0B0F14';
const PAPER = '#F7F6F2';
const VIOLET = '#702DB4';
const MUTED = '#6B7280';

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
          background: PAPER,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px 96px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontFamily: 'ui-monospace, monospace',
            fontSize: 22,
            fontWeight: 700,
            color: VIOLET,
            letterSpacing: '0.18em',
          }}
        >
          {copy.eyebrow}
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h1
            style={{
              fontSize: 80,
              fontWeight: 800,
              color: INK,
              lineHeight: 1.02,
              letterSpacing: '-0.025em',
              margin: 0,
              maxWidth: 1000,
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0 18px',
            }}
          >
            <span>{copy.titleLead}</span>
            <span style={{ color: VIOLET }}>{copy.titleAccent}</span>
          </h1>
          <p
            style={{
              fontSize: 26,
              color: MUTED,
              margin: 0,
              maxWidth: 920,
              lineHeight: 1.4,
            }}
          >
            {copy.subtitle}
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'ui-monospace, monospace',
            fontSize: 20,
            color: MUTED,
            letterSpacing: '0.12em',
          }}
        >
          <span>SCINTECHN.COM</span>
          <span style={{ color: VIOLET, fontWeight: 600 }}>{copy.languages}</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
