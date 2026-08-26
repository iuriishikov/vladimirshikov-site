import { Archivo, Golos_Text } from 'next/font/google'

/**
 * The design asks for Archivo with Golos Text behind it. That pairing is not
 * decorative: Archivo has no Cyrillic, so Russian text falls through to Golos
 * Text, which was drawn for it. Declaring both in one stack lets a single
 * heading render Latin in Archivo and Cyrillic in Golos without a second rule.
 *
 * `next/font` downloads and self-hosts both at build time. That keeps the
 * Content-Security-Policy closed (no `fonts.gstatic.com` origin to allow), adds
 * no third-party request on load, and eliminates the layout shift a webfont
 * link would cause.
 */
/*
 * `subsets` is next/font's *preload* list, not its download list.
 *
 * Every subset the family publishes is self-hosted either way and served under
 * its own `unicode-range`, so Ukrainian's ї, Kazakh's ә ғ қ ң ө ұ ү і, Tajik's
 * ҷ ӣ ӯ and Vietnamese's diacritics are all still there for the editions that
 * ask for them. What naming a subset here adds is a `<link rel=preload>`, which
 * is unconditional: it fires on every page in every edition whether or not a
 * glyph from that file is ever drawn.
 *
 * Declaring all six cost 158 KB of preloads on every request — three and a half
 * times the portrait that is the measured LCP element, and fonts outrank images
 * in the browser's priority queue. On the English page five of the six could
 * not have painted anything. Naming only the two that set text above the fold
 * takes that to 57 KB and leaves the rest to be discovered from the stylesheet
 * by the pages that need them, one extra round trip covered by `display: swap`.
 */
const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-archivo',
  display: 'swap',
})

const golosText = Golos_Text({
  /*
   * Preloaded, not merely served — and on every edition, not only the Cyrillic
   * ten: the locale switcher names each language in its own script, and the
   * screen-reader half of the edition mark carries `Русский` in an `sr-only`
   * span on every page. `sr-only` clips, it does not hide, so the browser lays
   * that text out and draws it.
   */
  subsets: ['cyrillic'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-golos',
  display: 'swap',
})

/** Applied to `<html>` so both custom properties exist document-wide. */
export const fontVariables = `${archivo.variable} ${golosText.variable}`
