import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  // Vitest does not load .env files automatically the way Next.js does.
  // Load them explicitly so integration tests (e.g. trades.db.integration.test.ts)
  // can read DATABASE_URL from .env.local during local pre-push verification.
  // CI sets these vars directly in the workflow env, so loadEnv is a no-op there.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@app': path.resolve(__dirname, './src/app'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@lib': path.resolve(__dirname, './src/lib'),
        '@shared': path.resolve(__dirname, './src/shared'),
        '@types': path.resolve(__dirname, './src/types'),
        '@features': path.resolve(__dirname, './src/features'),
      },
    },
    test: {
      env,
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts'],
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
  };
});
