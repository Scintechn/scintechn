import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Scintechn — AI Software House';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
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
          Scintechn · AI Software House
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
            From requirement to working software — in weeks.
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
            We design, build and ship AI-powered SaaS products. Delivery-led, worldwide.
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
          <span style={{ color: '#9333ea', fontWeight: 600 }}>EN · PT</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
