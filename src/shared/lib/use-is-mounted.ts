'use client'

import { useSyncExternalStore } from 'react'

function unsubscribe() {
  // Nothing to tear down: this store never emits.
}

/** Never emits, so React never re-renders because of it. */
function subscribe() {
  return unsubscribe
}

const isMountedOnClient = () => true
const isMountedOnServer = () => false

/**
 * `false` during the server render and the first client render, `true`
 * afterwards.
 *
 * The familiar `useState(false)` + `useEffect(() => setMounted(true))` pair does
 * the same job, but it sets state inside an effect — a cascading render that
 * the React Compiler lint rules reject. `useSyncExternalStore` states the same
 * idea as what it actually is: two different snapshots of one value, one on the
 * server and one on the client.
 *
 * Use it only for genuinely client-only output (a resolved theme, a device
 * capability). Anything else belongs in the server render.
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(subscribe, isMountedOnClient, isMountedOnServer)
}
