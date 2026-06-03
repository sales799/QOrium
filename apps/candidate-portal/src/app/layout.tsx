import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://candidate.qorium.online'),
  title: {
    default: 'QOrium Candidate Portal',
    template: '%s | QOrium Candidate Portal',
  },
  description: 'Secure QOrium assessment entry point for invited candidates.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f8fbfa',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <body>{children}</body>
    </html>
  );
}
