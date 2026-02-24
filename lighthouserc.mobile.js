/**
 * Lighthouse CI Mobile Configuration
 * 
 * Tests key pages with mobile emulation to catch:
 * - Slow LCP / FCP on constrained devices
 * - Touch-target sizing violations
 * - Viewport / font-size accessibility issues
 * - CLS from late-loading images or layout shifts
 * 
 * Run: npx lhci autorun --config=lighthouserc.mobile.js
 */
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npx vite preview --port 8081',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 30000,
      url: [
        'http://localhost:8081/',
        'http://localhost:8081/search',
        'http://localhost:8081/properties',
        'http://localhost:8081/contact',
        'http://localhost:8081/help',
        'http://localhost:8081/about',
      ],
      numberOfRuns: 1,
      settings: {
        // Mobile emulation (Lighthouse default "mobile" preset)
        preset: 'perf',
        formFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 375,
          height: 812,
          deviceScaleFactor: 3,
          disabled: false,
        },
        throttling: {
          // Simulated 4G mobile
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4,
        },
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      },
    },
    assert: {
      assertions: {
        // ── Core Web Vitals (mobile thresholds) ──
        'largest-contentful-paint': ['error', { maxNumericValue: 4000 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 600 }],
        'speed-index': ['warn', { maxNumericValue: 5800 }],

        // ── Category scores (0-1) ──
        'categories:performance': ['warn', { minScore: 0.5 }],
        'categories:accessibility': ['error', { minScore: 0.85 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.85 }],

        // ── Mobile-critical accessibility ──
        'color-contrast': 'error',
        'image-alt': 'error',
        'label': 'error',
        'button-name': 'error',
        'link-name': 'error',
        'tap-targets': 'warn',
        'font-size': 'warn',
        'meta-viewport': 'error',

        // ── ARIA ──
        'aria-allowed-attr': 'error',
        'aria-required-attr': 'error',

        // ── Mobile performance ──
        'uses-responsive-images': 'warn',
        'offscreen-images': 'warn',
        'modern-image-formats': 'warn',
        'viewport': 'error',

        // ── Resource budgets (mobile-friendly) ──
        'resource-summary:script:size': ['warn', { maxNumericValue: 750000 }],
        'resource-summary:stylesheet:size': ['warn', { maxNumericValue: 150000 }],
        'resource-summary:image:size': ['warn', { maxNumericValue: 1500000 }],
        'resource-summary:total:size': ['warn', { maxNumericValue: 3000000 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
