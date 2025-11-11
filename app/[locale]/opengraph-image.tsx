import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Scintechn - Digital Solutions and Automation';
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
          background: 'linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <h1 style={{ fontSize: 72, fontWeight: 'bold', marginBottom: 20 }}>
          Scintechn
        </h1>
        <p style={{ fontSize: 36, opacity: 0.9 }}>
          Digital Solutions & Automation
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}
