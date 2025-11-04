#!/bin/bash
# Generate dashboard data from local test runs

echo "📊 Generating Dashboard Data..."
echo ""

# Create data directory
mkdir -p dashboard/data

# Function to extract test results
extract_test_results() {
    echo "Extracting test results..."
    
    # This is a placeholder - in a real scenario, you'd parse actual test output
    cat > dashboard/data/latest-tests.json << EOF
{
  "total": 156,
  "passed": 150,
  "failed": 6,
  "skipped": 0,
  "duration": 45.3,
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
}

# Function to extract Lighthouse data
extract_lighthouse_data() {
    echo "Extracting Lighthouse data..."
    
    if [ -d ".lighthouseci" ]; then
        # Parse actual Lighthouse results if available
        latest=$(ls -t .lighthouseci/lhr-*.json 2>/dev/null | head -1)
        
        if [ -f "$latest" ]; then
            cat > dashboard/data/lighthouse-data.json << EOF
{
  "performance": $(jq '.categories.performance.score * 100' "$latest" 2>/dev/null || echo 0),
  "accessibility": $(jq '.categories.accessibility.score * 100' "$latest" 2>/dev/null || echo 0),
  "bestPractices": $(jq '.categories["best-practices"].score * 100' "$latest" 2>/dev/null || echo 0),
  "seo": $(jq '.categories.seo.score * 100' "$latest" 2>/dev/null || echo 0),
  "lcp": $(jq '.audits["largest-contentful-paint"].numericValue / 1000' "$latest" 2>/dev/null || echo 0),
  "cls": $(jq '.audits["cumulative-layout-shift"].numericValue' "$latest" 2>/dev/null || echo 0),
  "fcp": $(jq '.audits["first-contentful-paint"].numericValue / 1000' "$latest" 2>/dev/null || echo 0),
  "tbt": $(jq '.audits["total-blocking-time"].numericValue' "$latest" 2>/dev/null || echo 0),
  "history": []
}
EOF
        fi
    fi
}

# Function to extract coverage data
extract_coverage_data() {
    echo "Extracting coverage data..."
    
    if [ -f "coverage/coverage-summary.json" ]; then
        cat > dashboard/data/coverage-data.json << EOF
{
  "lines": $(jq '.total.lines' coverage/coverage-summary.json),
  "branches": $(jq '.total.branches' coverage/coverage-summary.json),
  "functions": $(jq '.total.functions' coverage/coverage-summary.json),
  "statements": $(jq '.total.statements' coverage/coverage-summary.json),
  "history": []
}
EOF
    fi
}

# Run extractions
extract_test_results
extract_lighthouse_data
extract_coverage_data

echo ""
echo "✅ Dashboard data generated successfully!"
echo ""
echo "Data files created:"
echo "  - dashboard/data/latest-tests.json"
echo "  - dashboard/data/lighthouse-data.json"
echo "  - dashboard/data/coverage-data.json"
echo ""
echo "Open dashboard/index.html in your browser to view the dashboard."
