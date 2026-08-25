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
const archivo = Archivo({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-archivo',
  display: 'swap',
})

const golosText = Golos_Text({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-golos',
  display: 'swap',
})

/** Applied to `<html>` so both custom properties exist document-wide. */
export const fontVariables = `${archivo.variable} ${golosText.variable}`
