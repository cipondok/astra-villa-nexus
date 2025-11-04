# Performance Monitoring with Lighthouse CI

Complete guide for performance monitoring, Core Web Vitals tracking, and optimization.

## Table of Contents

- [Overview](#overview)
- [Core Web Vitals](#core-web-vitals)
- [Performance Budgets](#performance-budgets)
- [Running Lighthouse](#running-lighthouse)
- [CI Integration](#ci-integration)
- [Interpreting Results](#interpreting-results)
- [Optimization Tips](#optimization-tips)
- [Troubleshooting](#troubleshooting)

## Overview

Lighthouse CI automatically measures and tracks your application's performance, accessibility, SEO, and best practices scores. It runs on every pull request and deployment to ensure your app stays fast and accessible.

### What Gets Measured

**Core Web Vitals:**
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)

**Performance Metrics:**
- FCP (First Contentful Paint)
- TBT (Total Blocking Time)
- Speed Index
- Time to Interactive (TTI)

**Category Scores (0-100):**
- Performance
- Accessibility
- Best Practices
- SEO

**Resource Analysis:**
- Total page size
- JavaScript bundle size
- CSS size
- Image sizes
- Font sizes
- Number of requests

## Core Web Vitals

### LCP (Largest Contentful Paint)

**Target: < 2.5 seconds**

Measures how long it takes for the largest content element to become visible.

**Good:** < 2.5s | **Needs Improvement:** 2.5s - 4.0s | **Poor:** > 4.0s

**How to improve:**
```typescript
// 1. Optimize images
import heroImage from '@/assets/hero.webp'; // Use WebP format

// 2. Preload critical resources
<link rel="preload" as="image" href={heroImage} />

// 3. Lazy load below-the-fold content
<img loading="lazy" src={image} alt="..." />

// 4. Use responsive images
<img 
  srcSet="image-320w.jpg 320w, image-640w.jpg 640w"
  sizes="(max-width: 600px) 320px, 640px"
/>
```

### FID (First Input Delay)

**Target: < 100 milliseconds**

Measures the time from when a user first interacts to when the browser responds.

**Good:** < 100ms | **Needs Improvement:** 100ms - 300ms | **Poor:** > 300ms

**How to improve:**
```typescript
// 1. Break up long tasks
const processData = async (data) => {
  // Split work into chunks
  for (let i = 0; i < data.length; i += 100) {
    const chunk = data.slice(i, i + 100);
    processChunk(chunk);
    await new Promise(resolve => setTimeout(resolve, 0)); // Yield to browser
  }
};

// 2. Use web workers for heavy computation
const worker = new Worker('/worker.js');
worker.postMessage(heavyData);

// 3. Defer non-critical JavaScript
<script src="analytics.js" defer></script>
```

### CLS (Cumulative Layout Shift)

**Target: < 0.1**

Measures visual stability - how much content shifts during page load.

**Good:** < 0.1 | **Needs Improvement:** 0.1 - 0.25 | **Poor:** > 0.25

**How to improve:**
```css
/* 1. Always specify image dimensions */
img {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
}

/* 2. Reserve space for dynamic content */
.ad-container {
  min-height: 250px;
}

/* 3. Use CSS transforms for animations */
.animated {
  transform: translateY(0);
  transition: transform 0.3s;
}

/* 4. Avoid inserting content above existing content */
```

## Performance Budgets

Performance budgets ensure your app doesn't grow too large or slow over time.

### Current Budgets

| Resource | Budget | Threshold |
|----------|--------|-----------|
| HTML | < 50 KB | Error |
| JavaScript | < 500 KB | Warning |
| CSS | < 100 KB | Warning |
| Images | < 1 MB | Warning |
| Fonts | < 200 KB | Warning |
| **Total Page Size** | **< 2 MB** | **Warning** |

### Score Targets

| Category | Desktop | Mobile |
|----------|---------|--------|
| Performance | > 90 | > 85 |
| Accessibility | > 90 | > 90 |
| Best Practices | > 90 | > 90 |
| SEO | > 90 | > 90 |

### Adjusting Budgets

Edit `lighthouserc.js`:

```javascript
assertions: {
  // Make budgets stricter
  'resource-summary:script:size': ['error', { maxNumericValue: 400000 }], // 400KB
  
  // Make budgets more lenient
  'resource-summary:total:size': ['warn', { maxNumericValue: 3000000 }], // 3MB
  
  // Add new budgets
  'resource-summary:third-party:size': ['warn', { maxNumericValue: 500000 }],
}
```

## Running Lighthouse

### Local Testing

**Interactive mode:**
```bash
bash scripts/lighthouse-local.sh
```

Select testing mode:
1. Desktop (faster, for development)
2. Mobile (slower, more realistic)
3. Both (recommended before pushing)

**Generate report:**
```bash
bash scripts/performance-report.sh
```

Displays:
- Category scores
- Core Web Vitals
- Resource summary
- Top recommendations

### Viewing Results

**HTML Reports:**
```bash
# Open in browser
open .lighthouseci/*.html

# Or navigate to
.lighthouseci/lhr-*.html
```

**JSON Data:**
```bash
# View with jq
cat .lighthouseci/manifest.json | jq

# Extract specific metric
cat .lighthouseci/lhr-*.json | jq '.categories.performance.score'
```

## CI Integration

### Pull Request Workflow

1. **Automatic Trigger**: Runs on every PR
2. **Desktop & Mobile Tests**: Both configurations tested
3. **Score Calculation**: 3 runs, median value used
4. **PR Comment**: Results posted automatically
5. **Budget Check**: Build fails if budgets exceeded

### Example PR Comment

```markdown
## 🔦 Lighthouse CI Results

### 🖥️ Desktop

| Category | Score |
|----------|-------|
| Performance | 🟢 92 |
| Accessibility | 🟢 98 |
| Best Practices | 🟢 95 |
| SEO | 🟢 100 |

### 📱 Mobile

| Category | Score |
|----------|-------|
| Performance | 🟡 87 |
| Accessibility | 🟢 98 |
| Best Practices | 🟢 95 |
| SEO | 🟢 100 |

### 📊 Core Web Vitals

**Targets:**
- 🎯 LCP: < 2.5s
- 🎯 FID: < 100ms
- 🎯 CLS: < 0.1
```

### Deployment Workflow

On merge to `main`:
1. Full test suite runs
2. Lighthouse CI validates performance
3. Build artifacts created
4. Automatic deployment triggered
5. Performance metrics tracked over time

## Interpreting Results

### Performance Score Breakdown

The performance score is weighted:
- **FCP**: 10%
- **Speed Index**: 10%
- **LCP**: 25%
- **TBT**: 30%
- **CLS**: 25%

### Color Coding

- 🟢 **90-100**: Good (green)
- 🟡 **50-89**: Needs Improvement (yellow/orange)
- 🔴 **0-49**: Poor (red)

### Reading the Timeline

1. **White (0-1s)**: Initial load
2. **Blue (1-2s)**: Loading, scripting
3. **Green (2-3s)**: Content appearing
4. **Red**: Main thread busy (TBT contributor)

### Common Warnings

**"Eliminate render-blocking resources"**
- Move CSS to bottom or inline critical CSS
- Defer non-critical JavaScript

**"Reduce unused CSS"**
- Use CSS purging (PurgeCSS, TailwindCSS)
- Split CSS by route

**"Properly size images"**
- Use responsive images with srcset
- Compress images (WebP, AVIF)
- Implement lazy loading

**"Minimize main-thread work"**
- Break up long tasks
- Use web workers
- Defer heavy computations

## Optimization Tips

### Images

```typescript
// ✅ Good: Optimized image loading
import { lazy } from 'react';

const OptimizedImage = ({ src, alt }) => (
  <img 
    src={src}
    alt={alt}
    loading="lazy"
    decoding="async"
    width="800"
    height="600"
  />
);

// ✅ Good: Responsive images
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <source srcSet="image.jpg" type="image/jpeg" />
  <img src="image.jpg" alt="..." loading="lazy" />
</picture>
```

### JavaScript

```typescript
// ✅ Good: Code splitting
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// ✅ Good: Dynamic imports
const loadAnalytics = async () => {
  if (window.location.hostname !== 'localhost') {
    const analytics = await import('./analytics');
    analytics.init();
  }
};

// ✅ Good: Debouncing expensive operations
import { debounce } from 'lodash-es';

const expensiveOperation = debounce((value) => {
  // Heavy work here
}, 300);
```

### CSS

```css
/* ✅ Good: Use CSS transforms for animations */
.animated {
  will-change: transform;
  transform: translateX(0);
  transition: transform 0.3s ease;
}

/* ❌ Bad: Animating layout properties */
.animated-bad {
  transition: left 0.3s ease;
}

/* ✅ Good: Contain layout thrashing */
.container {
  contain: layout style paint;
}
```

### Fonts

```html
<!-- ✅ Good: Preload critical fonts -->
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>

<!-- ✅ Good: Font display strategy -->
<style>
  @font-face {
    font-family: 'MyFont';
    src: url('/fonts/main.woff2') format('woff2');
    font-display: swap; /* Show fallback while loading */
  }
</style>
```

### Accessibility

```tsx
// ✅ Good: Semantic HTML
<nav aria-label="Main navigation">
  <ul role="list">
    <li><a href="/">Home</a></li>
  </ul>
</nav>

// ✅ Good: ARIA labels
<button aria-label="Close dialog" onClick={onClose}>
  <X className="h-4 w-4" />
</button>

// ✅ Good: Focus management
const Modal = ({ isOpen, onClose }) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);
  
  // ...
};
```

## Troubleshooting

### Lighthouse Fails Locally But Passes in CI

**Cause**: Different environment or cached resources

**Solutions:**
```bash
# Clear Lighthouse cache
rm -rf .lighthouseci/

# Hard rebuild
rm -rf dist/ node_modules/.vite/
npm run build

# Run with fresh profile
lhci autorun --config=lighthouserc.js
```

### Scores Fluctuate Between Runs

**Cause**: Network variability, system load

**Solutions:**
- Close other applications
- Use consistent network conditions
- Increase number of runs in config:
  ```javascript
  numberOfRuns: 5, // Take median of 5 runs
  ```

### Budget Exceeded After Minor Changes

**Cause**: Bundle size increased, image added

**Solutions:**
```bash
# Analyze bundle size
npm run build
npx vite-bundle-visualizer

# Check what changed
git diff main -- dist/

# Find large files
find dist/ -type f -size +100k -exec ls -lh {} \;
```

### Performance Score Drops on Mobile

**Cause**: Mobile uses slower CPU (4x slowdown)

**Solutions:**
- Test on actual mobile devices
- Use mobile throttling locally:
  ```bash
  # Chrome DevTools → Performance → CPU throttling: 4x slowdown
  ```
- Optimize JavaScript execution
- Reduce main thread work

### Accessibility Errors

**Cause**: Missing ARIA labels, contrast issues

**Solutions:**
```bash
# Install axe DevTools extension
# Or use axe-core directly
npx @axe-core/cli http://localhost:8080

# Common fixes:
# 1. Add alt text to images
# 2. Add aria-labels to icon buttons
# 3. Ensure sufficient color contrast (4.5:1 ratio)
# 4. Add labels to form inputs
```

## Best Practices

### 1. Test Before Pushing

```bash
# Quick check
bash scripts/lighthouse-local.sh

# Full check (if major changes)
bash scripts/lighthouse-local.sh # Choose "Both"
```

### 2. Monitor Trends

Track scores over time:
- Set up Lighthouse CI server for historical data
- Or use temporary public storage links
- Screenshot CI reports for comparison

### 3. Set Realistic Budgets

Start with current performance, then gradually improve:

```javascript
// Month 1: Measure baseline
'categories:performance': ['warn', { minScore: 0.70 }],

// Month 2: Improve to 80
'categories:performance': ['warn', { minScore: 0.80 }],

// Month 3: Target 90+
'categories:performance': ['error', { minScore: 0.90 }],
```

### 4. Prioritize Core Web Vitals

These directly impact user experience and SEO:
1. Fix CLS first (easiest to fix)
2. Optimize LCP (biggest impact)
3. Reduce TBT (improves FID)

### 5. Test on Real Devices

Lighthouse scores are simulations. Always test on:
- Real mobile devices (not just emulators)
- Slow networks (3G, 4G)
- Different browsers
- Various screen sizes

## Additional Resources

- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse Scoring Guide](https://web.dev/performance-scoring/)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/getting-started.md)
- [Core Web Vitals Tools](https://web.dev/vitals-tools/)
- [PageSpeed Insights](https://pagespeed.web.dev/)

## Support

For performance issues:
1. Run local Lighthouse tests
2. Check the performance report
3. Review optimization tips above
4. Compare with CI results
5. Open an issue with Lighthouse HTML report attached
