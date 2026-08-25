import { describe, expect, it } from 'vitest'

import { renderWithProviders, screen } from '@/shared/test/render'

import { Profile } from './profile'

describe('Profile', () => {
  it('heads the section at level two, under the hero name', () => {
    renderWithProviders(<Profile />)

    // One h1 per page, and it belongs to the hero — every section heading here
    // has to sit below it or the outline breaks.
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent('Владимир')
    expect(heading).toHaveTextContent('Шиков')
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  })

  it('renders the tag, the role lines and the prose from the dictionary', () => {
    renderWithProviders(<Profile />, { locale: 'en' })

    expect(screen.getByText('[ About ]')).toBeInTheDocument()
    expect(screen.getByText(/Partner at TEAM LEAD/)).toBeInTheDocument()
    expect(screen.getByText(/Strategy • Transformation • People/)).toBeInTheDocument()
    expect(screen.getByText(/three lenses at once/)).toBeInTheDocument()
    // The career paragraph is the one that arrived last; a section that renders
    // the lead and the body but silently drops it would otherwise look fine.
    expect(screen.getByText(/PDP Group CIS/)).toBeInTheDocument()
  })

  it('lists all three statistics with their labels', () => {
    renderWithProviders(<Profile />, { locale: 'en' })

    const stats = screen.getAllByRole('listitem')
    expect(stats).toHaveLength(3)
    expect(stats[0]).toHaveTextContent('25+')
    expect(stats[0]).toHaveTextContent('years working with businesses')
    expect(stats[1]).toHaveTextContent(/320,000\+/)
    expect(stats[2]).toHaveTextContent('C-level')
  })

  it('anchors the section so the navigation can jump to it', () => {
    renderWithProviders(<Profile />)

    // The header's "about" link points at #about.
    expect(document.querySelector('section#about')).toBeInTheDocument()
  })
})
