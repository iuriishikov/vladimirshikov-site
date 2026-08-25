import { create } from 'zustand'

interface MobileNavState {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

/**
 * The open/closed state of the mobile navigation.
 *
 * It lives in a store rather than in component state because two sibling client
 * components need it — the button in the header and the panel below it — and
 * lifting it would force the whole header to become a Client Component.
 */
export const useMobileNavStore = create<MobileNavState>((set) => ({
  isOpen: false,
  open: () => {
    set({ isOpen: true })
  },
  close: () => {
    set({ isOpen: false })
  },
  toggle: () => {
    set((state) => ({ isOpen: !state.isOpen }))
  },
}))
