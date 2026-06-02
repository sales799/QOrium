import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import Script from 'next/script';
import { ThemeProvider } from '@/components/site/ThemeProvider';
import { CookieConsent } from '@/components/site/CookieConsent';
import { siteConfig } from '@/content/site.config';
import './globals.css';

const qoriumSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-qorium-sans',
});

const qoriumMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-qorium-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.legalEntity }],
  generator: 'Next.js',
  keywords: [
    'question bank',
    'assessment',
    'hiring',
    'IRT calibration',
    'anti-leak',
    'JD-Forge',
    'Stack-Vault',
    'ReadyBank',
    'tech assessment',
    'staffing',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteConfig.url,
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    types: {
      'application/rss+xml': `${siteConfig.url}/rss.xml`,
    },
  },
  robots: { index: true, follow: true },
  icons: {
    icon: '/icon',
    shortcut: '/favicon.ico',
    apple: '/apple-icon',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    legalName: siteConfig.legalEntity,
    sameAs: [siteConfig.social.linkedin, siteConfig.social.x, siteConfig.social.github],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${qoriumSans.variable} ${qoriumMono.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-secondary focus:px-3 focus:py-2 focus:text-secondary-foreground"
          >
            Skip to main content
          </a>
          {children}
        </ThemeProvider>
        <CookieConsent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <Script
          src="https://plausible.io/js/script.js"
          data-domain="qorium.online"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
