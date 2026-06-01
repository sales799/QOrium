import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
});

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io https://assets.calendly.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://assets.calendly.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://plausible.io https://api.resend.com https://calendly.com",
      "frame-src 'self' https://calendly.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['lucide-react', 'motion'],
    staticGenerationMaxConcurrency: 1,
    staticGenerationMinPagesPerWorker: 2_000,
    staticGenerationRetryCount: 1,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      { source: '/skill/:slug', destination: '/library/:slug', permanent: true },
      { source: '/compare/qorium-vs-:slug', destination: '/vs/:slug', permanent: true },
      { source: '/compare/:slug', destination: '/vs/:slug', permanent: true },
      { source: '/resources/docs', destination: '/product/api', permanent: false },
      { source: '/docs', destination: '/product/api', permanent: false },
      { source: '/glossary', destination: '/resources', permanent: false },
      {
        source: '/benchmarks',
        destination: '/research/plagiarism-benchmark',
        permanent: false,
      },
      { source: '/pricing/:sku', destination: '/pricing', permanent: false },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
