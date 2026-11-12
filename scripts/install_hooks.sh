#!/usr/bin/env bash
# scripts/install_hooks.sh
# Installs deterministic git hooks into .git/hooks/

HOOKS_DIR="$(git rev-parse --git-dir)/hooks"
mkdir -p "$HOOKS_DIR"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ -f "$REPO_ROOT/.git/hooks/pre-commit" ]; then
  chmod +x "$REPO_ROOT/.git/hooks/pre-commit"
fi

if [ -f "$REPO_ROOT/.git/hooks/pre-push" ]; then
  chmod +x "$REPO_ROOT/.git/hooks/pre-push"
fi

echo "✔ Git pre-commit and pre-push hooks installed successfully in $HOOKS_DIR"
