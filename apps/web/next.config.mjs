/** @type {import('next').NextConfig} */
// Optional basePath for path-mounted previews (e.g. /qorium-v2 under
// preview.talprouniverse.com). Empty in dev and prod; only set on the VPS
// preview server via QORIUM_PREVIEW_BASE_PATH. No-op without the env var.
const basePath = process.env.QORIUM_PREVIEW_BASE_PATH || "";

const nextConfig = {
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
};

export default nextConfig;
