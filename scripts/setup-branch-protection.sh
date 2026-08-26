#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# setup-branch-protection.sh — apply this repository's GitHub configuration that
# lives outside the working tree: branch rulesets and deployment environments.
#
# WHAT IT DOES
#   1. Imports .github/rulesets/main.json and .github/rulesets/develop.json,
#      creating each ruleset the first time and updating it in place afterwards
#      (matched by the "name" field inside the file).
#   2. Creates the `staging` and `production` environments and restricts which
#      refs may deploy to them: `develop` for staging, `main` plus `v*` tags for
#      production.
#   3. Prints which required secrets and variables are still missing.
#
# WHAT IT DOES NOT DO
#   Nothing here ever prints, reads or sets a secret value. Secrets must be
#   entered by a human, through `gh secret set` or the repository settings UI.
#
# ASSUMPTIONS
#   * GitHub CLI (`gh`) is installed and authenticated as a user with admin
#     rights on the repository: `gh auth login`.
#   * Run from anywhere inside a checkout; ruleset files are resolved relative
#     to the repository root.
#
# Safe to re-run. Existing environments are not overwritten unless you ask for
# it, so a reviewer you added by hand is never silently removed.
#
# Usage:
#   scripts/setup-branch-protection.sh
#   REPO=iuriishikov/vladimirshikov-site scripts/setup-branch-protection.sh
#   PRODUCTION_REVIEWER=iuriishikov scripts/setup-branch-protection.sh
#   FORCE_ENVIRONMENTS=1 scripts/setup-branch-protection.sh   # rewrite env rules
# -----------------------------------------------------------------------------
set -Eeuo pipefail

REPO="${REPO:-}"
PRODUCTION_REVIEWER="${PRODUCTION_REVIEWER:-}"
FORCE_ENVIRONMENTS="${FORCE_ENVIRONMENTS:-0}"

log() { printf '  %s\n' "$*"; }
step() { printf '\n== %s\n' "$*"; }
warn() { printf '  WARN  %s\n' "$*" >&2; }
die() {
  printf '\nERROR %s\n' "$*" >&2
  exit 1
}

trap 'printf "\nERROR failed at line %s: %s\n" "${LINENO}" "${BASH_COMMAND}" >&2' ERR

# --- preflight ---------------------------------------------------------------
command -v gh >/dev/null 2>&1 ||
  die "GitHub CLI not found. Install it from https://cli.github.com and run 'gh auth login'."
gh auth status >/dev/null 2>&1 ||
  die "gh is installed but not authenticated. Run 'gh auth login' first."

# Resolve the repository root from the script's own location so the ruleset
# paths work regardless of the caller's working directory.
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd -- "${SCRIPT_DIR}/.." && pwd)"

if [ -z "${REPO}" ]; then
  REPO="$(gh repo view --json nameWithOwner --jq .nameWithOwner 2>/dev/null || true)"
fi
[ -n "${REPO}" ] || die "could not determine the repository; set REPO=owner/name"

log "repository: ${REPO}"

# Reading one field out of a JSON file. gh's built-in --jq covers API responses
# but not local files, so use whichever of these the machine already has.
json_field() {
  local file="$1" field="$2"
  if command -v jq >/dev/null 2>&1; then
    jq -r --arg f "${field}" '.[$f] // empty' "${file}"
  elif command -v node >/dev/null 2>&1; then
    node -e 'const o=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));process.stdout.write(String(o[process.argv[2]]??""))' \
      "${file}" "${field}"
  elif command -v python3 >/dev/null 2>&1; then
    python3 -c 'import json,sys;print(json.load(open(sys.argv[1])).get(sys.argv[2],""))' \
      "${file}" "${field}"
  else
    die "need one of jq, node or python3 to read ${file}"
  fi
}

# --- rulesets ----------------------------------------------------------------
apply_ruleset() {
  local file="$1" name id
  if [ ! -f "${file}" ]; then
    warn "missing ${file#"${ROOT_DIR}"/} — skipping"
    return 0
  fi

  name="$(json_field "${file}" name)"
  [ -n "${name}" ] || die "${file} has no \"name\" field; a ruleset cannot be matched without one"

  # Rulesets have no natural key in the API, so the human-readable name is the
  # identity used to decide between create and update.
  id="$(gh api --paginate "repos/${REPO}/rulesets" \
    --jq ".[] | select(.name == \"${name}\") | .id" 2>/dev/null | head -n 1 || true)"

  if [ -n "${id}" ]; then
    log "updating ruleset \"${name}\" (id ${id})"
    gh api --silent --method PUT "repos/${REPO}/rulesets/${id}" --input "${file}"
  else
    log "creating ruleset \"${name}\""
    gh api --silent --method POST "repos/${REPO}/rulesets" --input "${file}"
  fi
}

step 'Branch rulesets'
apply_ruleset "${ROOT_DIR}/.github/rulesets/main.json"
apply_ruleset "${ROOT_DIR}/.github/rulesets/develop.json"

# --- environments ------------------------------------------------------------
environment_exists() {
  gh api --silent "repos/${REPO}/environments/$1" >/dev/null 2>&1
}

# Adds a ref pattern to an environment's allow-list, skipping patterns that are
# already there. `type` is "branch" or "tag".
ensure_branch_policy() {
  local env="$1" name="$2" type="$3" existing
  existing="$(gh api --paginate "repos/${REPO}/environments/${env}/deployment-branch-policies" \
    --jq '.branch_policies[].name' 2>/dev/null || true)"
  if printf '%s\n' "${existing}" | grep -Fxq "${name}"; then
    log "  policy ${type} '${name}' already present"
    return 0
  fi
  log "  allowing ${type} '${name}' to deploy"
  gh api --silent --method POST \
    "repos/${REPO}/environments/${env}/deployment-branch-policies" \
    -f "name=${name}" -f "type=${type}" ||
    warn "could not add ${type} '${name}'; the environment may not use custom branch policies"
}

