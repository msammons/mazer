#!/bin/bash
# Set up project dependencies for Codex environment.
# Requires root privileges and internet access.
set -e

# Optionally install Node.js if missing.
if ! command -v npm >/dev/null 2>&1; then
  echo "Installing Node.js..."
  apt-get update
  apt-get install -y nodejs npm
fi

# Install npm dependencies
npm install
