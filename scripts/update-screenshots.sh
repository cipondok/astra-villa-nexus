#!/bin/bash
# Script to update visual regression baseline screenshots

echo "🔄 Updating visual regression baseline screenshots..."
echo ""

# Set environment variable to update snapshots
export UPDATE_SNAPSHOTS=true

# Run visual regression tests to generate new baselines
npx playwright test e2e/visual-regression.spec.ts e2e/visual-regression-advanced.spec.ts --update-snapshots

echo ""
echo "✅ Baseline screenshots updated successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Review the updated screenshots in the test-results directory"
echo "   2. Commit the new baseline images if they look correct"
echo "   3. Run 'npx playwright test' to verify all tests pass"
