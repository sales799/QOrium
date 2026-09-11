import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Cross-app ACS tests run the real marketing rate limiter.
  resolve: {
    alias: {
      '@/lib/rate-limit': fileURLToPath(
        new URL('../../apps/marketing/src/lib/rate-limit.ts', import.meta.url),
      ),
    },
  },
  test: {
    include: ['__tests__/**/*.test.ts'],
    testTimeout: 10_000,
  },
});
