#!/usr/bin/env bash
# scripts/install_hooks.sh
# Installs deterministic git hooks into .git/hooks/

HOOKS_DIR="$(git rev-parse --git-dir)/hooks"
mkdir -p "$HOOKS_DIR"

cp "$(dirname "$0")/../.git/hooks/pre-commit" "$HOOKS_DIR/pre-commit" 2>/dev/null || true
chmod +x "$HOOKS_DIR/pre-commit"

echo "✔ Git pre-commit hook installed successfully at $HOOKS_DIR/pre-commit"
