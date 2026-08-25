import { describe, expect, it } from 'vitest'

import { renderWithProviders, screen } from '@/shared/test/render'

import { Faq } from './faq'

const LEAD =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.'
const FIRST_ANSWER = /Sed ut perspiciatis unde omnis iste natus error/
const SECOND_ANSWER = /Nemo enim ipsam voluptatem quia voluptas/

const questions = (): HTMLElement[] => screen.getAllByTestId('faq-item')

/** Every answer panel, open or closed — `hidden: true` keeps the closed ones. */
const panelIds = (): string[] =>
  screen.getAllByRole('region', { hidden: true }).map((panel) => panel.id)

describe('Faq', () => {
  it('renders the heading, the lead and every question', () => {
    renderWithProviders(<Faq />)

    expect(screen.getByRole('heading', { level: 2, name: 'FAQ' })).toBeInTheDocument()
    expect(screen.getByText(LEAD)).toBeInTheDocument()
    expect(questions()).toHaveLength(5)
  })

  it('starts with every answer closed', () => {
    renderWithProviders(<Faq />)

    for (const question of questions()) {
      expect(question).toHaveAttribute('aria-expanded', 'false')
    }
    expect(screen.getByText(FIRST_ANSWER)).not.toBeVisible()
  })

  it('opens the pressed answer', async () => {
    const { user } = renderWithProviders(<Faq />)

    await user.click(questions()[0]!)

    expect(questions()[0]).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(FIRST_ANSWER)).toBeVisible()
  })

  it('closes the open answer when another is opened', async () => {
    const { user } = renderWithProviders(<Faq />)

    await user.click(questions()[0]!)
    await user.click(questions()[1]!)

    expect(questions()[1]).toHaveAttribute('aria-expanded', 'true')
    expect(questions()[0]).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText(SECOND_ANSWER)).toBeVisible()
    expect(screen.getByText(FIRST_ANSWER)).not.toBeVisible()
  })

  it('collapses the list when the open question is pressed again', async () => {
    const { user } = renderWithProviders(<Faq />)

    await user.click(questions()[0]!)
    await user.click(questions()[0]!)

    expect(questions()[0]).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText(FIRST_ANSWER)).not.toBeVisible()
  })

  it('points aria-controls at a panel that exists whether open or closed', async () => {
    const { user } = renderWithProviders(<Faq />)
    const panelId = questions()[1]!.getAttribute('aria-controls')

    // A dangling aria-controls is a promise to a screen reader that the markup
    // does not keep, so a closed panel is hidden rather than unmounted.
    expect(panelIds()).toContain(panelId)

    await user.click(questions()[1]!)

    expect(panelIds()).toContain(panelId)
  })
})
