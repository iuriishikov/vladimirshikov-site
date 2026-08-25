import type { Decorator, Preview } from '@storybook/nextjs-vite'
import { IntlErrorCode, NextIntlClientProvider } from 'next-intl'
import { ThemeProvider } from 'next-themes'
import { useEffect, type ComponentProps, type ReactNode } from 'react'

import en from '../messages/en.json'
import ru from '../messages/ru.json'

import '../src/app/_styles/globals.css'

const messagesByLocale = { ru, en }

type StoryLocale = keyof typeof messagesByLocale
type StoryTheme = 'dark' | 'light'
type IntlProviderProps = ComponentProps<typeof NextIntlClientProvider>

/**
 * Storybook globals are untyped strings coming from the URL, so they are
 * narrowed rather than cast: an unknown value falls back to the site default
 * instead of rendering a story against a catalogue that does not exist.
 */
const resolveLocale = (value: unknown): StoryLocale => (value === 'en' ? 'en' : 'ru')
const resolveTheme = (value: unknown): StoryTheme => (value === 'dark' ? 'dark' : 'light')

/**
 * Stories are written before the copy exists, and a component under development
 * legitimately reads keys the catalogue has not caught up with yet. next-intl
 * throws on a missing message, which would blank the canvas — here the useful
 * behaviour is to render the key and keep the story interactive.
 */
const onIntlError: NonNullable<IntlProviderProps['onError']> = (error) => {
  if (error.code !== IntlErrorCode.MISSING_MESSAGE) {
    console.error(error)
  }
}

const getIntlMessageFallback: NonNullable<IntlProviderProps['getMessageFallback']> = ({
  key,
  namespace,
}) => (namespace ? `${namespace}.${key}` : key)

// A fixed clock keeps relative dates ("2 days ago") identical between runs, so
// a snapshot never fails because the calendar moved.
const STORY_NOW = new Date('2026-01-01T12:00:00.000Z')
const STORY_TIME_ZONE = 'UTC'

function DocumentLocale({ children, locale }: { children: ReactNode; locale: StoryLocale }) {
  // Screen readers and axe take the language from the document, not from the
  // story root: without this, a Russian story is announced with English
  // pronunciation rules.
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return children
}

const withIntl: Decorator = (Story, context) => {
  const locale = resolveLocale(context.globals.locale)

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messagesByLocale[locale]}
      timeZone={STORY_TIME_ZONE}
      now={STORY_NOW}
      onError={onIntlError}
      getMessageFallback={getIntlMessageFallback}
    >
      <DocumentLocale locale={locale}>
        <Story />
      </DocumentLocale>
    </NextIntlClientProvider>
  )
}

const withTheme: Decorator = (Story, context) => {
  const theme = resolveTheme(context.globals.theme)

  return (
    <ThemeProvider
      // Must match the app: globals.css declares `@custom-variant dark` against
      // a `.dark` class, so a data attribute alone would style nothing.
      attribute="class"
      themes={['light', 'dark']}
      defaultTheme={theme}
      // The toolbar is the single source of truth inside Storybook: neither the
      // OS preference nor a value left in storage by an earlier story may
      // override a deliberately selected theme. The trade-off is that a theme
      // toggle rendered in a story cannot repaint the canvas itself — switch
      // themes from the toolbar to see both states.
      forcedTheme={theme}
      enableSystem={false}
      disableTransitionOnChange
      storageKey="storybook-theme"
    >
      <Story />
    </ThemeProvider>
  )
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(?:background|color)$/i,
        date: /Date$/i,
      },
    },
    // Fail the story rather than annotate it — an accessibility regression is a
    // regression. A story mid-migration can downgrade itself with
    // `parameters: { a11y: { test: 'todo' } }`.
    a11y: { test: 'error' },
    layout: 'centered',
  },

  // Every component gets a generated docs page unless it opts out with
  // `tags: ['!autodocs']`.
  tags: ['autodocs'],

  globalTypes: {
    locale: {
      description: 'next-intl locale the story is rendered in',
      toolbar: {
        title: 'Locale',
        icon: 'globe',
        items: [
          { value: 'ru', title: 'Русский' },
          { value: 'en', title: 'English' },
        ],
        dynamicTitle: true,
      },
    },
    theme: {
      description: 'Colour scheme applied to the preview document',
      toolbar: {
        title: 'Theme',
        icon: 'contrast',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },

  initialGlobals: {
    locale: 'ru',
    theme: 'light',
  },

  // The last decorator is the outermost wrapper: the theme is established
  // before the translations mount inside it.
  decorators: [withIntl, withTheme],
}

export default preview
