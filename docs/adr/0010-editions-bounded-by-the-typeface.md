# ADR 0010: Publish every edition the typeface can set, and no more

- **Status**: Accepted
- **Date**: 2026-08-25
- **Related**: [ADR 0009](./0009-next-intl-for-i18n.md) (amends its locale set and default)

## Context

[ADR 0009](./0009-next-intl-for-i18n.md) chose next-intl and declared two locales, `ru` (default) and
`en`. The site now publishes forty, and English is the default. This records why, and where the list
stops.

Two questions had to be answered, and only one of them is about audiences.

**Which languages?** The site sets its type in Archivo (headings and Latin body) with Golos Text
behind it for Cyrillic — see `src/shared/config/fonts.ts`. `next/font` self-hosts both, and the
subsets each offers are a fact, not a preference:

- Archivo: `latin`, `latin-ext`, `vietnamese`
- Golos Text: `latin`, `latin-ext`, `cyrillic`, `cyrillic-ext`

Between them that is the Latin and Cyrillic writing systems. A language written in Chinese, Japanese,
Korean, Arabic, Hebrew, Devanagari, Thai, Greek, Armenian or Georgian has no glyphs in either face. It
would not fail loudly; it would fall through to whatever the operating system supplies, at a different
weight, a different x-height and a different rhythm, one paragraph at a time. A 96px display heading
set half in Archivo and half in a system fallback is not a translated site — it is a broken one.

**How do forty of them fit in a header bar?** They do not. Two codes are on show and the other
thirty-eight are one press away.

## Decision

**The locale list is the coverage of the type.** `src/shared/i18n/locales.ts` holds the catalogue —
forty entries, each with its endonym, its writing system and its `hreflang` tag — and `routing.ts`
derives the routing from it. Adding a language means first proving the type can set it.

**English is the default.** It is the fallback for a visitor whose browser asks for a language the
site does not serve, and the `x-default` a crawler is pointed at. Content negotiation stays on, so a
browser asking for any published edition still lands on it. This is the part of ADR 0009 that is
amended: Russian remains the language the copy was written in, and the one the English is translated
_from_, but it is no longer the fallback for the whole world.

**English is also the shape of every dictionary.** `mergeMessages` lays each translation over
`messages/en.json`, so a key a translator missed renders an English sentence rather than the string
`Profile.statLabel2`. Forty dictionaries are too much surface to assume perfection from.

**What can be checked mechanically is checked in CI.** `src/shared/i18n/dictionaries.test.ts` asserts
that every declared locale has a file, that no dictionary has lost or invented a key, that no ICU
placeholder was translated, that the strings sitting in fixed-width furniture still fit it, and that
no dictionary is simply a copy of the English.

**Two editions in the bar, forty in an index.** The header keeps `en [ru]` — and adds the current
edition when it is neither — followed by a count that opens a `<details>` listing every edition in its
own language and its own script. A disclosure element rather than a scripted menu, so the index opens,
closes and is keyboard-reachable with no JavaScript, and all forty URLs are in the markup.

## Consequences

- **Positive**: the boundary of the list is a fact about the build, not a matter of taste, so the
  argument about which language to add next has an answer.
- **Positive**: a missing translation degrades to a readable English sentence instead of a key path.
- **Positive**: every edition is a real, indexable URL with `hreflang` alternates to the other
  thirty-nine.
- **Negative**: the translations are machine-produced. They have not been reviewed by speakers, and
  for a site that sells judgement, a clumsy sentence in Latvian costs more than having no Latvian.
  The mechanical checks in CI catch structure, never tone. Any edition that matters commercially
  should be read by a human before it is relied on.
- **Negative**: each page now carries forty-one `<link rel="alternate">` tags, and the sitemap lists
  240 URLs with alternates on each. Both are legal and within crawler limits, but the head of every
  document is measurably heavier.
- **Negative**: `messages/` is forty files. A change to the English copy is a change to forty
  dictionaries, and the parity test will say so loudly. That is the intended cost.

## Alternatives considered

### Machine-translate at request time

A translation proxy or an API call per render. Rejected: it puts a network dependency in front of
every page, it cannot be indexed reliably, and it makes the copy non-deterministic — the same URL
would render differently on two days.

### Ship only the languages a human can review

Honest, and much smaller. Rejected because it was not what was asked for, and because the fallback
architecture makes the failure mode of a bad translation survivable rather than catastrophic. Recorded
here so the trade is visible: this ADR chooses reach over certainty, deliberately.

### Add web fonts to cover more writing systems

Would extend the list past Latin and Cyrillic. Rejected for now: a third and fourth face is a design
decision about how the site looks in those scripts, not a configuration change, and the pairing would
have to be drawn rather than picked.
