import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      // Worktree tests run against core source; package exports point at dist.
      '@storyboard-os/core': fileURLToPath(new URL('../storyboard-core/src/index.ts', import.meta.url)),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
