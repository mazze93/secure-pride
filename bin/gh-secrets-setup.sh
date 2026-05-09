#!/usr/bin/env bash
# Set DOCKERHUB_USERNAME and DOCKERHUB_TOKEN as GitHub Actions secrets.
# Requires: gh CLI (authenticated), DOCKERHUB_TOKEN env var set by caller.
set -euo pipefail

REPO="${GH_REPO:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"

if [[ -z "${DOCKERHUB_TOKEN:-}" ]]; then
    echo "ERROR: DOCKERHUB_TOKEN is not set. Export it before running this script:" >&2
    echo "  export DOCKERHUB_TOKEN=\"your-token-here\"" >&2
    exit 1
fi

DOCKERHUB_USERNAME="${DOCKERHUB_USERNAME:-mazze93}"

echo "Setting secrets for repo: $REPO"
gh secret set DOCKERHUB_USERNAME --body "$DOCKERHUB_USERNAME" --repo "$REPO"
gh secret set DOCKERHUB_TOKEN   --body "$DOCKERHUB_TOKEN"   --repo "$REPO"
echo "Done. Verify at: https://github.com/$REPO/settings/secrets/actions"
