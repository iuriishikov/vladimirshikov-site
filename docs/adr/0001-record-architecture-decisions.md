# ADR 0001: Record architecture decisions

- **Status**: Accepted
- **Date**: 2026-08-24
- **Related**: every other ADR in this directory

## Context

This repository makes a number of choices that look arbitrary or even wrong without their reasoning:
TypeScript pinned to 6.x when 7.x exists, an FSD layer named `views` instead of `pages`, a 24-hour
quarantine on new package versions, a single VPS rather than a managed platform.

Each of those was a considered trade-off. None of them is self-evident from the code. Without a
written record, two failure modes follow:

1. Someone "fixes" a deliberate constraint — bumps TypeScript, renames the layer, deletes the
   quarantine — and rediscovers the original problem the hard way.
2. Nobody touches anything, because nobody knows which constraints are load-bearing. The codebase
   ossifies around decisions whose justification has already expired.

Commit messages do not solve this. They explain a change, not a standing position, and they are
found by accident rather than by looking.

## Decision

We keep Architecture Decision Records in `docs/adr/`, following Michael Nygard's format.

- One file per decision: `NNNN-kebab-case-title.md`, numbered sequentially from 0001.
- Every ADR carries a **Status**, a **Date**, and links to related ADRs.
- Sections: Context, Decision, Consequences, Alternatives considered, Revisit when.
- Start from [`0000-template.md`](./0000-template.md).
- **ADRs are immutable once accepted.** A decision that changes gets a new ADR; the old one's status
  becomes `Superseded by ADR NNNN` with a link. The history of a decision is itself information.
- An ADR is required when a change would be expensive to reverse or would surprise a competent
  engineer reading the code. Routine choices do not need one.

## Consequences

- **Positive**: "Why is this like this?" has a searchable answer. Onboarding gets shorter — see
  [onboarding.md](../onboarding.md), which points here for exactly that reason.
- **Positive**: Rejected alternatives are recorded by name, so the same debate does not restart from
  zero.
- **Positive**: The **Revisit when** section turns a decision into something with an expiry
  condition rather than a permanent constraint nobody dares question.
- **Negative**: Writing an ADR takes 20–30 minutes and is easy to skip under pressure.
- **Neutral**: The set of ADRs is a de facto architecture summary. It must not drift from the code —
  a PR that invalidates an ADR must update it in the same PR.

## Alternatives considered

### A wiki or an external documentation site

Rejected: documentation that lives outside the repository is not reviewed with the code and drifts
within weeks. ADRs in `docs/` are part of the diff, and a reviewer sees when one should have been
updated.

### Long comments in the code

Rejected: a decision like "TypeScript 6 not 7" has no natural home in any single source file, and
comments are read only by whoever is already in that file. ADRs are found by browsing.

### Nothing — rely on commit messages and memory

Rejected: this is a personal project with intermittent, sometimes months-apart working sessions. The
future reader is the same person with none of the context, which is the exact case ADRs exist for.

## Revisit when

Never, realistically. If the ADR directory becomes stale enough that people stop trusting it, the
problem is enforcement in review, not the format.
