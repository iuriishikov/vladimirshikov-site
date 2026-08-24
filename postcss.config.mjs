/**
 * PostCSS is reduced to a single plugin: Tailwind CSS v4 does its own nesting,
 * autoprefixing and minification, so the usual postcss-preset-env stack would
 * only duplicate work.
 *
 * Tailwind itself is configured from CSS (`@theme`), not from a JS config file
 * — see src/app/_styles/globals.css.
 */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

export default config
