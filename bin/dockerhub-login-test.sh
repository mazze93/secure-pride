#!/usr/bin/env bash
# Sanity-check your Docker Hub credentials locally before committing them to CI.
# Requires: docker CLI, DOCKERHUB_USERNAME and DOCKERHUB_TOKEN env vars.
set -euo pipefail

if [[ -z "${DOCKERHUB_USERNAME:-}" || -z "${DOCKERHUB_TOKEN:-}" ]]; then
    echo "ERROR: Set DOCKERHUB_USERNAME and DOCKERHUB_TOKEN before running." >&2
    exit 1
fi

echo "$DOCKERHUB_TOKEN" | docker login --username "$DOCKERHUB_USERNAME" --password-stdin

echo "Login successful. Logging out..."
docker logout
echo "Done."
