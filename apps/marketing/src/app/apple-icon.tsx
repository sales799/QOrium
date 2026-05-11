import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, hsl(192 95% 50%), hsl(195 100% 70%))',
        color: '#0a0d14',
        fontSize: 110,
        fontWeight: 700,
        letterSpacing: -2,
        borderRadius: 36,
      }}
    >
      Q
    </div>,
    { ...size },
  );
}
