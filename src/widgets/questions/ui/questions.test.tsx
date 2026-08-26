import { describe, expect, it } from 'vitest'

import { renderWithProviders, screen } from '@/shared/test/render'

import { Questions } from './questions'

describe('Questions', () => {
  it('renders the heading, the lead and every question', () => {
    renderWithProviders(<Questions />)

    expect(
      screen.getByRole('heading', { level: 2, name: 'Когда я наиболее полезен' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Не тогда, когда компании нужен ещё один консультант/)).toBeVisible()
    expect(screen.getAllByTestId('question-item')).toHaveLength(5)
  })

  it('states the questions in full rather than hiding them behind a control', () => {
    // The section replaced an accordion. Nothing here expands, so every
    // question has to be readable — and reachable by search — as it stands.
    renderWithProviders(<Questions />)

    expect(screen.getByText('Куда двигаться дальше?')).toBeVisible()
    expect(screen.getByText(/Кто может стать следующим первым лицом\?/)).toBeVisible()
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('closes on the sentence that answers the list', () => {
    renderWithProviders(<Questions />)

    expect(screen.getByText(/создать пространство для трезвого анализа/)).toBeVisible()
  })
})
