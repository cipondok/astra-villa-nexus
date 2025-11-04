#!/bin/bash
# Script to run CI checks locally before pushing

set -e

echo "🚀 Running Local CI Checks..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2 passed${NC}"
    else
        echo -e "${RED}✗ $2 failed${NC}"
        exit 1
    fi
}

# 1. Type Check
echo -e "${YELLOW}➜ Running TypeScript type check...${NC}"
npx tsc --noEmit
print_status $? "Type check"
echo ""

# 2. Unit Tests
echo -e "${YELLOW}➜ Running unit tests...${NC}"
npm test -- --run
print_status $? "Unit tests"
echo ""

# 3. Build Check
echo -e "${YELLOW}➜ Building application...${NC}"
npm run build
print_status $? "Build"
echo ""

# 4. E2E Tests (basic)
echo -e "${YELLOW}➜ Running E2E tests (chromium only)...${NC}"
npx playwright test --project=chromium --grep-invert "visual-regression"
print_status $? "E2E tests"
echo ""

# 5. Visual Regression (optional)
read -p "Run visual regression tests? (slower) [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}➜ Running visual regression tests...${NC}"
    npx playwright test e2e/visual-regression.spec.ts --project=chromium
    print_status $? "Visual regression tests"
    echo ""
fi

# Summary
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ All local CI checks passed!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Your code is ready to be pushed! 🎉"
