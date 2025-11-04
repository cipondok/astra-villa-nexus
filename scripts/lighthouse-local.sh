#!/bin/bash
# Run Lighthouse CI locally for testing

set -e

echo "🔦 Running Lighthouse CI Locally..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if @lhci/cli is installed
if ! command -v lhci &> /dev/null; then
    echo -e "${YELLOW}Installing @lhci/cli...${NC}"
    npm install -g @lhci/cli
    echo ""
fi

# Menu
echo "Select Lighthouse CI mode:"
echo "1) Desktop (faster)"
echo "2) Mobile (slower, more realistic)"
echo "3) Both (recommended)"
echo ""
read -p "Enter choice [1-3]: " choice

run_lighthouse() {
    local mode=$1
    local config=$2
    
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Running Lighthouse CI - $mode${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Build the app
    echo "Building application..."
    npm run build
    
    # Run Lighthouse
    lhci autorun --config=$config
    
    echo ""
    echo -e "${GREEN}✓ Lighthouse $mode completed${NC}"
    echo ""
}

case $choice in
    1)
        run_lighthouse "Desktop" "lighthouserc.js"
        ;;
    2)
        # Create temporary mobile config
        cat > lighthouserc.mobile.temp.js << 'EOF'
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run build && npx vite preview --port 8080',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 30000,
      url: ['http://localhost:8080/'],
      numberOfRuns: 3,
      settings: {
        preset: 'mobile',
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4,
        },
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      },
    },
    assert: {
      assertions: {
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 600 }],
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
EOF
        run_lighthouse "Mobile" "lighthouserc.mobile.temp.js"
        rm lighthouserc.mobile.temp.js
        ;;
    3)
        run_lighthouse "Desktop" "lighthouserc.js"
        
        # Create and run mobile config
        cat > lighthouserc.mobile.temp.js << 'EOF'
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run build && npx vite preview --port 8080',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 30000,
      url: ['http://localhost:8080/'],
      numberOfRuns: 3,
      settings: {
        preset: 'mobile',
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4,
        },
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      },
    },
    assert: {
      assertions: {
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'categories:performance': ['error', { minScore: 0.85 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
EOF
        run_lighthouse "Mobile" "lighthouserc.mobile.temp.js"
        rm lighthouserc.mobile.temp.js
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

# Display results location
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Lighthouse CI Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📊 Results saved to: .lighthouseci/"
echo ""
echo "To view detailed HTML reports:"
echo "  1. Open .lighthouseci/*.html in your browser"
echo "  2. Or use: open .lighthouseci/*.html"
echo ""
echo "To view JSON results:"
echo "  cat .lighthouseci/manifest.json | jq"
echo ""
