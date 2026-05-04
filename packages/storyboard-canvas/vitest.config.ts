import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // viewport.ts has no DOM/browser deps — pure math, no jsdom needed
    include: ['src/**/*.test.ts'],
  },
});
