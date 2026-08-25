import { describe, expect, it } from 'vitest'

import { renderWithProviders, screen } from '../../test/render'
import { SectionHeading } from './section-heading'

describe('SectionHeading', () => {
  it('renders the title as a second-level heading', () => {
    // The page's only h1 is the hero name; every section heading sits under it.
    renderWithProviders(<SectionHeading title="Selected Works" />)

    expect(screen.getByRole('heading', { level: 2, name: 'Selected Works' })).toBeInTheDocument()
  })

  it('renders the lead when given one', () => {
    renderWithProviders(<SectionHeading title="FAQ" lead="Lorem ipsum dolor." />)

    expect(screen.getByText('Lorem ipsum dolor.')).toBeInTheDocument()
  })

  it('omits the lead paragraph entirely when there is none', () => {
    // Not merely empty — absent. An empty <p> would still take up its margin.
    renderWithProviders(<SectionHeading title="FAQ" />)

    const block = screen.getByRole('heading', { level: 2 }).parentElement
    expect(block?.children).toHaveLength(1)
  })
})
