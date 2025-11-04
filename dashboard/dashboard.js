// Main dashboard controller
class Dashboard {
  constructor() {
    this.data = null;
    this.init();
  }

  async init() {
    try {
      // Load all data
      this.data = await window.dataLoader.loadAllData();
      
      // Update UI
      this.updateOverviewStats();
      this.updatePerformanceStats();
      this.updateAccessibilityStats();
      this.updateCoverageStats();
      this.updateVisualStats();
      this.updateBuildStats();
      
      // Create charts
      this.createCharts();
      
      // Update timestamp
      this.updateTimestamp();
      
      console.log('Dashboard initialized successfully');
    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
    }
  }

  updateOverviewStats() {
    const { tests, history } = this.data;
    
    document.getElementById('passing-tests').textContent = tests.passed;
    document.getElementById('failing-tests').textContent = tests.failed;
    document.getElementById('test-duration').textContent = `${tests.duration.toFixed(1)}s`;
    
    const successRate = ((tests.passed / tests.total) * 100).toFixed(1);
    document.getElementById('success-rate').textContent = `${successRate}%`;
  }

  updatePerformanceStats() {
    const { lighthouse } = this.data;
    
    document.getElementById('perf-score').textContent = lighthouse.performance;
    document.getElementById('lcp-value').textContent = `${lighthouse.lcp}s`;
    document.getElementById('cls-value').textContent = lighthouse.cls.toFixed(3);
    document.getElementById('fcp-value').textContent = `${lighthouse.fcp}s`;
  }

  updateAccessibilityStats() {
    const { accessibility } = this.data;
    
    document.getElementById('a11y-passes').textContent = accessibility.passes;
    document.getElementById('a11y-violations').textContent = accessibility.violations;
    document.getElementById('a11y-incomplete').textContent = accessibility.incomplete;
    document.getElementById('a11y-score').textContent = accessibility.score;
    
    // Render violations list
    this.renderViolations(accessibility.recentViolations);
  }

  updateCoverageStats() {
    const { coverage } = this.data;
    
    document.getElementById('coverage-lines').textContent = `${coverage.lines.pct}%`;
    document.getElementById('coverage-branches').textContent = `${coverage.branches.pct}%`;
    document.getElementById('coverage-functions').textContent = `${coverage.functions.pct}%`;
    document.getElementById('coverage-statements').textContent = `${coverage.statements.pct}%`;
  }

  updateVisualStats() {
    const { visual } = this.data;
    
    document.getElementById('visual-passed').textContent = visual.passed;
    document.getElementById('visual-failed').textContent = visual.failed;
    document.getElementById('visual-total').textContent = visual.total;
    document.getElementById('visual-diff').textContent = visual.avgDiff;
  }

  updateBuildStats() {
    const { buildSize } = this.data;
    
    const formatSize = (kb) => kb > 1000 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
    
    document.getElementById('build-size').textContent = formatSize(buildSize.total);
    document.getElementById('js-size').textContent = formatSize(buildSize.js);
    document.getElementById('css-size').textContent = formatSize(buildSize.css);
    document.getElementById('assets-size').textContent = formatSize(buildSize.assets);
  }

  createCharts() {
    const { history, lighthouse, accessibility, coverage, visual, buildSize } = this.data;
    
    // Overview charts
    window.chartManager.createTestTrendChart(
      document.getElementById('testTrendChart').getContext('2d'),
      history
    );
    
    window.chartManager.createTestBreakdownChart(
      document.getElementById('testBreakdownChart').getContext('2d'),
      {}
    );
    
    // Performance charts
    window.chartManager.createLighthouseScoresChart(
      document.getElementById('lighthouseScoresChart').getContext('2d'),
      lighthouse.history
    );
    
    window.chartManager.createCoreWebVitalsChart(
      document.getElementById('coreWebVitalsChart').getContext('2d'),
      lighthouse.history
    );
    
    window.chartManager.createResourceBudgetChart(
      document.getElementById('resourceBudgetChart').getContext('2d'),
      {}
    );
    
    // Accessibility charts
    window.chartManager.createA11yViolationsChart(
      document.getElementById('a11yViolationsChart').getContext('2d'),
      accessibility.violationsByCategory
    );
    
    // Coverage charts
    window.chartManager.createCoverageTrendChart(
      document.getElementById('coverageTrendChart').getContext('2d'),
      coverage.history
    );
    
    window.chartManager.createCoverageByFileChart(
      document.getElementById('coverageByFileChart').getContext('2d')
    );
    
    // Visual regression charts
    window.chartManager.createVisualRegressionChart(
      document.getElementById('visualRegressionChart').getContext('2d'),
      visual.history
    );
    
    // Build size charts
    window.chartManager.createBuildSizeChart(
      document.getElementById('buildSizeChart').getContext('2d'),
      buildSize.history
    );
  }

  renderViolations(violations) {
    const container = document.getElementById('violations-list');
    
    if (!violations || violations.length === 0) {
      container.innerHTML = '<div class="loading">No violations found! 🎉</div>';
      return;
    }
    
    const html = violations.map(v => `
      <div class="violation-item">
        <div class="violation-header">
          <div class="violation-title">${v.id}</div>
          <span class="violation-impact ${v.impact}">${v.impact}</span>
        </div>
        <div class="violation-description">${v.description}</div>
        <div class="violation-help">
          <a href="${v.helpUrl}" target="_blank">Learn more →</a>
          <span style="margin-left: 1rem; color: var(--text-secondary);">
            ${v.nodes} affected node(s)
          </span>
        </div>
      </div>
    `).join('');
    
    container.innerHTML = '<h3>Recent Violations</h3>' + html;
  }

  updateTimestamp() {
    const now = new Date();
    const formatted = now.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    document.getElementById('last-updated').textContent = formatted;
  }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new Dashboard();
});

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});
