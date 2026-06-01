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
      { source: '/platform', destination: '/product', permanent: false },
      { source: '/platform/readybank', destination: '/features/readybank', permanent: false },
      { source: '/platform/jd-forge', destination: '/features/jd-forge', permanent: false },
      { source: '/platform/stack-vault', destination: '/features/stack-vault', permanent: false },
      {
        source: '/solutions/assessment-platforms',
        destination: '/solutions/platforms',
        permanent: false,
      },
      {
        source: '/solutions/enterprises-gcc',
        destination: '/solutions/enterprises',
        permanent: false,
      },
      { source: '/solutions/staffing-firms', destination: '/solutions/staffing', permanent: false },
      {
        source: '/solutions/role/:slug',
        destination: '/solutions/by-use-case/:slug',
        permanent: false,
      },
      {
        source: '/solutions/stack/:slug',
        destination: '/solutions/by-industry/:slug',
        permanent: false,
      },
      { source: '/method', destination: '/product', permanent: false },
      { source: '/science', destination: '/blog/irt-calibration-explained', permanent: false },
      { source: '/anti-leak', destination: '/blog/leak-problem', permanent: false },
      { source: '/authoring', destination: '/features', permanent: false },
      { source: '/trust', destination: '/security', permanent: false },
      { source: '/compliance-dpdp', destination: '/dpa', permanent: false },
      { source: '/responsible-ai', destination: '/llm-info', permanent: false },
      { source: '/vs/:slug', destination: '/compare/:slug', permanent: false },
      { source: '/library/:slug', destination: '/skill/:slug', permanent: false },
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
