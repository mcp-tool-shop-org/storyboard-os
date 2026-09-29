import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// ci.yml sets COVERAGE_LEG to 'true' on the one leg whose reports go to
// Codecov. CI runs this suite through pnpm test, which runs Vitest in every
// package, so no flag on the workflow step reaches it; that leg collects
// coverage and writes JUnit results here, into this package. Every other run
// is unchanged.
const coverageLeg = process.env.COVERAGE_LEG === 'true';

const here = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@storyboard-os/core': resolve(here, '../storyboard-core/src/index.ts'),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    ...(coverageLeg ? { reporters: ['default', 'junit'], outputFile: { junit: 'junit.xml' } } : {}),
    coverage: {
      enabled: coverageLeg,
      provider: 'v8',
      reporter: ['text', 'lcovonly'],
      include: ['src/**'],
    },
  },
});
