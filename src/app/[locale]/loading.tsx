import { Container } from '@/shared/ui'

/**
 * The instant fallback for a streaming navigation. It mirrors the real page's
 * block sizes so the layout does not jump when the content arrives.
 */
export default function LocaleLoading() {
  return (
    <Container className="py-16 sm:py-24" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      <div className="bg-muted h-4 w-32 animate-pulse rounded" />
      <div className="bg-muted mt-4 h-12 w-3/4 animate-pulse rounded" />
      <div className="bg-muted mt-4 h-6 w-1/2 animate-pulse rounded" />
      <div className="mt-8 flex gap-3">
        <div className="bg-muted h-12 w-32 animate-pulse rounded-lg" />
        <div className="bg-muted h-12 w-32 animate-pulse rounded-lg" />
      </div>
    </Container>
  )
}
