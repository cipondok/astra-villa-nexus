#!/bin/bash
# Generate a comprehensive performance report

echo "📊 Generating Performance Report..."
echo ""

# Check if results exist
if [ ! -d ".lighthouseci" ]; then
    echo "❌ No Lighthouse results found."
    echo "Run 'bash scripts/lighthouse-local.sh' first."
    exit 1
fi

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to extract score
get_score() {
    local json_file=$1
    local category=$2
    
    if command -v jq &> /dev/null && [ -f "$json_file" ]; then
        jq -r ".categories.${category}.score * 100" "$json_file" 2>/dev/null || echo "N/A"
    else
        echo "N/A"
    fi
}

# Function to format score with color
format_score() {
    local score=$1
    
    if [ "$score" = "N/A" ]; then
        echo -e "${YELLOW}N/A${NC}"
    elif [ "${score%.*}" -ge 90 ]; then
        echo -e "${GREEN}${score}${NC}"
    elif [ "${score%.*}" -ge 50 ]; then
        echo -e "${YELLOW}${score}${NC}"
    else
        echo -e "${RED}${score}${NC}"
    fi
}

# Find latest report
latest_report=$(ls -t .lighthouseci/lhr-*.json 2>/dev/null | head -1)

if [ -z "$latest_report" ]; then
    echo "❌ No Lighthouse report files found."
    exit 1
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}         LIGHTHOUSE PERFORMANCE REPORT        ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Extract scores
perf_score=$(get_score "$latest_report" "performance")
a11y_score=$(get_score "$latest_report" "accessibility")
bp_score=$(get_score "$latest_report" "best-practices")
seo_score=$(get_score "$latest_report" "seo")

# Display scores
echo "📈 CATEGORY SCORES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
printf "  Performance:      %s\n" "$(format_score $perf_score)"
printf "  Accessibility:    %s\n" "$(format_score $a11y_score)"
printf "  Best Practices:   %s\n" "$(format_score $bp_score)"
printf "  SEO:              %s\n" "$(format_score $seo_score)"
echo ""

# Core Web Vitals
if command -v jq &> /dev/null; then
    echo "🎯 CORE WEB VITALS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    lcp=$(jq -r '.audits."largest-contentful-paint".numericValue / 1000' "$latest_report" 2>/dev/null || echo "N/A")
    fcp=$(jq -r '.audits."first-contentful-paint".numericValue / 1000' "$latest_report" 2>/dev/null || echo "N/A")
    cls=$(jq -r '.audits."cumulative-layout-shift".numericValue' "$latest_report" 2>/dev/null || echo "N/A")
    tbt=$(jq -r '.audits."total-blocking-time".numericValue' "$latest_report" 2>/dev/null || echo "N/A")
    si=$(jq -r '.audits."speed-index".numericValue / 1000' "$latest_report" 2>/dev/null || echo "N/A")
    
    # Format with thresholds
    if [ "$lcp" != "N/A" ]; then
        if (( $(echo "$lcp < 2.5" | bc -l) )); then
            lcp_status="${GREEN}✓${NC} ${lcp}s (Good)"
        elif (( $(echo "$lcp < 4.0" | bc -l) )); then
            lcp_status="${YELLOW}!${NC} ${lcp}s (Needs Improvement)"
        else
            lcp_status="${RED}✗${NC} ${lcp}s (Poor)"
        fi
    else
        lcp_status="N/A"
    fi
    
    if [ "$cls" != "N/A" ]; then
        if (( $(echo "$cls < 0.1" | bc -l) )); then
            cls_status="${GREEN}✓${NC} ${cls} (Good)"
        elif (( $(echo "$cls < 0.25" | bc -l) )); then
            cls_status="${YELLOW}!${NC} ${cls} (Needs Improvement)"
        else
            cls_status="${RED}✗${NC} ${cls} (Poor)"
        fi
    else
        cls_status="N/A"
    fi
    
    echo -e "  LCP (Largest Contentful Paint):  $lcp_status"
    echo -e "  FCP (First Contentful Paint):    ${fcp}s"
    echo -e "  CLS (Cumulative Layout Shift):   $cls_status"
    echo -e "  TBT (Total Blocking Time):       ${tbt}ms"
    echo -e "  SI (Speed Index):                ${si}s"
    echo ""
fi

# Resource Summary
if command -v jq &> /dev/null; then
    echo "📦 RESOURCE SUMMARY"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    total_size=$(jq -r '.audits."resource-summary".details.items[] | select(.resourceType == "total") | .transferSize' "$latest_report" 2>/dev/null || echo "0")
    script_size=$(jq -r '.audits."resource-summary".details.items[] | select(.resourceType == "script") | .transferSize' "$latest_report" 2>/dev/null || echo "0")
    stylesheet_size=$(jq -r '.audits."resource-summary".details.items[] | select(.resourceType == "stylesheet") | .transferSize' "$latest_report" 2>/dev/null || echo "0")
    image_size=$(jq -r '.audits."resource-summary".details.items[] | select(.resourceType == "image") | .transferSize' "$latest_report" 2>/dev/null || echo "0")
    
    # Convert to KB
    total_kb=$(echo "scale=2; $total_size / 1024" | bc 2>/dev/null || echo "N/A")
    script_kb=$(echo "scale=2; $script_size / 1024" | bc 2>/dev/null || echo "N/A")
    stylesheet_kb=$(echo "scale=2; $stylesheet_size / 1024" | bc 2>/dev/null || echo "N/A")
    image_kb=$(echo "scale=2; $image_size / 1024" | bc 2>/dev/null || echo "N/A")
    
    echo "  Total Size:      ${total_kb} KB"
    echo "  JavaScript:      ${script_kb} KB"
    echo "  Stylesheets:     ${stylesheet_kb} KB"
    echo "  Images:          ${image_kb} KB"
    echo ""
fi

# Recommendations
echo "💡 TOP RECOMMENDATIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v jq &> /dev/null; then
    # Get failed audits
    jq -r '.audits | to_entries[] | select(.value.score != null and .value.score < 1 and .value.score >= 0) | "\(.value.title): \(.value.description)"' "$latest_report" 2>/dev/null | head -5 | while read -r line; do
        echo "  • $line"
    done
else
    echo "  Install 'jq' to see detailed recommendations"
    echo "  brew install jq (macOS) or apt-get install jq (Linux)"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📁 Full report: $latest_report"
echo "🌐 HTML reports: .lighthouseci/*.html"
echo ""
