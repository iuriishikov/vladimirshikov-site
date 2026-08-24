import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
      // The real package throws unless it is imported from a Server Component.
      'server-only': fileURLToPath(
        new URL('src/shared/test/stubs/server-only.ts', import.meta.url),
      ),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/shared/test/setup.ts'],
    css: true,
    restoreMocks: true,
    clearMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**', '.next/**'],
    reporters: process.env.CI ? ['default', 'junit', 'github-actions'] : ['default'],
    outputFile: { junit: './reports/vitest-junit.xml' },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      /*
       * Coverage measures logic; composition is measured end to end.
       *
       * The `app` and `views` layers are, by this project's own architecture,
       * composition only — route wiring and layout with no branching to get
       * wrong. Asserting unit coverage over them would only reward tests that
       * mount a tree and assert nothing, so Playwright covers them instead.
       * Everything that can actually hold a bug stays in the denominator.
       */
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/**/*.stories.{ts,tsx}',
        'src/**/index.ts',
        'src/**/*.d.ts',
        'src/shared/test/**',
        'src/app/**',
        'src/views/**',
        // Framework entrypoints: exercised by the e2e suite against a real server.
        'src/proxy.ts',
        'src/instrumentation.ts',
        // Declarative i18n configuration and a re-export of next-intl's
        // navigation helpers — no logic of our own.
        'src/shared/i18n/**',
      ],
      /*
       * Set just below what the suite actually achieves, so an unrelated change
       * does not fail on rounding. Ratchet upwards as coverage grows; lowering
       * one is an ADR-worthy decision, not a quick unblock.
       */
      thresholds: {
        statements: 80,
        branches: 85,
        functions: 80,
        lines: 80,
      },
    },
  },
})
