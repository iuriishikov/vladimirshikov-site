# Security Policy

## Supported versions

This is a single deployed website, not a distributed library. Only the version currently running in
production is supported — there are no maintenance branches for older releases.

| Version                                     | Supported                        |
| ------------------------------------------- | -------------------------------- |
| Latest release on `main` (live on the site) | Yes                              |
| `rc` prereleases from `develop` (staging)   | Yes, best effort                 |
| Any earlier release                         | No — fixes land in a new release |

A fix is shipped as a new patch release and deployed; there is no backporting.

## Reporting a vulnerability

**Do not open a public issue for a security problem.**

Report privately through GitHub Security Advisories:

**<https://github.com/iuriishikov/vladimirshikov-site/security/advisories/new>**

That channel is private between you and the maintainer, and it keeps the report, the discussion and
the eventual advisory in one place.

Please include, as far as you can:

- What the issue is and why it matters — the impact, not only the mechanism
- Steps to reproduce, or a proof of concept
- The affected URL, route or component, and the version from
  `https://vladimirshikov.com/api/health`
- Anything you already know about mitigation

If you cannot use GitHub Security Advisories, open a public issue saying only that you would like to
report a security issue privately — no details — and a private channel will be arranged.

## What to expect

| Stage                                        | Target             |
| -------------------------------------------- | ------------------ |
| Acknowledgement that the report was received | Within 3 days      |
| Initial assessment and severity judgement    | Within 7 days      |
| Fix for a confirmed high-severity issue      | Within 30 days     |
| Fix for lower-severity issues                | Next release cycle |

This is a personal project maintained by one person in their own time. These are honest targets, not
a contractual SLA. You will be told if something is going to take longer, rather than left waiting.

When the fix ships, the advisory is published. If you would like credit, say so in the report and
you will be named; if you would prefer not to be, that is respected.

## Safe harbour

Good-faith security research on this site is welcome. No action will be pursued against you for
research that:

- Stays within the scope of `vladimirshikov.com` and this repository
- Avoids privacy violations, data destruction and service degradation
- Does not use social engineering, phishing or physical attacks
- Gives a reasonable window to fix the issue before public disclosure

Out of scope: denial-of-service and volumetric testing, findings from automated scanners with no
demonstrated impact, missing headers with no exploitable consequence, and vulnerabilities in
third-party services this site merely links to.

## How this project defends itself

Context for what is already covered, so you know where to look — and so you can tell when something
has regressed. The full description is in [docs/security.md](./docs/security.md).

**Supply chain.** pnpm quarantines any package version published less than 24 hours ago
(`minimumReleaseAge: 1440`), postinstall scripts are denied unless explicitly allowlisted, and
`node_modules` is isolated so a module can import only what it declares. Dependency review blocks
pull requests that introduce known advisories, and Renovate keeps dependencies current.

**Secrets.** secretlint runs on every staged file at commit time; gitleaks scans the full history in
CI. No secret is ever placed behind the `NEXT_PUBLIC_` prefix, which inlines values into the client
bundle.

**Code.** CodeQL analyses every pull request and runs weekly. TypeScript runs in strict mode, and
typescript-eslint's type-aware rules catch unsafe `any` propagation, floating promises and misused
promise returns. OSSF Scorecard grades the repository's own posture weekly.

**Runtime.** A Content-Security-Policy with a per-request nonce is applied in middleware, alongside
HSTS, `X-Content-Type-Options`, `X-Frame-Options: DENY`, a strict `Referrer-Policy`, cross-origin
isolation headers and a restrictive `Permissions-Policy`.

**Server.** The application runs as a non-root user in a read-only container with all Linux
capabilities dropped and `no-new-privileges` set. It publishes no host port — the only ingress is
Caddy terminating TLS. Deploys use a dedicated SSH key with a pinned host key, and production
deploys require reviewer approval.
