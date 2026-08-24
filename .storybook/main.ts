import { fileURLToPath } from 'node:url'
import type { StorybookConfig } from '@storybook/nextjs-vite'
import { mergeConfig } from 'vite'

/**
 * `__dirname` does not exist in an ESM config file, and Storybook loads this
 * module as ESM. Resolving against `import.meta.url` is the portable form and
 * keeps the alias correct no matter which directory Storybook is invoked from.
 */
const srcDirectory = fileURLToPath(new URL('../src', import.meta.url))

const config: StorybookConfig = {
  framework: {
    name: '@storybook/nextjs-vite',
    options: {},
  },

  // Stories live next to the component they document, inside the FSD slice that
  // owns it — never in a central `stories/` folder.
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],

  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],

  // Stories serve static assets from the same paths the app does, so a
  // component referencing `/logo.svg` looks identical in both.
  staticDirs: ['../public'],

  typescript: {
    // Reads the real TypeScript types instead of inferring from runtime
    // propTypes, which is what makes the generated props tables accurate.
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
    },
  },

  core: {
    // Storybook also builds in CI, where telemetry is noise rather than signal.
    disableTelemetry: true,
  },

  // Vite does not read `paths` from tsconfig.json, so the `@/*` alias that the
  // rest of the codebase imports through has to be registered here too.
  viteFinal: (viteConfig) =>
    mergeConfig(viteConfig, {
      resolve: {
        alias: {
          '@': srcDirectory,
        },
      },
    }),
}

export default config
