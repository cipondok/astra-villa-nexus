#!/bin/bash
# Script to debug CI failures locally

echo "🔍 CI Debug Mode"
echo ""

# Function to run command and show detailed output
run_debug() {
    local cmd=$1
    local name=$2
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Running: $name"
    echo "Command: $cmd"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if eval $cmd; then
        echo "✓ $name succeeded"
    else
        echo "✗ $name failed with exit code $?"
        echo ""
        echo "Troubleshooting tips:"
        case $name in
            "Type Check")
                echo "- Check TypeScript errors in the output above"
                echo "- Run 'npx tsc --noEmit' to see detailed type errors"
                ;;
            "Unit Tests")
                echo "- Check test failures in the output above"
                echo "- Run 'npm test -- --run' for detailed test output"
                echo "- Run 'npm test' for watch mode"
                ;;
            "E2E Tests")
                echo "- Check 'test-results/' for failure screenshots"
                echo "- Run 'npx playwright test --ui' for interactive debugging"
                echo "- Run 'npx playwright test --debug' for step-by-step debugging"
                ;;
            "Build")
                echo "- Check for module resolution errors"
                echo "- Verify all imports are correct"
                echo "- Run 'npm run build' for detailed build output"
                ;;
        esac
        
        read -p "Continue debugging? [y/N]: " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    echo ""
}

# Interactive menu
echo "Select what to debug:"
echo "1) Type Check"
echo "2) Unit Tests"
echo "3) E2E Tests"
echo "4) Visual Regression"
echo "5) Build"
echo "6) All (sequential)"
echo ""
read -p "Enter choice [1-6]: " choice

case $choice in
    1)
        run_debug "npx tsc --noEmit" "Type Check"
        ;;
    2)
        run_debug "npm test -- --run --reporter=verbose" "Unit Tests"
        ;;
    3)
        echo "Opening E2E test UI..."
        npx playwright test --ui
        ;;
    4)
        echo "Opening visual regression test UI..."
        npx playwright test e2e/visual-regression.spec.ts --ui
        ;;
    5)
        run_debug "npm run build" "Build"
        ;;
    6)
        run_debug "npx tsc --noEmit" "Type Check"
        run_debug "npm test -- --run" "Unit Tests"
        run_debug "npx playwright test --project=chromium --grep-invert 'visual-regression'" "E2E Tests"
        run_debug "npm run build" "Build"
        echo ""
        echo "All checks completed!"
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "Debug session complete!"
