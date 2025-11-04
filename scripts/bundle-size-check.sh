#!/bin/bash
# Local bundle size checking and analysis script

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📦 Bundle Size Analysis${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if build exists
if [ ! -d "dist" ]; then
    echo -e "${YELLOW}⚠️  No build found. Building application...${NC}"
    npm run build
    echo ""
fi

# Function to format bytes to KB
bytes_to_kb() {
    echo $(($1 / 1024))
}

# Function to get file size
get_size() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        stat -f%z "$1"
    else
        stat -c%s "$1"
    fi
}

# Analyze JavaScript bundles
echo -e "${GREEN}📊 JavaScript Bundles:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

TOTAL_JS_SIZE=0
for file in dist/assets/*.js; do
    if [ -f "$file" ]; then
        SIZE=$(get_size "$file")
        SIZE_KB=$(bytes_to_kb $SIZE)
        TOTAL_JS_SIZE=$((TOTAL_JS_SIZE + SIZE))
        
        # Gzip size
        GZIP_SIZE=$(gzip -c "$file" | wc -c)
        GZIP_SIZE_KB=$(bytes_to_kb $GZIP_SIZE)
        
        COMPRESSION=$((100 - (GZIP_SIZE * 100 / SIZE)))
        
        printf "  %-40s %8s KB (gzip: %6s KB, -%d%%)\n" \
            "$(basename "$file")" \
            "$SIZE_KB" \
            "$GZIP_SIZE_KB" \
            "$COMPRESSION"
    fi
done

TOTAL_JS_KB=$(bytes_to_kb $TOTAL_JS_SIZE)
echo ""
echo -e "${BLUE}Total JS:${NC} ${TOTAL_JS_KB} KB"
echo ""

# Analyze CSS bundles
echo -e "${GREEN}🎨 CSS Bundles:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

TOTAL_CSS_SIZE=0
for file in dist/assets/*.css; do
    if [ -f "$file" ]; then
        SIZE=$(get_size "$file")
        SIZE_KB=$(bytes_to_kb $SIZE)
        TOTAL_CSS_SIZE=$((TOTAL_CSS_SIZE + SIZE))
        
        # Gzip size
        GZIP_SIZE=$(gzip -c "$file" | wc -c)
        GZIP_SIZE_KB=$(bytes_to_kb $GZIP_SIZE)
        
        COMPRESSION=$((100 - (GZIP_SIZE * 100 / SIZE)))
        
        printf "  %-40s %8s KB (gzip: %6s KB, -%d%%)\n" \
            "$(basename "$file")" \
            "$SIZE_KB" \
            "$GZIP_SIZE_KB" \
            "$COMPRESSION"
    fi
done

TOTAL_CSS_KB=$(bytes_to_kb $TOTAL_CSS_SIZE)
echo ""
echo -e "${BLUE}Total CSS:${NC} ${TOTAL_CSS_KB} KB"
echo ""

# Run size-limit checks
echo -e "${GREEN}🎯 Size Limit Checks:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if npm run size 2>&1 | tee /tmp/size-output.txt; then
    echo ""
    echo -e "${GREEN}✓ All size limits passed!${NC}"
    SIZE_CHECK_PASSED=true
else
    echo ""
    echo -e "${RED}✗ Some size limits exceeded!${NC}"
    SIZE_CHECK_PASSED=false
fi

echo ""

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📈 Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

TOTAL_SIZE=$((TOTAL_JS_SIZE + TOTAL_CSS_SIZE))
TOTAL_SIZE_KB=$(bytes_to_kb $TOTAL_SIZE)

# Calculate gzip total
TOTAL_GZIP_SIZE=$(find dist/assets -type f \( -name "*.js" -o -name "*.css" \) -exec gzip -c {} \; | wc -c)
TOTAL_GZIP_KB=$(bytes_to_kb $TOTAL_GZIP_SIZE)

TOTAL_COMPRESSION=$((100 - (TOTAL_GZIP_SIZE * 100 / TOTAL_SIZE)))

echo ""
echo -e "  Total Size:      ${YELLOW}${TOTAL_SIZE_KB} KB${NC}"
echo -e "  Gzipped Total:   ${GREEN}${TOTAL_GZIP_KB} KB${NC} (-${TOTAL_COMPRESSION}%)"
echo ""

# Check against thresholds
JS_LIMIT=500
CSS_LIMIT=100

if [ $TOTAL_JS_KB -gt $JS_LIMIT ]; then
    echo -e "${RED}⚠️  JavaScript bundle exceeds ${JS_LIMIT} KB limit${NC}"
fi

if [ $TOTAL_CSS_KB -gt $CSS_LIMIT ]; then
    echo -e "${RED}⚠️  CSS bundle exceeds ${CSS_LIMIT} KB limit${NC}"
fi

echo ""

# Recommendations
echo -e "${BLUE}💡 Optimization Tips:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  1. Run 'npm run analyze' for visual bundle analysis"
echo "  2. Consider code splitting for large routes"
echo "  3. Use lazy loading for heavy components"
echo "  4. Check for duplicate dependencies"
echo "  5. Tree shake unused exports"
echo ""

# Exit with appropriate code
if [ "$SIZE_CHECK_PASSED" = true ]; then
    exit 0
else
    exit 1
fi
