import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const here = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@storyboard-os/core': resolve(here, '../storyboard-core/src/index.ts'),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
