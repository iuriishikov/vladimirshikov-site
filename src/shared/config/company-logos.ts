/**
 * The client marks, and the intrinsic size of each file.
 *
 * Lives in `shared` rather than in an entity because both the partner band and
 * the case covers draw these, and an entity may not import another entity.
 *
 * Referenced by public URL rather than imported as a module: half the set is
 * SVG, and a static SVG import would need a loader this app does not carry.
 * The dimensions are read off the files themselves, so a mark reserves its own
 * space and the row does not reflow as the logos arrive.
 */

export type CompanySlug =
  | 'philipmorris'
  | 'pfizer'
  | 'microsoft'
  | 'nestle'
  | 'rosnano'
  | 'alfabank'
  | 'rolf'
  | 'bat'
  | 'bigroup'
  | 'caterpillar'
  | 'airastana'
  | 'samruk'
  | 'kmg'
  | 'kazatomprom'
  | 'kegoc'
  | 'ktz'
  | 'samrukenergy'
  | 'supremecourt'

export interface CompanyLogo {
  /** Path under `public/`. */
  src: string
  width: number
  height: number
  /**
   * Optical correction, multiplying the box height.
   *
   * A long single-line wordmark and a stacked symbol set to the same height do
   * not read as the same size: the wordmark looks huge and the stacked mark
   * looks timid. These numbers are judged by eye, which is the only instrument
   * that applies.
   */
  scale?: number
}

/**
 * Only the companies whose mark could be sourced in a usable form. The rest are
 * set as wordmarks in the site's own type — see `CompanyMark`. Deliberately
 * `Partial`: a missing entry is a supported state, not an oversight.
 */
export const COMPANY_LOGOS: Partial<Record<CompanySlug, CompanyLogo>> = {
  philipmorris: { src: '/logos/philipmorris.svg', width: 667, height: 187 },
  pfizer: { src: '/logos/pfizer.svg', width: 1000, height: 409, scale: 0.95 },
  microsoft: { src: '/logos/microsoft.svg', width: 338, height: 72, scale: 0.95 },
  alfabank: { src: '/logos/alfabank.svg', width: 213, height: 75 },
  bat: { src: '/logos/bat.png', width: 500, height: 171 },
  caterpillar: { src: '/logos/caterpillar.svg', width: 112, height: 20, scale: 0.8 },
  airastana: { src: '/logos/airastana.png', width: 246, height: 98 },
  samruk: { src: '/logos/samruk.svg', width: 664, height: 299, scale: 1.1 },
  kmg: { src: '/logos/kmg.svg', width: 896, height: 226 },
  kazatomprom: { src: '/logos/kazatomprom.svg', width: 539, height: 321, scale: 1.25 },
  kegoc: { src: '/logos/kegoc.svg', width: 77, height: 40, scale: 1.15 },
}

/*
 * Two marks were sourced and then dropped, and it is worth writing down why so
 * that nobody re-adds them.
 *
 * BI Group is a knockout: white letters cut out of a solid ellipse. Flattened
 * to one colour the letters fill in and it reads as a black egg.
 *
 * The Supreme Court of Kazakhstan uses a finely drawn courthouse over two lines
 * of Kazakh microtype. At the height of a marquee row it is a smudge, and the
 * Kazakh line argues with the two languages the site actually speaks.
 *
 * Both are set as wordmarks instead, which is what the other five do.
 */
