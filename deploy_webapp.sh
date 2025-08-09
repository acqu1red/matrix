#!/usr/bin/env bash
set -euo pipefail

BRANCH="main"
REMOTE="origin"
BASE_REPO_URL="github.com/acqu1red/tourmalineGG.git"
REPO_URL="https://${BASE_REPO_URL}"

# If token provided, use it in remote URL to avoid interactive auth
if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  USERNAME="${GIT_USERNAME:-oauth2}"
  REPO_URL="https://${USERNAME}:${GITHUB_TOKEN}@${BASE_REPO_URL}"
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git init
fi

echo "Configuring git user (local) if missing..."
if ! git config user.name >/dev/null; then
  git config user.name "auto-deploy"
fi
if ! git config user.email >/dev/null; then
  git config user.email "auto-deploy@example.com"
fi

# Ensure main branch
CURRENT_BRANCH=$(git symbolic-ref --short -q HEAD || echo "")
if [ -z "$CURRENT_BRANCH" ]; then
  git checkout -b "$BRANCH"
else
  git branch -M "$BRANCH"
fi

# Add or update remote
if git remote get-url "$REMOTE" >/dev/null 2>&1; then
  git remote set-url "$REMOTE" "$REPO_URL"
else
  git remote add "$REMOTE" "$REPO_URL"
fi

# Add, commit, push
git add .
MSG=${1:-"Deploy webapp and bot"}
if ! git diff --cached --quiet; then
  git commit -m "$MSG"
else
  echo "No changes to commit."
fi

echo "Pushing to $REPO_URL ($BRANCH)..."
git push -u "$REMOTE" "$BRANCH"

echo "Done. GitHub Actions will deploy /webapp to Pages."
