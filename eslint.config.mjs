import js from '@eslint/js'
import nextPlugin from '@next/eslint-plugin-next'
import tanstackQuery from '@tanstack/eslint-plugin-query'
import prettierConfig from 'eslint-config-prettier/flat'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import boundaries from 'eslint-plugin-boundaries'
import importPlugin from 'eslint-plugin-import-x'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import playwright from 'eslint-plugin-playwright'
import reactHooks from 'eslint-plugin-react-hooks'
import storybook from 'eslint-plugin-storybook'
import testingLibrary from 'eslint-plugin-testing-library'
import unicorn from 'eslint-plugin-unicorn'
import globals from 'globals'
import tseslint from 'typescript-eslint'

/**
 * Feature-Sliced Design layers, most abstract first.
 *
 * Next.js owns `src/app`, so the FSD "pages" layer lives in `src/views`.
 * A module may only import from layers *below* it — that rule is mechanically
 * enforced by `boundaries/dependencies` further down, not left to code review.
 *
 * @see docs/architecture.md
 */
const LAYERS = ['app', 'views', 'widgets', 'features', 'entities', 'shared']

/** `['widgets', 'features', 'entities', 'shared']` for `'views'`. */
const layersBelow = (layer) => LAYERS.slice(LAYERS.indexOf(layer) + 1)

/**
 * Layers that are divided into slices and therefore have a public API.
 * `app` is the composition root and `shared` is a library of segments; neither
 * hides anything behind an index.ts.
 */
const SLICED_LAYERS = ['views', 'widgets', 'features', 'entities']

