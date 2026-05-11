import { ImageResponse } from 'next/og';
import { siteConfig } from '@/content/site.config';

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 64,
        backgroundColor: '#0a0d14',
        backgroundImage:
          'radial-gradient(circle at 20% 20%, rgba(20, 184, 217, 0.22) 0%, transparent 45%), radial-gradient(circle at 80% 80%, rgba(125, 211, 252, 0.16) 0%, transparent 55%)',
        color: '#f1f5f9',
        fontFamily: 'system-ui',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: 'linear-gradient(135deg, hsl(192 95% 50%), hsl(195 100% 70%))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0a0d14',
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          Q
        </div>
        <span style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.5 }}>Qorium</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p
          style={{
            fontSize: 18,
            color: 'hsl(192 90% 70%)',
            fontFamily: 'monospace',
            letterSpacing: 4,
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          Question-Bank-as-a-Service
        </p>
        <h1
          style={{
            fontSize: 84,
            fontWeight: 600,
            letterSpacing: -2,
            lineHeight: 1.05,
            margin: 0,
            maxWidth: 980,
          }}
        >
          The world&rsquo;s question bank for hiring.
        </h1>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'hsl(220 9% 70%)',
          fontSize: 18,
        }}
      >
        <span>{siteConfig.url.replace(/^https?:\/\//, '')}</span>
        <span style={{ fontFamily: 'monospace' }}>ReadyBank · JD-Forge · Stack-Vault</span>
      </div>
    </div>,
    { ...size },
  );
}
