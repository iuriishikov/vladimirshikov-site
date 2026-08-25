import bundleAnalyzer from '@next/bundle-analyzer'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

// Validate the environment as early as possible: a missing/ malformed variable
// must break the build, never the running site. Set SKIP_ENV_VALIDATION=1 for
// Docker image builds that legitimately have no runtime secrets available.
import './src/shared/config/env'

const withNextIntl = createNextIntlPlugin('./src/shared/i18n/request.ts')

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
})

/**
 * Headers that are safe to serve statically. The Content-Security-Policy is set
 * in `src/proxy.ts` instead, because it carries a per-request nonce.
 *
 * @see https://owasp.org/www-project-secure-headers/
 */
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  { key: 'Origin-Agent-Cluster', value: '?1' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
] as const

const nextConfig: NextConfig = {
  // Produces a self-contained server bundle — the Docker image copies only
  // `.next/standalone` plus static assets (see Dockerfile).
  output: 'standalone',
  outputFileTracingRoot: process.cwd(),

  reactStrictMode: true,
  poweredByHeader: false,

  // Compile-time checked `href` values for <Link> and router calls.
  typedRoutes: true,

  // React Compiler: automatic memoisation, no manual useMemo/useCallback noise.
  reactCompiler: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    // Add remote hosts explicitly — a wildcard here is an open image proxy.
    remotePatterns: [],
  },

  experimental: {
    optimizePackageImports: ['lucide-react', 'radix-ui'],
  },

  // Next 16 dropped the built-in ESLint integration entirely; linting is its
  // own CI job (`pnpm lint`). Type errors, however, must still fail the build.
  typescript: { ignoreBuildErrors: false },

  headers() {
    // Note: `/_next/static` already ships `immutable` caching from Next itself.
    // Overriding it here is redundant and breaks dev-time revalidation.
    return Promise.resolve([
      {
        source: '/:path*',
        headers: [...securityHeaders],
      },
    ])
  },
}

export default withBundleAnalyzer(withNextIntl(nextConfig))