export default tseslint.config(
  // ---------------------------------------------------------------------------
  // Ignores
  // ---------------------------------------------------------------------------
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'coverage/**',
      'storybook-static/**',
      'playwright-report/**',
      'test-results/**',
      'reports/**',
      'node_modules/**',
      'next-env.d.ts',
      'public/**',
      'CHANGELOG.md',
    ],
  },

  // ---------------------------------------------------------------------------
  // Baseline
  // ---------------------------------------------------------------------------
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  unicorn.configs.recommended,

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node, ...globals.es2025 },
      parserOptions: {
        // Project-service typed linting: no manual `project` globs to keep in sync.
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: { jsx: true },
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({ alwaysTryTypes: true, project: './tsconfig.json' }),
      ],
      /*
       * eslint-plugin-boundaries resolves modules through the classic
       * `import/resolver` setting, not import-x's `resolver-next`. Without this
       * it reads `@/features/...` as a scoped npm package, classifies it as an
       * external module, and every architecture policy silently matches nothing.
       */
      'import/resolver': {
        typescript: { alwaysTryTypes: true, project: './tsconfig.json' },
      },
    },
  },

  // ---------------------------------------------------------------------------
  // TypeScript house rules
  // ---------------------------------------------------------------------------
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
      // `interface` for object shapes, `type` for unions/mapped types.
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true, allowBoolean: true },
      ],
      // Deliberate escape hatches must be justified in writing.
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-expect-error': 'allow-with-description', minimumDescriptionLength: 10 },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // React / Next.js
  // ---------------------------------------------------------------------------
  reactHooks.configs.flat['recommended-latest'],
  nextPlugin.configs['core-web-vitals'],
  jsxA11y.flatConfigs.strict,
  ...tanstackQuery.configs['flat/recommended'],
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // `recommended-latest` already ships the React Compiler rule set
      // (purity, immutability, preserve-manual-memoization, …), which is what
      // keeps `reactCompiler: true` in next.config.ts safe to leave on.
      //
      // Routing goes through next-intl's Link, so Next's own page-link rule
      // only produces false positives here.
      '@next/next/no-html-link-for-pages': 'off',
    },
  },

  // ---------------------------------------------------------------------------
  // Imports
  // ---------------------------------------------------------------------------
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  {
    files: ['**/*.{ts,tsx,mts,mjs}'],
    rules: {
      // Ordering is owned by @ianvs/prettier-plugin-sort-imports.
      'import-x/order': 'off',
      // ESLint plugin packages routinely expose `configs` both as a named
      // export and as a member of the default export; this rule only produces
      // false positives against them.
      'import-x/no-named-as-default-member': 'off',
      'import-x/no-duplicates': ['error', { 'prefer-inline': true }],
      'import-x/no-cycle': ['error', { maxDepth: 6, ignoreExternal: true }],
      'import-x/no-self-import': 'error',
      'import-x/no-useless-path-segments': ['error', { noUselessIndex: true }],
      'import-x/no-empty-named-blocks': 'error',
      'import-x/newline-after-import': 'error',
      // Named exports keep re-exports greppable and rename-safe. Framework
      // files that *must* default-export are exempted below.
      'import-x/no-default-export': 'error',
      'import-x/no-anonymous-default-export': 'error',
      // Cross-slice access is enforced structurally by the `boundaries/*` rules
      // below, which understand layers and public APIs. A blunt ban on `../../`
      // would only duplicate that badly: inside `shared`, reaching a sibling
      // segment (`../../lib/cn`) is correct, not a violation.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app/*', '@/app'],
              message: 'The app layer is the composition root; nothing may import from it.',
            },
          ],
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Feature-Sliced Design boundaries
  // ---------------------------------------------------------------------------
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      /*
       * Only files inside a layer folder take part in the architecture graph.
       * `src/proxy.ts` and `src/instrumentation.ts` are framework entrypoints
       * that Next.js owns, not layers, so they sit outside it deliberately.
       */
      'boundaries/include': ['src/**/*'],
      'boundaries/elements': [
        // The whole app directory is ONE element: a route file importing the
        // providers next to it is an internal detail, not a boundary crossing.
        { type: 'app', pattern: 'src/app' },
        { type: 'views', pattern: 'src/views/*', capture: ['slice'] },
        { type: 'widgets', pattern: 'src/widgets/*', capture: ['slice'] },
        { type: 'features', pattern: 'src/features/*', capture: ['slice'] },
        { type: 'entities', pattern: 'src/entities/*', capture: ['slice'] },
        { type: 'shared', pattern: 'src/shared/*', capture: ['segment'] },
      ],
    },
    rules: {
      /*
       * One rule expresses the whole architecture. `boundaries/dependencies`
       * replaces the deprecated element-types / entry-point / no-private trio,
       * and the last matching policy wins — so the public-API policy at the
       * bottom narrows the layer permissions granted above it.
       */
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          message:
            '"{{from.element.type}}" may not depend on "{{to.element.type}}" — a layer only imports layers below it, and never sideways into another slice (see docs/architecture.md)',
          policies: [
            // 1. Layer order. The app layer composes everything, including
            //    itself: a route file legitimately imports the providers
            //    sitting next to it.
            {
              from: { element: { type: 'app' } },
              allow: { to: { element: { types: { anyOf: ['app', ...layersBelow('app')] } } } },
            },
            ...['views', 'widgets', 'features', 'entities'].map((layer) => ({
              from: { element: { type: layer } },
              allow: { to: { element: { types: { anyOf: layersBelow(layer) } } } },
            })),
            {
              from: { element: { type: 'shared' } },
              allow: { to: { element: { type: 'shared' } } },
            },

            // 2. Public API. A slice is reachable only through its index.ts;
            //    everything under it is private. This narrows the layer
            //    permissions granted above, because a later policy wins.
            {
              disallow: {
                to: {
                  element: { types: { anyOf: SLICED_LAYERS }, fileInternalPath: '!index.ts' },
                },
              },
              message:
                'Import the public API of "{{to.element.type}}/{{to.element.captured.slice}}" (its index.ts) — reaching into internals couples you to details that slice may change',
            },

            // 3. …except inside a slice, where a module may freely use its own
            //    segments. Listed last so it re-permits what policy 2 just
            //    forbade, but only when the source and target slice match.
            //    Cross-slice traffic within one layer stays forbidden: that is
            //    what keeps two features from growing into each other.
            ...SLICED_LAYERS.map((layer) => ({
              from: { element: { type: layer } },
              allow: {
                to: {
                  element: { type: layer, captured: { slice: '{{from.element.captured.slice}}' } },
                },
              },
            })),
          ],
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Files that must default-export (framework contracts)
  // ---------------------------------------------------------------------------
  {
    files: [
      'src/app/**/*.{ts,tsx}',
      'src/proxy.ts',
      'src/instrumentation.ts',
      // next-intl's plugin requires a default export from the request config.
      'src/shared/i18n/request.ts',
      '**/*.stories.{ts,tsx}',
      '**/*.config.{ts,mts,mjs,js}',
      '.storybook/**/*.{ts,tsx}',
      'e2e/**/*.ts',
    ],
    rules: {
      'import-x/no-default-export': 'off',
      'import-x/no-anonymous-default-export': 'off',
      'unicorn/filename-case': 'off',
    },
  },

  // ---------------------------------------------------------------------------
  // unicorn: keep the useful half, drop the dogma
  // ---------------------------------------------------------------------------
  {
    rules: {
      // `props`, `args`, `params` and `ref` are React's own vocabulary. Renaming
      // them to `properties`/`arguments_` makes this codebase read like no other
      // React codebase, which is a real cost for no real benefit.
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/name-replacements': 'off',

      'unicorn/no-null': 'off', // React and the DOM speak `null`
      'unicorn/prefer-top-level-await': 'off', // not available in Next runtime entrypoints
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-nested-ternary': 'off', // prettier already formats these
      'unicorn/single-line-block-comment-style': 'off', // comment layout is Prettier's business
      // `cond ? value : undefined` is the idiomatic way to omit a JSX attribute;
      // the "minimal" rewrite this rule asks for reads worse.
      'unicorn/prefer-minimal-ternary': 'off',

      'unicorn/filename-case': ['error', { case: 'kebabCase', ignore: [/^\[.+\]$/u] }],
      'unicorn/prefer-module': 'error',
      'unicorn/no-useless-undefined': ['error', { checkArguments: false }],
    },
  },

  // ---------------------------------------------------------------------------
  // General correctness
  // ---------------------------------------------------------------------------
  {
    rules: {
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-alert': 'error',
      'prefer-const': ['error', { destructuring: 'all' }],
      'object-shorthand': ['error', 'always'],
      curly: ['error', 'multi-line'],
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.meta.name='import'][property.name='env']",
          message: 'Read configuration through `@/shared/config/env`, never `import.meta.env`.',
        },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'process', message: 'Use the validated `env` object from `@/shared/config/env`.' },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Environment access is centralised
  // ---------------------------------------------------------------------------
  {
    files: [
      'src/shared/config/*.ts',
      '*.config.{ts,mts,mjs}',
      '.storybook/**',
      'e2e/**',
      'scripts/**',
    ],
    rules: { 'no-restricted-globals': 'off' },
  },

  // ---------------------------------------------------------------------------
  // Tests
  // ---------------------------------------------------------------------------
  {
    // Scoped to `src` on purpose: Playwright's `page.getByTestId` in `e2e/`
    // looks enough like Testing Library to trip half of these rules.
    files: ['src/**/*.{test,spec}.{ts,tsx}', 'src/shared/test/**/*.{ts,tsx}'],
    ...testingLibrary.configs['flat/react'],
    rules: {
      ...testingLibrary.configs['flat/react'].rules,
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      'boundaries/dependencies': 'off',
      'no-console': 'off',
    },
  },
  {
    files: ['e2e/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-skipped-test': 'warn',
      // Playwright fixtures are declared as `async ({}, use) => …`; that `use`
      // is the fixture callback, not React's `use` hook.
      'react-hooks/rules-of-hooks': 'off',
    },
  },
  ...storybook.configs['flat/recommended'],

  // ---------------------------------------------------------------------------
  // Plain JS / config files: no type information available
  // ---------------------------------------------------------------------------
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: { ...globals.node } },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // Prettier must stay last: it only turns formatting rules off.
  prettierConfig,
)
