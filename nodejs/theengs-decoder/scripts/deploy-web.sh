#!/usr/bin/env bash
# Build the web app for production and rsync it to a static host.
#
# Configuration via .env (gitignored) at the package root:
#   DEPLOY_HOST   user@host for rsync (e.g. user@example.com)
#   DEPLOY_PATH   absolute remote path (e.g. /var/www/.../apps/theengs-decoder/)
#   DEPLOY_BASE   URL base path Vite bakes into the build (e.g. /apps/theengs-decoder/)
#   DEPLOY_URL    public URL echoed after a successful deploy
#   DEPLOY_PORT   optional SSH port; defaults to 22 when unset
#
# Process-env values override .env values, so CI / one-off overrides still work:
#   DEPLOY_BASE=/preview/ npm run deploy-web
#
# Flags:
#   --no-rsync   build only, skip the rsync step (useful for verification)

set -euo pipefail

pkg_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$pkg_dir"

env_file="$pkg_dir/.env"
if [[ -f "$env_file" ]]; then
  # Load .env without overriding values already set in the process environment.
  while IFS='=' read -r key value; do
    [[ -z "$key" || "$key" =~ ^[[:space:]]*# ]] && continue
    key="${key%"${key##*[![:space:]]}"}"
    key="${key#"${key%%[![:space:]]*}"}"
    [[ -z "${!key:-}" ]] && export "$key=$value"
  done < "$env_file"
fi

skip_rsync=0
for arg in "$@"; do
  case "$arg" in
    --no-rsync) skip_rsync=1 ;;
    *) echo "Unknown argument: $arg" >&2; exit 2 ;;
  esac
done

missing=()
[[ -z "${DEPLOY_HOST:-}" ]] && missing+=(DEPLOY_HOST)
[[ -z "${DEPLOY_PATH:-}" ]] && missing+=(DEPLOY_PATH)
[[ -z "${DEPLOY_BASE:-}" ]] && missing+=(DEPLOY_BASE)
[[ -z "${DEPLOY_URL:-}" ]] && missing+=(DEPLOY_URL)
if (( ${#missing[@]} > 0 )); then
  echo "Missing required deploy settings: ${missing[*]}" >&2
  echo "Copy .env.example to .env and fill in the values." >&2
  exit 1
fi

rsync_ssh=()
if [[ -n "${DEPLOY_PORT:-}" ]]; then
  if ! [[ "$DEPLOY_PORT" =~ ^[0-9]+$ ]] || (( DEPLOY_PORT < 1 || DEPLOY_PORT > 65535 )); then
    echo "Invalid DEPLOY_PORT: '$DEPLOY_PORT' (expected an integer in 1..65535)." >&2
    exit 1
  fi
  rsync_ssh=(-e "ssh -p $DEPLOY_PORT")
fi

out_dir="web/dist"

echo "==> Building $DEPLOY_BASE → $out_dir"
npx vite build web --base "$DEPLOY_BASE" --outDir "dist"

if (( skip_rsync )); then
  echo "==> Skipped rsync (--no-rsync). Build is at $pkg_dir/$out_dir"
  exit 0
fi

echo "==> Syncing $out_dir/ → $DEPLOY_HOST:$DEPLOY_PATH${DEPLOY_PORT:+ (port $DEPLOY_PORT)}"
rsync -avz --delete ${rsync_ssh[@]+"${rsync_ssh[@]}"} "$out_dir"/ "$DEPLOY_HOST:$DEPLOY_PATH"

echo "==> Deployed: $DEPLOY_URL"
