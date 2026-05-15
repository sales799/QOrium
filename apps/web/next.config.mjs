/** @type {import('next').NextConfig} */
// Optional basePath for path-mounted previews (e.g. /qorium-v2 under
// preview.talprouniverse.com). Empty in dev and prod; only set on the VPS
// preview server via QORIUM_PREVIEW_BASE_PATH. No-op without the env var.
const basePath = process.env.QORIUM_PREVIEW_BASE_PATH || "";

const nextConfig = {
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
};

export default nextConfig;