configure_environment() {
  local env="$1" body="$2"
  if environment_exists "${env}" && [ "${FORCE_ENVIRONMENTS}" != '1' ]; then
    log "environment '${env}' already exists — leaving its protection rules untouched"
    log "  (re-run with FORCE_ENVIRONMENTS=1 to overwrite them)"
  else
    log "configuring environment '${env}'"
    printf '%s' "${body}" | gh api --silent --method PUT "repos/${REPO}/environments/${env}" --input -
  fi
}

step 'Deployment environments'

# custom_branch_policies is required for tag patterns; "protected branches only"
# cannot express `v*`, which is how production releases are triggered.
STAGING_BODY='{"wait_timer":0,"deployment_branch_policy":{"protected_branches":false,"custom_branch_policies":true}}'
configure_environment staging "${STAGING_BODY}"
ensure_branch_policy staging develop branch

PRODUCTION_BODY='{"wait_timer":0,"deployment_branch_policy":{"protected_branches":false,"custom_branch_policies":true}}'
if [ -n "${PRODUCTION_REVIEWER}" ]; then
  reviewer_id="$(gh api "users/${PRODUCTION_REVIEWER}" --jq .id 2>/dev/null || true)"
  if [ -n "${reviewer_id}" ]; then
    # prevent_self_review stays false: on a single-maintainer repository it
    # would make production undeployable by the only person who can approve it.
    log "requiring review from @${PRODUCTION_REVIEWER} (id ${reviewer_id})"
    PRODUCTION_BODY="{\"wait_timer\":0,\"prevent_self_review\":false,\"reviewers\":[{\"type\":\"User\",\"id\":${reviewer_id}}],\"deployment_branch_policy\":{\"protected_branches\":false,\"custom_branch_policies\":true}}"
  else
    warn "could not resolve GitHub user '${PRODUCTION_REVIEWER}'; creating production without a reviewer"
  fi
fi
configure_environment production "${PRODUCTION_BODY}"
ensure_branch_policy production main branch
ensure_branch_policy production 'v*' tag

if [ -z "${PRODUCTION_REVIEWER}" ]; then
  warn "production has no required reviewer configured."
  warn "Re-run with PRODUCTION_REVIEWER=<github-login> or add one in the repository settings."
fi

# --- what a human still has to do -------------------------------------------
# Only names are read and printed here. Values are never fetched — the API does
# not expose them, and this script must remain safe to run with its output
# pasted into a CI log.
step 'Secrets and variables'

repo_secrets="$(gh api --paginate "repos/${REPO}/actions/secrets" --jq '.secrets[].name' 2>/dev/null || true)"
repo_variables="$(gh api --paginate "repos/${REPO}/actions/variables" --jq '.variables[].name' 2>/dev/null || true)"

env_names() {
  gh api --paginate "repos/${REPO}/environments/$1/$2" --jq ".$2[].name" 2>/dev/null || true
}
staging_secrets="$(env_names staging secrets)"
staging_variables="$(env_names staging variables)"
production_secrets="$(env_names production secrets)"
production_variables="$(env_names production variables)"

known() { printf '%s\n' "$2" | grep -Fxq "$1"; }

# Which of the three scopes already define a name, as a printable list.
locations() {
  local name="$1" at_repo="$2" at_staging="$3" at_production="$4" out=''
  if known "${name}" "${at_repo}"; then out='repo'; fi
  if known "${name}" "${at_staging}"; then out="${out:+${out}, }staging"; fi
  if known "${name}" "${at_production}"; then out="${out:+${out}, }production"; fi
  printf '%s' "${out}"
}

report() {
  local kind="$1" name="$2" note="$3" where
  if [ "${kind}" = 'secret' ]; then
    where="$(locations "${name}" "${repo_secrets}" "${staging_secrets}" "${production_secrets}")"
  else
    where="$(locations "${name}" "${repo_variables}" "${staging_variables}" "${production_variables}")"
  fi
  if [ -n "${where}" ]; then
    printf '  [set]     %-24s (%s)\n' "${name}" "${where}"
  else
    printf '  [MISSING] %-24s %s\n' "${name}" "${note}"
  fi
}

printf '\n  Required for deploy.yml and rollback.yml:\n'
report secret SSH_HOST 'VPS hostname or IP'
report secret SSH_PORT 'SSH port (22 unless changed)'
report secret SSH_USER 'deploy user on the VPS'
report secret SSH_PRIVATE_KEY 'private key for that user, no passphrase'
report secret SSH_KNOWN_HOSTS 'output of ssh-keyscan -p <port> <host>'
report variable DEPLOY_PATH 'e.g. /home/deploy/vladimirshikov-site — set per environment'
report variable SITE_URL 'public origin — read at runtime, so one image serves every environment'

printf '\n  Optional:\n'
report secret CODECOV_TOKEN 'coverage upload in ci.yml'
report secret LHCI_GITHUB_APP_TOKEN 'Lighthouse CI status checks'

cat <<'NEXT'

  Set them with (values are prompted for, never passed on the command line):
    gh secret set SSH_PRIVATE_KEY < ~/.ssh/deploy_key
    gh secret set SSH_KNOWN_HOSTS
    gh variable set DEPLOY_PATH --env production
    gh variable set SITE_URL --env production

  Then confirm the result in the GitHub UI:
    Settings > Rules > Rulesets      — main and develop are Active, not Evaluate
    Settings > Environments          — production requires a reviewer
NEXT
