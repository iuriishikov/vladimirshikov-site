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

  it('lists every entry with its school and faculty', () => {
    renderWithProviders(<Education />)

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Московский государственный университет им. М. В. Ломоносова',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Факультет психологии')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: 'ВПВПООРКУ КГБ СССР' }),
    ).toBeInTheDocument()
  })

  it('keeps the anchor the navigation links to', () => {
    renderWithProviders(<Education />)

    // The header's "Education" link is a fragment link; losing the id turns it
    // into a no-op that no type check would catch.
    expect(document.querySelector('section#education')).toBeInTheDocument()
  })
})
