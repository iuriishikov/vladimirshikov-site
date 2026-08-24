import { beforeEach, describe, expect, it } from 'vitest'

import { useMobileNavStore } from './mobile-nav-store'

/** Zustand stores are module singletons, so state leaks between tests. */
beforeEach(() => {
  useMobileNavStore.setState({ isOpen: false })
})

describe('useMobileNavStore', () => {
  it('starts closed', () => {
    expect(useMobileNavStore.getState().isOpen).toBe(false)
  })

  it('opens, closes and toggles', () => {
    const { open, close, toggle } = useMobileNavStore.getState()

    open()
    expect(useMobileNavStore.getState().isOpen).toBe(true)

    close()
    expect(useMobileNavStore.getState().isOpen).toBe(false)

    toggle()
    expect(useMobileNavStore.getState().isOpen).toBe(true)
    toggle()
    expect(useMobileNavStore.getState().isOpen).toBe(false)
  })

  it('is idempotent — opening twice does not require closing twice', () => {
    const { open, close } = useMobileNavStore.getState()

    open()
    open()
    close()

    expect(useMobileNavStore.getState().isOpen).toBe(false)
  })

  it('notifies subscribers on a real change', () => {
    const seen: boolean[] = []
    const unsubscribe = useMobileNavStore.subscribe((state) => {
      seen.push(state.isOpen)
    })

    useMobileNavStore.getState().open()
    useMobileNavStore.getState().close()
    unsubscribe()
    useMobileNavStore.getState().open()

    expect(seen).toStrictEqual([true, false])
  })
})
