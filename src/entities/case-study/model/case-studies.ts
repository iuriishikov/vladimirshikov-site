/**
 * The visual identity of each case cover.
 *
 * Only the parts that are *not* text live here — colour, layout, decoration.
 * Every word on the card comes from `messages/*.json` under `Works.items`, so a
 * translator never has to open this file and a designer never has to open the
 * dictionary.
 */

import type { CompanySlug } from '@/shared/config/company-logos'

export type CaseSlug = 'samruk' | 'philipmorris' | 'atom'

/** Where the brandmark sits on the cover. */
export type CoverLayout = 'center' | 'bottom-left'

/** The one extra flourish a cover may carry, if any. */
export type CoverDecoration = 'ring' | 'outline-number-right' | 'outline-number-left'

export interface CaseStudy {
  slug: CaseSlug
  /**
   * The client whose mark the cover carries, when there is one. The third
   * project names a forty-year horizon rather than a client — none was named in
   * the source material — so it keeps its typographic mark.
   */
  company?: CompanySlug
  /** `[01]` — the index printed on the cover. */
  index: string
  /**
   * The mark as drawn on the cover. Not translated: two of the three are
   * proper names that read the same in either language, and the third names
   * the horizon of the work rather than a client, because the client was
   * never named in the source material.
   */
  wordmark: string
  /** Cover background. A raw hex, because a brand colour is not a theme token. */
  background: string
  /** Which ink the cover text uses — decided by the background's luminance. */
  ink: 'light' | 'dark'
  layout: CoverLayout
  decoration?: CoverDecoration
  /** The oversized outline digits, when the decoration calls for them. */
  decorationText?: string
  /** Small print in the opposite corner from the index. */
  badge?: string
  captionSide: 'left' | 'right'
  /**
   * Lifts the wordmark off the cover in the accent colour instead of the ink.
   * Only legible on the dark cover, which is the one the canvas drew it on.
   */
  wordmarkTone?: 'lime'
}

export const CASE_STUDIES: readonly CaseStudy[] = [
  {
    slug: 'samruk',
    company: 'samruk',
    index: '[01]',
    wordmark: 'Samruk-Kazyna',
    background: '#2b4bff',
    ink: 'light',
    layout: 'center',
    badge: '12 / 320 000+',
    captionSide: 'left',
  },
  {
    slug: 'philipmorris',
    company: 'philipmorris',
    index: '[02]',
    // A shade darker than the canvas's #e23a20 so white labels clear WCAG AA.
    // Kept in step with `--brand-red` in globals.css.
    background: '#c62f16',
    wordmark: 'Philip Morris',
    ink: 'light',
    layout: 'bottom-left',
    decoration: 'outline-number-right',
    decorationText: '02',
    captionSide: 'right',
  },
  {
    slug: 'atom',
    index: '[03]',
    wordmark: '40 Years',
    background: '#141414',
    ink: 'light',
    layout: 'center',
    decoration: 'ring',
    captionSide: 'right',
    wordmarkTone: 'lime',
  },
]
