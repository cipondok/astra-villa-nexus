module.exports = {
  ci: {
    collect: {
      // Start dev server and collect Lighthouse data
      startServerCommand: 'npm run build && npx vite preview --port 8080',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 30000,
      url: [
        'http://localhost:8080/',
        // Add more URLs to test additional pages
        // 'http://localhost:8080/about',
        // 'http://localhost:8080/contact',
      ],
      numberOfRuns: 3, // Run Lighthouse 3 times and take median
      settings: {
        // Use mobile emulation for Core Web Vitals
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
        // Only run categories we care about
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      },
    },
    assert: {
      // Set performance budgets
      assertions: {
        // Core Web Vitals
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }], // LCP < 2.5s
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }], // FCP < 1.8s
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }], // CLS < 0.1
        'total-blocking-time': ['warn', { maxNumericValue: 300 }], // TBT < 300ms
        'speed-index': ['warn', { maxNumericValue: 3400 }], // SI < 3.4s
        'interactive': ['warn', { maxNumericValue: 3800 }], // TTI < 3.8s
        
        // Overall scores (0-1 scale)
        'categories:performance': ['error', { minScore: 0.9 }], // Performance score > 90
        'categories:accessibility': ['warn', { minScore: 0.9 }], // A11y score > 90
        'categories:best-practices': ['warn', { minScore: 0.9 }], // Best practices > 90
        'categories:seo': ['warn', { minScore: 0.9 }], // SEO score > 90
        
        // Accessibility checks
        'color-contrast': 'error',
        'image-alt': 'error',
        'label': 'error',
        'aria-allowed-attr': 'error',
        'aria-required-attr': 'error',
        'button-name': 'error',
        'link-name': 'error',
        
        // Performance optimizations
        'uses-responsive-images': 'warn',
        'offscreen-images': 'warn',
        'unminified-css': 'warn',
        'unminified-javascript': 'warn',
        'unused-css-rules': 'warn',
        'unused-javascript': 'warn',
        'modern-image-formats': 'warn',
        'uses-optimized-images': 'warn',
        'uses-text-compression': 'warn',
        'uses-long-cache-ttl': 'warn',
        
        // Resource budgets
        'resource-summary:document:size': ['warn', { maxNumericValue: 50000 }], // HTML < 50KB
        'resource-summary:script:size': ['warn', { maxNumericValue: 500000 }], // JS < 500KB
        'resource-summary:stylesheet:size': ['warn', { maxNumericValue: 100000 }], // CSS < 100KB
        'resource-summary:image:size': ['warn', { maxNumericValue: 1000000 }], // Images < 1MB
        'resource-summary:font:size': ['warn', { maxNumericValue: 200000 }], // Fonts < 200KB
        'resource-summary:total:size': ['warn', { maxNumericValue: 2000000 }], // Total < 2MB
      },
    },
    upload: {
      target: 'temporary-public-storage', // Upload to Lighthouse CI public storage
      // For private storage, you can use:
      // target: 'lhci',
      // serverBaseUrl: 'https://your-lhci-server.com',
      // token: process.env.LHCI_TOKEN,
    },
    server: {
      // Optional: Configure LHCI server for historical data
      // port: 9001,
      // storage: {
      //   storageMethod: 'sql',
      //   sqlDialect: 'sqlite',
      //   sqlDatabasePath: './lhci.db',
      // },
    },
  },
};
