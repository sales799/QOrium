import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../..'),
  // Prune the standalone file-trace surface. The node-file-trace pass was
  // hanging while walking the entire pnpm monorepo on the 2-vCPU prod box,
  // leaving the candidate-portal deploy 7 PRs stale. candidate-portal has no
  // workspace deps (it calls readybank over HTTP), so excluding sibling apps,
  // services, packages, caches and VCS removes only dead trace work and keeps
  // the monorepo root so hoisted pnpm node_modules still resolve.
  outputFileTracingExcludes: {
    '*': [
      'node_modules/.cache/**',
      '**/.git/**',
      'apps/marketing/**',
      'apps/my/**',
      'apps/admin/**',
      'services/**',
      'packages/**',
      '**/*.map',
    ],
  },
};

export default nextConfig;
