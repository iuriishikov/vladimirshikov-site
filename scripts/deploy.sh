#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# deploy.sh — switch the running stack to a new image, verify it, roll back if
# the verification fails.
#
# WHAT IT DOES
#   1. Takes an exclusive lock so two overlapping deploys cannot fight.
#   2. Records the image tag the `web` container is running right now.
#   3. Pulls the requested image and brings the stack up with `--wait`.
#   4. Polls /api/health until it answers {"status":"ok"} or the timeout ends.
#   5. On any failure, restores the recorded image and re-verifies it.
#
# ASSUMPTIONS
#   * Runs on the deployment host (GitHub Actions reaches it over SSH), from any
#     directory; DEPLOY_PATH points at the checkout that holds the compose
#     files, the Caddyfile and the .env file.
#   * Docker Engine >= 25 with the Compose v2 plugin (`docker compose`, not
#     `docker-compose`).
#   * Registry credentials arrive as REGISTRY / REGISTRY_USERNAME /
#     REGISTRY_TOKEN (the deploy workflows forward them over SSH). When the
#     token is absent the script falls back to whatever `docker login` the host
#     already has stored.
#   * .env in DEPLOY_PATH holds runtime configuration including SITE_DOMAIN,
#     ACME_EMAIL, SITE_URL and APP_ENV. This script reads it only to assert that
#     keys exist; it never prints a value from it, and it never prints registry
#     credentials.
#
# It is safe to re-run: deploying the image that is already live is a no-op
# apart from the health check.
#
# Usage:
#   scripts/deploy.sh ghcr.io/iuriishikov/vladimirshikov-site:v1.4.0
#   scripts/deploy.sh --image ghcr.io/iuriishikov/vladimirshikov-site:v1.4.0
#   scripts/deploy.sh --env staging --image ghcr.io/...:develop --timeout 180
# -----------------------------------------------------------------------------
set -Eeuo pipefail

readonly DEFAULT_IMAGE_REPO='ghcr.io/iuriishikov/vladimirshikov-site'

IMAGE="${IMAGE:-}"
# The workflows forward the tier as APP_ENV, not DEPLOY_ENV. Honouring it means
# a staging rollout still layers docker-compose.staging.yml in; falling through
# to the production default would give staging an indexable X-Robots-Tag.
DEPLOY_ENV="${DEPLOY_ENV:-${APP_ENV:-production}}"
DEPLOY_PATH="${DEPLOY_PATH:-/opt/vladimirshikov-site}"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-120}"
HEALTH_URL="${HEALTH_URL:-}"
ROLLBACK_ENABLED=1

LOCK_DIR=''
STATE_DIR=''

# --- output ------------------------------------------------------------------
# Timestamps make a CI log correlatable with `docker logs` after the fact.
log() { printf '[%s] %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$*"; }
warn() { printf '[%s] WARN  %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$*" >&2; }
die() {
  printf '[%s] ERROR %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$*" >&2
  exit 1
}

usage() {
  cat <<'USAGE'
Usage: deploy.sh --image <ref> [options]

  -i, --image <ref>       Full image reference to deploy. Required unless the
                          IMAGE environment variable is set. A bare tag such as
                          "v1.4.0" is expanded against the default repository.
  -e, --env <name>        production (default) or staging.
  -p, --path <dir>        Deployment directory. Default: /opt/vladimirshikov-site
  -t, --timeout <sec>     Seconds to wait for a healthy response. Default: 120
      --health-url <url>  Additionally verify this public URL after the
                          in-container probe passes, e.g.
                          https://vladimirshikov.com/api/health
      --no-rollback       Leave the failed release in place for debugging.
  -h, --help              Show this message.
USAGE
}

# --- failure handling --------------------------------------------------------
# The trap reports where things broke; recovery is decided by the caller of each
# step, so that rollback runs exactly once and never recursively.
on_err() {
  local exit_code=$? line=$1 cmd=$2
  warn "failed at line ${line} (exit ${exit_code}): ${cmd}"
  return 0
}
trap 'on_err "${LINENO}" "${BASH_COMMAND}"' ERR

cleanup() {
  if [ -n "${LOCK_DIR}" ] && [ -d "${LOCK_DIR}" ]; then
    rmdir "${LOCK_DIR}" 2>/dev/null || true
  fi
}
trap cleanup EXIT

# --- argument parsing --------------------------------------------------------
while [ $# -gt 0 ]; do
  case "$1" in
    -i | --image)
      IMAGE="${2:-}"
      shift 2
      ;;
    -e | --env)
      DEPLOY_ENV="${2:-}"
      shift 2
      ;;
    -p | --path)
      DEPLOY_PATH="${2:-}"
      shift 2
      ;;
    -t | --timeout)
      HEALTH_TIMEOUT="${2:-}"
      shift 2
      ;;
    --health-url)
      HEALTH_URL="${2:-}"
      shift 2
      ;;
    --no-rollback)
      ROLLBACK_ENABLED=0
      shift
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    -*) die "unknown option: $1 (try --help)" ;;
    # deploy.yml and rollback.yml both invoke `./scripts/deploy.sh <ref>`, so a
    # bare image reference has to be accepted as well as --image.
    *)
      IMAGE="$1"
      shift
      ;;
  esac
