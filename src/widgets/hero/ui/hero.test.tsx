import { describe, expect, it } from 'vitest'

import { renderWithProviders, screen } from '@/shared/test/render'

import { Hero } from './hero'

describe('Hero', () => {
  it('sets the name as the page heading', () => {
    renderWithProviders(<Hero />)

    // Level 1 and nothing else: the rest of the page starts at h2, so this
    // heading is the document outline's root.
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Владимир Шиков')
  })

  it('renders the meta columns and the statement from the dictionary', () => {
    renderWithProviders(<Hero />, { locale: 'en' })

    // Three parallel facts, so assistive technology should be told there are
    // three of them rather than reading six disconnected lines.
    const columns = screen.getAllByRole('listitem')
    expect(columns).toHaveLength(3)
    expect(columns[0]).toHaveTextContent('Digital Designer')
    expect(columns[0]).toHaveTextContent('& Art Director')
    expect(columns[1]).toHaveTextContent('Based in')
    expect(columns[2]).toHaveTextContent('Working')

    expect(screen.getByText(/lorem ipsum dolor sit amet/i)).toBeInTheDocument()
  })

  it('anchors the section so the navigation can jump back to it', () => {
    renderWithProviders(<Hero />)

    // The header's "home" link and the logo both point at #top.
    expect(document.querySelector('section#top')).toBeInTheDocument()
  })
})
