/**
 * @see https://prettier.io/docs/configuration
 * @type {import('prettier').Config}
 */
const config = {
  semi: false,
  singleQuote: true,
  jsxSingleQuote: false,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  arrowParens: 'always',
  bracketSpacing: true,
  endOfLine: 'lf',
  plugins: ['@ianvs/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],

  // Import order mirrors the Feature-Sliced Design layer hierarchy, so a diff
  // shows at a glance when a module reaches "upwards" into a higher layer.
  importOrder: [
    '<BUILTIN_MODULES>',
    '<THIRD_PARTY_MODULES>',
    '',
    '^@/app/(.*)$',
    '^@/views/(.*)$',
    '^@/widgets/(.*)$',
    '^@/features/(.*)$',
    '^@/entities/(.*)$',
    '^@/shared/(.*)$',
    '',
    '^[.]',
    '',
    '^(?!.*[.]css$)[./].*$',
    '.css$',
  ],
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrderTypeScriptVersion: '5.0.0',

  overrides: [
    {
      files: ['*.md', '*.mdx'],
      options: { proseWrap: 'preserve', printWidth: 100 },
    },
    {
      files: ['*.yml', '*.yaml'],
      options: { singleQuote: false },
    },
    {
      files: ['*.json', '*.json5', '*.jsonc'],
      options: { singleQuote: false, trailingComma: 'none' },
    },
  ],
}

export default config
