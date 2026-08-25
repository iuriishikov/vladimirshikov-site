/**
 * The visual identity of each case cover.
 *
 * Only the parts that are *not* text live here — colour, layout, decoration.
 * Every word on the card comes from `messages/*.json` under `Works.items`, so a
 * translator never has to open this file and a designer never has to open the
 * dictionary.
 */

export type CaseSlug = 'loremova' | 'ipsumo' | 'dolorix' | 'ametra' | 'consecta' | 'elitra'

/** Where the brandmark sits on the cover. */
export type CoverLayout = 'center' | 'bottom-left'

/** The one extra flourish a cover may carry, if any. */
export type CoverDecoration = 'ring' | 'outline-number-right' | 'outline-number-left'

export interface CaseStudy {
  slug: CaseSlug
  /** `[01]` — the index printed on the cover. */
  index: string
  /** The brandmark as drawn, including its ® or ™. Not translated. */
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
}

export const CASE_STUDIES: readonly CaseStudy[] = [
  {
    slug: 'loremova',
    index: '[01]',
    wordmark: 'Loremova®',
    background: '#2b4bff',
    ink: 'light',
    layout: 'center',
    badge: '® 2025',
    captionSide: 'left',
  },
  {
    slug: 'ipsumo',
    index: '[02]',
    wordmark: 'Ipsumo™',
    background: '#e9ff2f',
    ink: 'dark',
    layout: 'bottom-left',
    decoration: 'outline-number-right',
    decorationText: '02',
    captionSide: 'right',
  },
  {
    slug: 'dolorix',
    index: '[03]',
    wordmark: 'Dolorix',
    // A shade darker than the canvas's #e23a20 so white labels clear WCAG AA.
    // Kept in step with `--brand-red` in globals.css.
    background: '#c62f16',
    ink: 'light',
    layout: 'center',
    decoration: 'ring',
    captionSide: 'right',
  },
  {
    slug: 'ametra',
    index: '[04]',
    wordmark: 'ametra™',
    background: '#cbbcf6',
    ink: 'dark',
    layout: 'center',
    captionSide: 'left',
  },
  {
    slug: 'consecta',
    index: '[05]',
    wordmark: 'Consecta©',
    background: '#5ed13d',
    ink: 'dark',
    layout: 'bottom-left',
    decoration: 'outline-number-left',
    decorationText: '05',
    captionSide: 'right',
  },
  {
    slug: 'elitra',
    index: '[06]',
    wordmark: 'Elitra®',
    background: '#141414',
    ink: 'light',
    layout: 'center',
    captionSide: 'left',
  },
]
