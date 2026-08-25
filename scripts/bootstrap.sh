#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# bootstrap.sh — get a fresh checkout to the point where `pnpm dev` works.
#
# WHAT IT DOES
#   1. Checks Node against .nvmrc and stops early if the major version differs —
#       a mismatched Node produces install errors that look like code bugs.
#   2. Activates the exact pnpm from package.json#packageManager via corepack,
#      so nobody installs with a different resolver than CI uses.
#   3. Installs dependencies from the frozen lockfile.
#   4. Creates .env.local from .env.example when it is missing. An existing file
#      is never touched.
#   5. Installs the Playwright browser used by the e2e suite.
#
# ASSUMPTIONS
#   * Node 24 is on PATH (nvm, fnm, mise, asdf or a system install).
#   * Network access to the npm registry and to Playwright's CDN.
#   * Run from anywhere inside the checkout.
#
# Safe to re-run: every step is either idempotent or a no-op when already done.
#
# Usage:
#   scripts/bootstrap.sh
#   SKIP_PLAYWRIGHT=1 scripts/bootstrap.sh   # skip the ~200 MB browser download
# -----------------------------------------------------------------------------
set -Eeuo pipefail

SKIP_PLAYWRIGHT="${SKIP_PLAYWRIGHT:-0}"

step() { printf '\n== %s\n' "$*"; }
log() { printf '  %s\n' "$*"; }
warn() { printf '  WARN  %s\n' "$*" >&2; }
die() {
  printf '\nERROR %s\n' "$*" >&2
  exit 1
}

trap 'printf "\nERROR failed at line %s: %s\n" "${LINENO}" "${BASH_COMMAND}" >&2' ERR

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
cd "${ROOT_DIR}"

[ -f package.json ] || die "package.json not found in ${ROOT_DIR}"

# --- Node --------------------------------------------------------------------
step 'Node'
command -v node >/dev/null 2>&1 ||
  die "Node.js is not installed. Install the version in .nvmrc (see https://github.com/nvm-sh/nvm)."

[ -f .nvmrc ] || die '.nvmrc is missing; cannot verify the Node version'
expected_node="$(tr -d '[:space:]' <.nvmrc)"
actual_node="$(node --version)"          # v24.4.1
actual_major="${actual_node#v}"          # 24.4.1
actual_major="${actual_major%%.*}"       # 24

if [ "${actual_major}" != "${expected_node%%.*}" ]; then
  die "Node ${expected_node}.x is required, found ${actual_node}.
  With nvm:  nvm install && nvm use
  With fnm:  fnm use --install-if-missing
  With mise: mise install node@${expected_node}"
fi
log "node ${actual_node} (matches .nvmrc)"

# --- pnpm --------------------------------------------------------------------
step 'Package manager'
# Read the pin straight out of package.json rather than hardcoding it here;
# there must be exactly one source of truth for the pnpm version.
expected_pm="$(sed -n 's/.*"packageManager"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' package.json)"
[ -n "${expected_pm}" ] || die 'package.json has no "packageManager" field'
log "pinned to ${expected_pm}"

if command -v corepack >/dev/null 2>&1; then
  # `corepack enable` needs write access to Node's bin directory. On a system
  # Node install that means sudo, which is not this script's business to
  # request — fall back to reporting it.
  if ! corepack enable >/dev/null 2>&1; then
    warn 'corepack enable failed (no write access to the Node install?).'
    warn "Run it once yourself: sudo corepack enable"
  fi
  corepack prepare "${expected_pm}" --activate >/dev/null
else
  warn 'corepack is not available in this Node build.'
  warn "Install pnpm manually: npm install -g ${expected_pm}"
fi

command -v pnpm >/dev/null 2>&1 || die 'pnpm is still not on PATH; see the warnings above'
log "pnpm $(pnpm --version)"

# --- dependencies ------------------------------------------------------------
step 'Dependencies'
log 'installing from pnpm-lock.yaml (frozen)'
pnpm install --frozen-lockfile

# --- environment file --------------------------------------------------------
step 'Environment'
if [ -f .env.local ]; then
  log '.env.local already exists — leaving it alone'
elif [ -f .env.example ]; then
  cp .env.example .env.local
  log 'created .env.local from .env.example'
  log 'review it: SITE_URL must match the origin you develop against'
else
  warn '.env.example is missing; create .env.local by hand'
fi

# --- Playwright --------------------------------------------------------------
step 'End-to-end browsers'
if [ "${SKIP_PLAYWRIGHT}" = '1' ]; then
  log 'skipped (SKIP_PLAYWRIGHT=1); run `pnpm e2e:install` before `pnpm e2e`'
else
  log 'installing Chromium for Playwright (this can take a few minutes)'
  # --with-deps needs root on Linux; on a workstation without sudo the browser
  # binary alone is usually enough, so a failure here is a warning, not a stop.
  pnpm e2e:install || warn 'browser install failed; run `pnpm e2e:install` manually before `pnpm e2e`'
fi

# --- done --------------------------------------------------------------------
cat <<'NEXT'

== Ready

  pnpm dev              start the dev server on http://localhost:3000
  pnpm validate         format check + lint + typecheck + unit tests
  pnpm e2e              Playwright suite against a production build
  pnpm storybook        component workshop on http://localhost:6006
  make help             every wrapped workflow, including the Docker ones

  Commits are linted. Use `pnpm commit` for a guided Conventional Commit, and
  branch off `develop` as <type>/<kebab-case-description>.
NEXT
