# Bundle Size Tracking Guide

Complete guide for bundle size monitoring and optimization.

## Table of Contents

- [Overview](#overview)
- [Configuration](#configuration)
- [Local Usage](#local-usage)
- [CI/CD Integration](#ci-cd-integration)
- [Optimization Tips](#optimization-tips)
- [Troubleshooting](#troubleshooting)

## Overview

This project uses **size-limit** to automatically track and enforce bundle size limits. The system:

- ✅ Prevents bundle size regressions
- 📊 Tracks historical size trends
- ⚠️ Fails builds when limits are exceeded
- 💬 Comments on PRs with size changes
- 📈 Displays data in the test dashboard

### Why Bundle Size Matters

- **Performance**: Smaller bundles load faster
- **User Experience**: Faster initial page load
- **SEO**: Google considers page speed in rankings
- **Mobile Users**: Reduced data usage on mobile networks
- **Cost**: Lower bandwidth costs

## Configuration

### Size Limits File

Location: `.size-limit.js`

```javascript
module.exports = [
  {
    name: "Total App Bundle",
    path: "dist/**/*.js",
    limit: "500 KB",
    gzip: true
  },
  {
    name: "Main Bundle (Entry)",
    path: "dist/assets/index-*.js",
    limit: "300 KB",
    gzip: true
  },
  {
    name: "CSS Bundle",
    path: "dist/assets/index-*.css",
    limit: "100 KB",
    gzip: true
  },
  {
    name: "Vendor Chunk",
    path: "dist/assets/vendor-*.js",
    limit: "250 KB",
    gzip: true,
    ignore: ["dist/assets/index-*.js"]
  }
];
```

### Customizing Limits

To adjust limits based on your needs:

```javascript
{
  name: "My Custom Bundle",
  path: "dist/assets/my-chunk-*.js",
  limit: "150 KB",  // Adjust this value
  gzip: true,       // Measure gzipped size
  brotli: false,    // Can also use brotli
  running: false    // Set to true to measure execution time
}
```

## Local Usage

### Quick Check

```bash
# Simple size check against limits
npx size-limit

# OR if you added the npm script:
npm run size

# OR use the provided script:
./scripts/size-check.sh
```

### Detailed Analysis

```bash
# Full analysis with all bundle details
./scripts/bundle-size-check.sh
```

**Output includes:**
- Individual file sizes
- Gzipped sizes
- Compression ratios
- Comparison against limits
- Optimization recommendations

### Visual Analysis

```bash
# Generate interactive treemap visualization
./scripts/bundle-analyze.sh
```

This creates `bundle-stats.html` showing:
- Bundle composition breakdown
- Module dependencies
- Size contribution by package
- Gzip and Brotli sizes

## CI/CD Integration

### GitHub Actions Workflow

Location: `.github/workflows/bundle-size.yml`

**Triggers:**
- Pull requests to `main` or `develop`
- Pushes to `main` branch

**Actions:**
1. Builds the application
2. Runs size-limit checks
3. Compares with base branch (PRs only)
4. Comments on PR with size report
5. Fails build if limits exceeded

### PR Comments

The workflow automatically comments on PRs with:

```
## ✅ Bundle Size Report

| Metric | Size | Change |
|--------|------|--------|
| **Total JS** | 350 KB | 📉 -5 KB (-1.4%) |
| **Gzipped** | 125 KB | - |
| **CSS** | 48 KB | - |
| **Base (main)** | 355 KB | - |
```

**Warning indicators:**
- ⚠️ Yellow warning: Size increased >50 KB
- ❌ Red error: Size exceeds configured limit

### Dashboard Integration

Bundle size data is automatically:
- Collected on each CI run
- Stored as artifacts
- Displayed in the test dashboard
- Tracked over time with trend graphs

View at: `https://yourusername.github.io/your-repo/`

## Optimization Tips

### 1. Code Splitting

Split large features into separate chunks:

```typescript
// Before (all in one bundle)
import HeavyComponent from './HeavyComponent';

// After (lazy loaded)
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));
```

### 2. Dynamic Imports

Load code only when needed:

```typescript
// Load on user action
button.addEventListener('click', async () => {
  const module = await import('./heavy-module');
  module.doSomething();
});
```

### 3. Tree Shaking

Ensure proper imports for tree shaking:

```typescript
// ❌ Bad - imports entire library
import _ from 'lodash';

// ✅ Good - imports only needed function
import debounce from 'lodash/debounce';
```

### 4. Analyze Dependencies

Find heavy dependencies:

```bash
# Generate bundle analyzer
./scripts/bundle-analyze.sh

# Look for:
# - Large libraries you might not need
# - Multiple versions of same package
# - Unexpectedly large dependencies
```

### 5. Remove Unused Code

```bash
# Use webpack-bundle-analyzer to identify:
- Dead code
- Unused exports
- Redundant dependencies
- Large assets that could be optimized
```

### 6. Optimize Images

```typescript
// Use next-gen formats
- WebP instead of JPEG/PNG
- AVIF for even better compression
- Lazy load images below the fold
- Use responsive images
```

### 7. Use Production Builds

Always measure production builds:

```bash
npm run build  # Not npm run dev
```

Production builds are:
- Minified
- Tree-shaken
- Optimized
- Much smaller than dev builds

## Troubleshooting

### Build Failing Due to Size Limit

**Error:**
```
✗ Main Bundle (Entry)
  Package size limit has exceeded by 50 KB
```

**Solutions:**

1. **Identify what changed:**
   ```bash
   git diff main -- package.json
   # Check what dependencies were added
   ```

2. **Analyze the bundle:**
   ```bash
   ./scripts/bundle-analyze.sh
   # Look for the largest modules
   ```

3. **Split code:**
   - Extract large features to separate chunks
   - Use dynamic imports for heavy components

4. **Remove unused dependencies:**
   ```bash
   npm uninstall unused-package
   ```

5. **Increase limit (last resort):**
   Edit `.size-limit.js` and adjust limits
   - Only if the size increase is justified
   - Document why the limit was increased

### Size Check Running Slowly

**Cause:** Large number of files

**Solutions:**
- Exclude test files from size checks
- Use more specific path patterns
- Run checks only on main bundles

### False Positives

**Issue:** Size checks fail but bundle is fine

**Causes:**
- Build output structure changed
- Path patterns don't match files
- Limits too strict for your use case

**Solutions:**
1. Verify build output:
   ```bash
   ls -lh dist/assets/
   ```

2. Update path patterns in `.size-limit.js`

3. Run local check:
   ```bash
   ./scripts/bundle-size-check.sh
   ```

### PR Comments Not Appearing

**Causes:**
- Missing GitHub token permissions
- Workflow not enabled
- PR from fork (external contributors)

**Solutions:**
1. Check workflow file syntax
2. Verify GitHub Actions is enabled
3. Check repository permissions:
   - Settings → Actions → General
   - Allow "Read and write permissions"

## Best Practices

1. **Set Realistic Limits**
   - Base on actual application needs
   - Leave 10-15% headroom for growth
   - Adjust as features are added/removed

2. **Monitor Trends**
   - Check dashboard regularly
   - Investigate sudden increases
   - Celebrate successful optimizations

3. **Review PR Size Changes**
   - Don't ignore size warnings
   - Understand what caused the change
   - Challenge unnecessary increases

4. **Optimize Proactively**
   - Don't wait for limits to be hit
   - Regular bundle analysis
   - Continuous improvement mindset

5. **Document Changes**
   - Note why limits were adjusted
   - Document optimization strategies used
   - Share learnings with team

## Resources

- [size-limit Documentation](https://github.com/ai/size-limit)
- [Web.dev: Optimize Bundle Size](https://web.dev/reduce-javascript-payloads-with-code-splitting/)
- [webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [Can I Use: Brotli](https://caniuse.com/brotli)

## Support

If you encounter issues with bundle size tracking:

1. Check the troubleshooting section above
2. Review GitHub Actions logs
3. Run local size checks for debugging
4. Open an issue with:
   - Error message
   - Build output
   - Size limit configuration
