#!/bin/bash
# Bundle composition analysis with visualization

set -e

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Bundle Composition Analysis${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if build exists
if [ ! -d "dist" ]; then
    echo -e "${YELLOW}⚠️  Building application...${NC}"
    npm run build
    echo ""
fi

# Install rollup-plugin-visualizer if not present
if ! npm list rollup-plugin-visualizer > /dev/null 2>&1; then
    echo -e "${YELLOW}📦 Installing rollup-plugin-visualizer...${NC}"
    npm install --save-dev rollup-plugin-visualizer
    echo ""
fi

# Create temporary vite config with visualizer
cat > vite.config.visualizer.ts << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      filename: 'bundle-stats.html',
      gzipSize: true,
      brotliSize: true,
      template: 'treemap'
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: [/@radix-ui/]
        }
      }
    }
  }
});
EOF

echo -e "${GREEN}🔨 Building with bundle analyzer...${NC}"
echo ""

# Build with visualizer config
npx vite build --config vite.config.visualizer.ts

# Clean up temp config
rm vite.config.visualizer.ts

echo ""
echo -e "${GREEN}✓ Analysis complete!${NC}"
echo ""
echo -e "${BLUE}📈 Bundle stats saved to:${NC} ${YELLOW}bundle-stats.html${NC}"
echo ""
echo "The visualization should open in your browser automatically."
echo "If not, open 'bundle-stats.html' manually."
echo ""

# Generate text-based analysis
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📦 Largest Files:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Find and display largest files
find dist/assets -type f \( -name "*.js" -o -name "*.css" \) -exec ls -lh {} \; | \
  awk '{print $5 "\t" $9}' | \
  sort -hr | \
  head -n 10

echo ""
