import { describe, expect, it } from 'vitest'

import { cn } from './cn'

describe('cn', () => {
  it('joins truthy class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('drops falsy values', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b')
  })

  it('lets the later Tailwind utility win a conflict', () => {
    // This is the whole reason twMerge is here: a caller-supplied `className`
    // must be able to override a component default.
    expect(cn('p-2', 'p-4')).toBe('p-4')
    expect(cn('text-sm text-red-500', 'text-blue-500')).toBe('text-sm text-blue-500')
  })

  it('keeps non-conflicting utilities from both sides', () => {
    expect(cn('rounded-md px-3', 'py-2')).toBe('rounded-md px-3 py-2')
  })

  it('accepts arrays and objects', () => {
    expect(cn(['a', 'b'], { c: true, d: false })).toBe('a b c')
  })
})
