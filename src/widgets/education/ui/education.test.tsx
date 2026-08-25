import { describe, expect, it } from 'vitest'

import { renderWithProviders, screen } from '@/shared/test/render'

import { Education } from './education'

describe('Education', () => {
  it('renders the heading and lead from the dictionary', () => {
    renderWithProviders(<Education />)

    // A renamed or missing message key is the likeliest regression here: the
    // section would still render, just with the key echoed back as its title.
    expect(screen.getByRole('heading', { level: 2, name: 'Образование' })).toBeInTheDocument()
  })

  it('lists every entry with its school, degree and years', () => {
    renderWithProviders(<Education />)

    expect(screen.getAllByRole('listitem')).toHaveLength(4)
    expect(
      screen.getByRole('heading', { level: 3, name: 'Lorem Ipsum University' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Магистр Adipiscing Elit')).toBeInTheDocument()
    expect(screen.getByText('2010 — 2014')).toBeInTheDocument()
  })

  it('keeps the anchor the navigation links to', () => {
    renderWithProviders(<Education />)

    // The header's "Education" link is a fragment link; losing the id turns it
    // into a no-op that no type check would catch.
    expect(document.querySelector('section#education')).toBeInTheDocument()
  })
})
