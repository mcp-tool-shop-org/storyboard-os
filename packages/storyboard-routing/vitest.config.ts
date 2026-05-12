import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // routes.ts is pure string manipulation — no DOM/browser deps, no jsdom needed
    include: ['src/**/*.test.ts'],
  },
});
