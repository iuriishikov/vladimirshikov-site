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
 * The subsets are the site's language list. Between them these two cover the
 * Latin and Cyrillic writing systems, which is exactly the set of editions
 * `shared/i18n/locales` publishes — nothing there can be added that the type
 * cannot draw.
 *
 * Each subset is a separate file served under its own `unicode-range`, so a
 * visitor reading the English edition never downloads the Cyrillic or the
 * Vietnamese one. Widening the list costs the pages that do not need it
 * nothing.
 */
const archivo = Archivo({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-archivo',
  display: 'swap',
})

const golosText = Golos_Text({
  // `cyrillic-ext` is not optional decoration: Ukrainian's ї and є, Kazakh's ә,
  // ғ, қ, ң, ө, ұ, ү, і and Tajik's ҷ, ӣ, ӯ all live there. Without it those
  // editions would be set in a system fallback, one letter at a time.
  subsets: ['latin', 'cyrillic', 'cyrillic-ext'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-golos',
  display: 'swap',
})

/** Applied to `<html>` so both custom properties exist document-wide. */
export const fontVariables = `${archivo.variable} ${golosText.variable}`
