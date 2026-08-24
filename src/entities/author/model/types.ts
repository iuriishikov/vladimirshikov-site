export interface AuthorLink {
  readonly label: string
  readonly href: string
}

/**
 * Facts about the site's author that are the same in every language.
 * Anything a translator would want to touch (role, bio) lives in `messages/`.
 */
export interface Author {
  readonly name: string
  /** Fallback for the avatar before an image exists. */
  readonly initials: string
  /** Year the author started working professionally. */
  readonly since: number
  readonly links: readonly AuthorLink[]
}
