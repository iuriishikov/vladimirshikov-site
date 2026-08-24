import { describe, expect, it } from 'vitest'

import { formatDate, formatDuration, formatNumber } from './format'

describe('formatDate', () => {
  it('renders the same instant differently per locale', () => {
    const date = new Date('2026-08-24T12:00:00.000Z')
    expect(formatDate(date, 'en')).toBe('August 24, 2026')
    expect(formatDate(date, 'ru')).toBe('24 августа 2026 г.')
  })

  it('pins the timezone so a server and a browser agree', () => {
    // Without an explicit UTC timezone this instant is the 24th in Moscow and
    // the 23rd in New York, which shows up as a hydration mismatch.
    expect(formatDate('2026-08-24T01:00:00.000Z', 'en')).toBe('August 24, 2026')
  })

  it('accepts strings, numbers and Date objects alike', () => {
    const expected = 'August 24, 2026'
    expect(formatDate('2026-08-24T12:00:00.000Z', 'en')).toBe(expected)
    expect(formatDate(Date.parse('2026-08-24T12:00:00.000Z'), 'en')).toBe(expected)
    expect(formatDate(new Date('2026-08-24T12:00:00.000Z'), 'en')).toBe(expected)
  })
})

describe('formatNumber', () => {
  it('uses locale-specific grouping', () => {
    expect(formatNumber(1234.5, 'en', { minimumFractionDigits: 1 })).toBe('1,234.5')
    // Russian groups with a narrow no-break space, hence the loose assertion.
    expect(formatNumber(1234.5, 'ru', { minimumFractionDigits: 1 })).toMatch(/^1\s?234,5$/u)
  })
})

describe('formatDuration', () => {
  it('renders the largest meaningful units', () => {
    expect(formatDuration(0)).toBe('0m')
    expect(formatDuration(59)).toBe('0m')
    expect(formatDuration(90)).toBe('1m')
    expect(formatDuration(3661)).toBe('1h 1m')
    expect(formatDuration(90_061)).toBe('1d 1h 1m')
  })

  it('never renders a negative duration', () => {
    expect(formatDuration(-10)).toBe('0m')
  })

  it('omits a zero minutes segment when a larger unit is present', () => {
    expect(formatDuration(7200)).toBe('2h')
  })
})
