'use client'

import { useEffect } from 'react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * The last line of defence: it replaces the root layout, so there is no
 * provider, no theme and no translation available here. Everything it needs is
 * inlined deliberately — a dependency at this level is a dependency that can
 * itself be the thing that failed.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Root layout error', error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          backgroundColor: '#ffffff',
          color: '#0a0a0a',
        }}
      >
        <main style={{ maxWidth: '32rem', padding: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Something went wrong</h1>
          <p style={{ marginTop: '0.75rem', lineHeight: 1.6 }}>
            The page could not be rendered. The error has been logged.
          </p>
          {error.digest !== undefined && (
            <p
              style={{
                marginTop: '0.75rem',
                fontFamily: 'ui-monospace, monospace',
                fontSize: '0.75rem',
              }}
            >
              Error reference: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: '1.5rem',
              padding: '0.625rem 1.25rem',
              borderRadius: '0.375rem',
              border: '1px solid #0a0a0a',
              background: '#0a0a0a',
              color: '#ffffff',
              cursor: 'pointer',
              font: 'inherit',
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
