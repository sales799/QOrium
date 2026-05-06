import type { ReactNode } from 'react';

export const metadata = {
  title: 'QOrium · Customer Portal',
  description: 'Self-service billing, subscriptions, and API keys.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          margin: 0,
          color: '#1a1a1a',
          background: '#f6f7f9',
        }}
      >
        <header
          style={{
            padding: '16px 24px',
            background: '#0d0d0f',
            color: '#f6f7f9',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <strong style={{ fontSize: 18 }}>QOrium</strong>
          <span style={{ opacity: 0.6, fontSize: 14 }}>· Customer Portal</span>
        </header>
        <main style={{ maxWidth: 1080, margin: '0 auto', padding: 24 }}>{children}</main>
      </body>
    </html>
  );
}
