export interface MessageTree {
  [key: string]: string | MessageTree
}

function isTree(value: unknown): value is MessageTree {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Lays a translation over the English dictionary, key by key.
 *
 * Forty editions are a lot of surface for a key to go missing from, and a
 * missing key is not a small failure: next-intl throws in development and
 * prints the raw key path in production, so one omission turns into
 * `Profile.statLabel2` sitting in the middle of a page.
 *
 * The English file is therefore the shape of every edition, and a translation
 * only has to supply what it has actually translated. Anything it does not
 * carry falls through to English, which is a sentence the visitor can read.
 *
 * Only leaves are replaced; a branch present in both is merged rather than
 * swapped, so a translation that fills in half of `Note.growth` keeps the
 * English half rather than deleting it.
 */
export function mergeMessages(base: MessageTree, override: MessageTree): MessageTree {
  const merged: MessageTree = { ...base }

  for (const [key, value] of Object.entries(override)) {
    const existing = merged[key]

    if (isTree(value) && isTree(existing)) {
      merged[key] = mergeMessages(existing, value)
      continue
    }

    // An empty string is a deliberate value in this dictionary — several
    // section leads are blank on purpose — so it must not be treated as absent.
    if (typeof value === 'string' || isTree(value)) {
      merged[key] = value
    }
  }

  return merged
}
