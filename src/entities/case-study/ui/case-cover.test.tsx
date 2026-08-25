import { describe, expect, it } from 'vitest'

import { renderWithProviders, screen } from '@/shared/test/render'

import { CASE_STUDIES } from '../model/case-studies'
import { CaseCover } from './case-cover'

const [loremova, ipsumo, dolorix] = CASE_STUDIES

describe('CaseCover', () => {
  it('shows the wordmark, the index and the caption', () => {
    if (!loremova) throw new Error('expected a first case study')
    renderWithProviders(<CaseCover caseStudy={loremova} caption="Lorem ipsum dolor sit amet" />)

    expect(screen.getByText('Loremova®')).toBeInTheDocument()
    expect(screen.getByText('[01]')).toBeInTheDocument()
    expect(screen.getByText('Lorem ipsum dolor sit amet')).toBeInTheDocument()
  })

  it('renders the badge only when the case has one', () => {
    if (!loremova || !dolorix) throw new Error('expected three case studies')

    const view = renderWithProviders(<CaseCover caseStudy={loremova} caption="c" />)
    expect(screen.getByText('® 2025')).toBeInTheDocument()
    view.unmount()

    renderWithProviders(<CaseCover caseStudy={dolorix} caption="c" />)
    expect(screen.queryByText('® 2025')).not.toBeInTheDocument()
  })

  it('keeps the outline digits out of the accessibility tree', () => {
    if (!ipsumo) throw new Error('expected a second case study')
    // They repeat the index that is already announced beside them.
    renderWithProviders(<CaseCover caseStudy={ipsumo} caption="c" />)

    const decoration = screen.getByTestId('case-cover').querySelector('[aria-hidden="true"]')
    expect(decoration).toHaveTextContent('02')
  })

  it('paints the cover in the case colour', () => {
    if (!loremova) throw new Error('expected a first case study')
    renderWithProviders(<CaseCover caseStudy={loremova} caption="c" />)

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
