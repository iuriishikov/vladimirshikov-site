import { cn } from '../../lib/cn'

interface SkipLinkProps {
  /** The id of the main landmark, without the leading `#`. */
  targetId: string
  children: string
  className?: string
}

/**
 * The first thing in the tab order: it lets a keyboard or screen-reader user
 * jump past the navigation instead of tabbing through it on every page.
 *
 * It is visually hidden until focused — hidden with `sr-only`, not with
 * `display: none`, because a hidden element cannot receive focus at all.
 */
export function SkipLink({ targetId, children, className }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      data-testid="skip-to-content"
      className={cn(
        'sr-only',
        'focus-visible:bg-background focus-visible:text-foreground focus-visible:not-sr-only',
        'focus-visible:ring-ring focus-visible:fixed focus-visible:top-4 focus-visible:left-4',
        'focus-visible:z-50 focus-visible:rounded-md focus-visible:px-4 focus-visible:py-2',
        'focus-visible:shadow-lg focus-visible:ring-2',
        className,
      )}
    >
      {children}
    </a>
  )
}
