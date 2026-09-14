import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // validate.ts / tokens.ts are pure — no DOM/browser deps, no jsdom needed
    include: ['src/**/*.test.ts'],
  },
});
