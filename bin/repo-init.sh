#!/usr/bin/env bash
# Idempotent: copy Docker Hub workflow pack files into an existing repo.
# Safe to re-run — will not overwrite files that already exist.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

install_file() {
    local src="$1" dst="$2"
    if [[ -f "$dst" ]]; then
        echo "  skip  $dst (already exists)"
    else
        mkdir -p "$(dirname "$dst")"
        cp "$src" "$dst"
        echo "  wrote $dst"
    fi
}

echo "==> Secure Pride — Docker Hub workflow init"
echo "    Repo root: $REPO_ROOT"

install_file "$REPO_ROOT/Dockerfile"                                        "$REPO_ROOT/Dockerfile"
install_file "$REPO_ROOT/.github/workflows/release.yml"                    "$REPO_ROOT/.github/workflows/release.yml"
install_file "$REPO_ROOT/.github/workflows/token-reminder.yml"             "$REPO_ROOT/.github/workflows/token-reminder.yml"
install_file "$REPO_ROOT/bin/gh-secrets-setup.sh"                          "$REPO_ROOT/bin/gh-secrets-setup.sh"
install_file "$REPO_ROOT/bin/dockerhub-login-test.sh"                      "$REPO_ROOT/bin/dockerhub-login-test.sh"
install_file "$REPO_ROOT/docs/DOCKERHUB_TOKEN_WORKFLOW.md"                 "$REPO_ROOT/docs/DOCKERHUB_TOKEN_WORKFLOW.md"

chmod +x "$REPO_ROOT/bin/"*.sh
echo "==> Done. See docs/DOCKERHUB_TOKEN_WORKFLOW.md for next steps."
