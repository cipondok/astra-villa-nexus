#!/bin/bash
# Wrapper script for size-limit to check bundle sizes
# This allows running size checks without modifying package.json

set -e

echo "📦 Running bundle size checks..."
echo ""

# Check if size-limit is installed
if ! npx size-limit --version > /dev/null 2>&1; then
    echo "Error: size-limit is not installed"
    echo "Run: npm install --save-dev size-limit @size-limit/preset-app"
    exit 1
fi

# Run size-limit with the config file
npx size-limit

echo ""
echo "✓ Bundle size checks complete"
