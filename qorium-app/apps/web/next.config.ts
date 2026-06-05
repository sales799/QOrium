import type { NextConfig } from "next";
import { canonicalRedirects } from "./src/marketing/data";

const nextConfig: NextConfig = {
  transpilePackages: ["@qorium/ui"],
  async redirects() {
    return canonicalRedirects.map(([source, destination]) => ({
      source,
      destination,
      permanent: true
    }));
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }
        ]
      }
    ];
  }
};

export default nextConfig;
