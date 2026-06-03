import type { ReactNode } from 'react';

export const metadata = {
  title: 'QOrium Candidate Portal',
  description: 'Wave 3 AI pair-coding assessment runtime.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          margin: 0,
          color: '#1a1a1a',
          background: '#0d0d0f',
        }}
      >
        {children}
      </body>
    </html>
  );
}
