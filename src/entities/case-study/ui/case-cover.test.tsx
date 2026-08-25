import { describe, expect, it } from 'vitest'

import { renderWithProviders, screen } from '@/shared/test/render'

import { CASE_STUDIES } from '../model/case-studies'
import { CaseCover } from './case-cover'

const [samruk, philipMorris, atom] = CASE_STUDIES

describe('CaseCover', () => {
  it('shows the wordmark, the index and the caption', () => {
    if (!samruk) throw new Error('expected a first case study')
    renderWithProviders(<CaseCover caseStudy={samruk} caption="Трансформация культуры" />)

    expect(screen.getByText('Samruk-Kazyna')).toBeInTheDocument()
    expect(screen.getByText('[01]')).toBeInTheDocument()
    expect(screen.getByText('Трансформация культуры')).toBeInTheDocument()
  })

  it('renders the badge only when the case has one', () => {
    if (!samruk || !atom) throw new Error('expected three case studies')

    // `\s` rather than a literal space: the thousands separator is a
    // non-breaking space, so that the number never splits across two lines.
    const badge = /12 \/ 320\s000\+/

    const view = renderWithProviders(<CaseCover caseStudy={samruk} caption="c" />)
    expect(screen.getByText(badge)).toBeInTheDocument()
    view.unmount()

    renderWithProviders(<CaseCover caseStudy={atom} caption="c" />)
    expect(screen.queryByText(badge)).not.toBeInTheDocument()
  })

  it('keeps the outline digits out of the accessibility tree', () => {
    if (!philipMorris) throw new Error('expected a second case study')
    // They repeat the index that is already announced beside them.
    renderWithProviders(<CaseCover caseStudy={philipMorris} caption="c" />)

    const decoration = screen.getByTestId('case-cover').querySelector('[aria-hidden="true"]')
    expect(decoration).toHaveTextContent('02')
  })

  it('paints the cover in the case colour', () => {
    if (!samruk) throw new Error('expected a first case study')
    renderWithProviders(<CaseCover caseStudy={samruk} caption="c" />)

    expect(screen.getByTestId('case-cover')).toHaveStyle({ backgroundColor: '#2b4bff' })
  })

  it('covers every case in the catalogue without throwing', () => {
    for (const caseStudy of CASE_STUDIES) {
      const view = renderWithProviders(<CaseCover caseStudy={caseStudy} caption="caption" />)
      expect(screen.getByText(caseStudy.wordmark)).toBeInTheDocument()
      view.unmount()
    }
  })
})
