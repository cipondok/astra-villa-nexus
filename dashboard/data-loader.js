// Data loader for test dashboard
class DataLoader {
  constructor() {
    this.baseUrl = 'data/';
  }

  async loadJSON(filename) {
    try {
      const response = await fetch(`${this.baseUrl}${filename}`);
      if (!response.ok) {
        console.warn(`Failed to load ${filename}`);
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error(`Error loading ${filename}:`, error);
      return null;
    }
  }

  async loadLatestTestResults() {
    return await this.loadJSON('latest-tests.json');
  }

  async loadTestHistory() {
    return await this.loadJSON('test-history.json');
  }

  async loadLighthouseData() {
    return await this.loadJSON('lighthouse-data.json');
  }

  async loadAccessibilityData() {
    return await this.loadJSON('accessibility-data.json');
  }

  async loadCoverageData() {
    return await this.loadJSON('coverage-data.json');
  }

  async loadVisualRegressionData() {
    return await this.loadJSON('visual-regression-data.json');
  }

  async loadBuildSizeData() {
    return await this.loadJSON('build-size-data.json');
  }

  async loadBundleSizeData() {
    return await this.loadJSON('bundle-size.json');
  }

  async loadAllData() {
    const [
      tests,
      history,
      lighthouse,
      accessibility,
      coverage,
      visual,
      buildSize,
      bundleSize
    ] = await Promise.all([
      this.loadLatestTestResults(),
      this.loadTestHistory(),
      this.loadLighthouseData(),
      this.loadAccessibilityData(),
      this.loadCoverageData(),
      this.loadVisualRegressionData(),
      this.loadBuildSizeData(),
      this.loadBundleSizeData()
    ]);

    return {
      tests: tests || this.getMockTestData(),
      history: history || this.getMockHistoryData(),
      lighthouse: lighthouse || this.getMockLighthouseData(),
      accessibility: accessibility || this.getMockAccessibilityData(),
      coverage: coverage || this.getMockCoverageData(),
      visual: visual || this.getMockVisualData(),
      buildSize: buildSize || this.getMockBuildSizeData(),
      bundleSize: bundleSize || this.getMockBundleSizeData()
    };
  }

  // Mock data for demo purposes
  getMockTestData() {
    return {
      total: 156,
      passed: 150,
      failed: 6,
      skipped: 0,
      duration: 45.3,
      timestamp: new Date().toISOString()
    };
  }

  getMockHistoryData() {
    const history = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      history.push({
        date: date.toISOString().split('T')[0],
        passed: Math.floor(140 + Math.random() * 15),
        failed: Math.floor(Math.random() * 10),
        duration: 40 + Math.random() * 20
      });
    }
    return history;
  }

  getMockLighthouseData() {
    return {
      performance: 92,
      accessibility: 98,
      bestPractices: 95,
      seo: 100,
      lcp: 2.1,
      cls: 0.05,
      fcp: 1.4,
      tbt: 250,
      history: this.generateMetricHistory()
    };
  }

  getMockAccessibilityData() {
    return {
      passes: 42,
      violations: 3,
      incomplete: 2,
      score: 95,
      violationsByCategory: {
        'color-contrast': 1,
        'aria-required-attr': 1,
        'button-name': 1
      },
      recentViolations: [
        {
          id: 'color-contrast',
          impact: 'serious',
          description: 'Ensures the contrast between foreground and background colors meets WCAG 2 AA contrast ratio thresholds',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/color-contrast',
          nodes: 2
        }
      ]
    };
  }

  getMockCoverageData() {
    return {
      lines: { covered: 850, total: 1000, pct: 85 },
      branches: { covered: 180, total: 250, pct: 72 },
      functions: { covered: 95, total: 120, pct: 79 },
      statements: { covered: 850, total: 1000, pct: 85 },
      history: this.generateCoverageHistory()
    };
  }

  getMockVisualData() {
    return {
      total: 45,
      passed: 42,
      failed: 3,
      avgDiff: 12,
      history: this.generateVisualHistory(),
      recentDiffs: []
    };
  }

  getMockBuildSizeData() {
    return {
      total: 1850,
      js: 1200,
      css: 250,
      assets: 400,
      history: this.generateBuildSizeHistory()
    };
  }

  generateMetricHistory() {
    const history = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      history.push({
        date: date.toISOString().split('T')[0],
        performance: 88 + Math.random() * 8,
        accessibility: 95 + Math.random() * 5,
        lcp: 2.0 + Math.random() * 0.5,
        cls: 0.03 + Math.random() * 0.05
      });
    }
    return history;
  }

  generateCoverageHistory() {
    const history = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      history.push({
        date: date.toISOString().split('T')[0],
        lines: 80 + Math.random() * 8,
        branches: 68 + Math.random() * 8,
        functions: 75 + Math.random() * 8
      });
    }
    return history;
  }

  generateVisualHistory() {
    const history = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      history.push({
        date: date.toISOString().split('T')[0],
        passed: 40 + Math.floor(Math.random() * 5),
        failed: Math.floor(Math.random() * 5)
      });
    }
    return history;
  }

  generateBuildSizeHistory() {
    const history = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      history.push({
        date: date.toISOString().split('T')[0],
        total: 1700 + Math.random() * 300,
        js: 1100 + Math.random() * 200,
        css: 200 + Math.random() * 100
      });
    }
    return history;
  }

  getMockBundleSizeData() {
    return {
      totalSizeKB: 350,
      gzipSizeKB: 125,
      cssSizeKB: 48,
      limits: {
        totalApp: 500,
        mainBundle: 300,
        cssBundle: 100,
        vendorChunk: 250
      },
      history: this.generateBundleSizeHistory()
    };
  }

  generateBundleSizeHistory() {
    const history = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      history.push({
        date: date.toISOString().split('T')[0],
        totalSizeKB: 330 + Math.random() * 40,
        gzipSizeKB: 115 + Math.random() * 20,
        cssSizeKB: 45 + Math.random() * 8
      });
    }
    return history;
  }
}

window.dataLoader = new DataLoader();
