#!/bin/bash
# Script to run visual regression tests and generate a detailed report

echo "🎨 Running Visual Regression Tests..."
echo ""

# Run only visual regression tests
npx playwright test e2e/visual-regression.spec.ts e2e/visual-regression-advanced.spec.ts

# Check exit code
if [ $? -eq 0 ]; then
  echo ""
  echo "✅ All visual regression tests passed!"
  echo ""
else
  echo ""
  echo "❌ Visual regression tests failed - differences detected!"
  echo ""
  echo "📊 Opening detailed report..."
  npx playwright show-report
fi

echo ""
echo "📝 Report locations:"
echo "   - HTML Report: playwright-report/index.html"
echo "   - Test Results: test-results/"
echo "   - Screenshots: e2e/*.spec.ts-snapshots/"