done

case "${DEPLOY_ENV}" in
  production | staging) ;;
  *) die "the environment must be 'production' or 'staging', got '${DEPLOY_ENV}' (--env, DEPLOY_ENV or APP_ENV)" ;;
esac

[ -n "${IMAGE}" ] || die "no image given; pass --image or set IMAGE"
# Accept a bare tag for convenience: rollback.yml passes one.
case "${IMAGE}" in
  */*) ;;
  *) IMAGE="${DEFAULT_IMAGE_REPO}:${IMAGE}" ;;
esac

case "${HEALTH_TIMEOUT}" in
  '' | *[!0-9]*) die "--timeout must be a whole number of seconds" ;;
esac

# --- preflight ---------------------------------------------------------------
command -v docker >/dev/null 2>&1 || die "docker is not installed or not on PATH"
docker compose version >/dev/null 2>&1 ||
  die "the Docker Compose v2 plugin is required (docker compose version failed)"

[ -d "${DEPLOY_PATH}" ] || die "deployment directory not found: ${DEPLOY_PATH}"
cd "${DEPLOY_PATH}"
[ -f docker-compose.yml ] || die "no docker-compose.yml in ${DEPLOY_PATH}"

COMPOSE_ARGS=(-f docker-compose.yml)
if [ "${DEPLOY_ENV}" = 'staging' ]; then
  [ -f docker-compose.staging.yml ] || die "no docker-compose.staging.yml in ${DEPLOY_PATH}"
  COMPOSE_ARGS+=(-f docker-compose.staging.yml)
fi
# Naming every file explicitly also stops compose from picking up a stray
# docker-compose.override.yml that may have been rsynced along with the repo.
compose() { docker compose "${COMPOSE_ARGS[@]}" "$@"; }

# The compose file leaves these unset-tolerant so that local runs work, which
# means a server that omits one gets a silent fallback rather than an error:
# an empty SITE_DOMAIN makes Caddy serve nothing, and a missing SITE_URL/APP_ENV
# drops the app onto its zod defaults — http://localhost:3000 in every canonical
# URL, and a `Disallow: /` robots.txt on the live site.
setting_present() {
  local key="$1"
  [ -n "${!key:-}" ] && return 0
  [ -f .env ] && grep -Eq "^[[:space:]]*${key}=[[:space:]]*[^[:space:]]" .env
}
for key in SITE_DOMAIN ACME_EMAIL SITE_URL APP_ENV; do
  setting_present "${key}" ||
    die "${key} is not set in ${DEPLOY_PATH}/.env — the stack cannot start correctly without it"
done

STATE_DIR="${DEPLOY_PATH}/.deploy"
mkdir -p "${STATE_DIR}"

# mkdir is atomic on every POSIX filesystem, which makes it a dependency-free
# mutex — flock is not present on every minimal server image.
LOCK_DIR="${STATE_DIR}/lock"
if ! mkdir "${LOCK_DIR}" 2>/dev/null; then
  LOCK_DIR=''
  die "another deploy holds ${STATE_DIR}/lock — remove it by hand if that deploy died"
fi

# --- helpers -----------------------------------------------------------------
running_image() {
  local cid
  cid="$(compose ps -q web 2>/dev/null || true)"
  [ -n "${cid}" ] || return 0
  docker inspect --format '{{.Config.Image}}' "${cid}" 2>/dev/null || true
}

# Compose reads .env for interpolation, so writing IMAGE there keeps a bare
# `docker compose up -d` run by a human on the same image this script chose.
persist_image() {
  local image="$1" tmp
  [ -f .env ] || (
    umask 077
    : >.env
  )
  tmp="$(mktemp "${DEPLOY_PATH}/.env.XXXXXX")"
  grep -v '^[[:space:]]*IMAGE=' .env >"${tmp}" || true
  printf 'IMAGE=%s\n' "${image}" >>"${tmp}"
  # Copy through the existing file so its ownership and mode survive.
  cat "${tmp}" >.env
  rm -f "${tmp}"
  printf '%s\n' "${image}" >"${STATE_DIR}/current-image"
  # deploy.yml reads this exact path over SSH to learn what to roll back to, so
  # the two locations have to stay in step: an unwritten .deployed-image
  # disables CI-side automatic rollback without any visible error.
  printf '%s\n' "${image}" >"${DEPLOY_PATH}/.deployed-image"
}

# Runs inside the container, so it works even though `web` publishes no host
# port. Node 24 provides fetch, so no extra tooling is needed in the image.
probe_container_health() {
  compose exec -T web node -e '
    const port = process.env.PORT || 3000;
    fetch("http://127.0.0.1:" + port + "/api/health")
      .then(async (res) => {
        if (!res.ok) process.exit(1);
        const body = await res.json();
        process.exit(body && body.status === "ok" ? 0 : 1);
      })
      .catch(() => process.exit(1));
  ' >/dev/null 2>&1
}

wait_for_health() {
  local deadline=$((SECONDS + HEALTH_TIMEOUT))
  while [ "${SECONDS}" -lt "${deadline}" ]; do
    if probe_container_health; then
      log "health check passed after $((HEALTH_TIMEOUT - (deadline - SECONDS)))s"
      return 0
    fi
    sleep 3
  done
  return 1
}

verify_public_url() {
  [ -n "${HEALTH_URL}" ] || return 0
  command -v curl >/dev/null 2>&1 || {
    warn "curl is missing; skipping the public health check"
    return 0
  }
  log "verifying ${HEALTH_URL}"
  # --retry covers the transient window while Caddy finishes an ACME handshake;
  # --fail turns a 4xx/5xx into a non-zero exit so the caller can roll back.
  curl --fail --silent --show-error --max-time 15 --retry 5 --retry-delay 3 \
    -o /dev/null "${HEALTH_URL}"
}

# The subshell keeps the exported IMAGE scoped to this one compose invocation:
# bash lets a `VAR=x func` assignment leak into the caller, which would silently
# rewrite the target image during a rollback.
bring_up() {
  local image="$1"
  (
    export IMAGE="${image}"
    compose up -d --wait --wait-timeout "${HEALTH_TIMEOUT}" --remove-orphans
  )
}

# GHCR packages are private by default, and a credential stored on the host
# expires. The workflows ship a fresh token with every run, so use it when it is
# there and fall back to the host's stored login when it is not.
# --password-stdin keeps the token out of argv, `ps` output and this log.
registry_login() {
  [ -n "${REGISTRY_TOKEN:-}" ] || return 0
  local registry="${REGISTRY:-ghcr.io}"
  log "authenticating to ${registry}"
  printf '%s' "${REGISTRY_TOKEN}" |
    docker login "${registry}" --username "${REGISTRY_USERNAME:-}" --password-stdin >/dev/null ||
    die "could not log in to ${registry}"
}

pull_image() {
  local image="$1"
  (
    export IMAGE="${image}"
    compose pull --quiet web
  )
}

roll_back() {
  local previous="$1"
  if [ "${ROLLBACK_ENABLED}" -eq 0 ]; then
    warn "rollback disabled; the failed release is still installed"
    return 1
  fi
  if [ -z "${previous}" ]; then
    warn "no previously running image was recorded; nothing to roll back to"
    return 1
  fi
  if [ "${previous}" = "${IMAGE}" ]; then
    warn "the previous image is the one that just failed; not rolling back"
    return 1
  fi

  log "rolling back to ${previous}"
  persist_image "${previous}"
  if bring_up "${previous}" && wait_for_health; then
    log "rollback succeeded; the site is serving ${previous} again"
    return 0
  fi
  warn "rollback did not become healthy — the site needs manual attention"
  return 1
}

# --- deploy ------------------------------------------------------------------
log "environment : ${DEPLOY_ENV}"
log "directory   : ${DEPLOY_PATH}"
log "target image: ${IMAGE}"

PREVIOUS_IMAGE="$(running_image)"
if [ -z "${PREVIOUS_IMAGE}" ] && [ -f "${STATE_DIR}/current-image" ]; then
  # Nothing is running (first deploy, or the host rebooted mid-deploy); fall
  # back to whatever the last successful run recorded.
  PREVIOUS_IMAGE="$(cat "${STATE_DIR}/current-image")"
fi
if [ -n "${PREVIOUS_IMAGE}" ]; then
  log "currently running: ${PREVIOUS_IMAGE}"
  printf '%s\n' "${PREVIOUS_IMAGE}" >"${STATE_DIR}/previous-image"
else
  log "no running web container found; treating this as a first deploy"
fi

registry_login

log "pulling ${IMAGE}"
if ! pull_image "${IMAGE}"; then
  die "could not pull ${IMAGE} — check the tag and that this host is logged in to the registry"
fi

persist_image "${IMAGE}"

log 'starting the stack'
if ! bring_up "${IMAGE}"; then
  warn 'the stack did not reach a healthy state'
  compose ps || true
  compose logs --tail 80 web || true
  roll_back "${PREVIOUS_IMAGE}"
  die "deploy of ${IMAGE} failed"
fi

log "waiting up to ${HEALTH_TIMEOUT}s for /api/health"
if ! wait_for_health; then
  warn 'health endpoint never reported status "ok"'
  compose logs --tail 80 web || true
  roll_back "${PREVIOUS_IMAGE}"
  die "deploy of ${IMAGE} failed"
fi

if ! verify_public_url; then
  warn "${HEALTH_URL} is not answering; the container is healthy, so suspect DNS, TLS or Caddy"
  compose logs --tail 40 caddy || true
  roll_back "${PREVIOUS_IMAGE}"
  die "deploy of ${IMAGE} failed at the edge"
fi

log "deployed ${IMAGE} successfully"
compose ps
