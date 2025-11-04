# AI Chat Widget with Accessibility

A responsive, animated AI chat widget with full accessibility support including `prefers-reduced-motion` compliance and developer debug tools.

[![Tests](https://img.shields.io/badge/tests-passing-brightgreen)](https://github.com)
[![E2E](https://img.shields.io/badge/e2e-playwright-green)](https://playwright.dev)
[![Lighthouse](https://img.shields.io/badge/lighthouse-90%2B-brightgreen)](https://github.com)

## Features

### 🎨 Smooth Animations
- Scroll-based show/hide behavior
- Entrance animations with slide, fade, scale, and rotation effects
- Multi-layer pulsing glow effect
- Hover and interaction states
- Performance-optimized for mobile devices

### ♿ Accessibility First
- **Reduced Motion Support**: Automatically detects and respects `prefers-reduced-motion` system setting
- Disables decorative animations when reduced motion is enabled
- Maintains functionality while simplifying visual effects
- WCAG 2.1 compliant

### 🛠️ Developer Tools
- **Debug Panel** (Development Mode Only)
  - Toggle reduced motion on/off without changing OS settings
  - Visual status indicator showing current state
  - Manual override with localStorage persistence
  - One-click reset to system preferences
- **Onboarding Tooltip**: First-visit guide introducing keyboard shortcuts and debug features
- **Keyboard Shortcuts Help**: Press `?` to view all available shortcuts

### 📱 Responsive Design
- Optimized for both desktop and mobile devices
- Touch-friendly target sizes
- Adaptive positioning and sizing
- Battery-efficient animations on mobile

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:8080`

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Testing Reduced Motion

#### Option 1: Debug Panel (Recommended for Development)

1. Start the development server
2. Look for the **Settings** button in the bottom-left corner
3. Click to open the Animation Debug panel
4. Toggle animations on/off instantly
5. Reset to system settings when done

#### Option 2: System Settings

**macOS:**
```
System Settings → Accessibility → Display → Reduce motion
```

**Windows:**
```
Settings → Accessibility → Visual effects → Animation effects
```

**Linux (GNOME):**
```
Settings → Accessibility → Seeing → Reduced animation
```

## Debug Panel Features

The debug panel appears only in development mode and provides:

- **Current Status Display**: Shows whether reduced motion is ON or OFF
- **Manual Override**: Toggle animations without changing OS settings
- **Override Indicator**: Visual warning when manual override is active
- **Reset Button**: One-click return to system preferences
- **Persistent Settings**: Override saved to localStorage across sessions
- **Keyboard Shortcuts**:
  - `Cmd/Ctrl + D` - Toggle debug panel open/closed
  - `Cmd/Ctrl + A` - Toggle animations on/off directly
  - `Cmd/Ctrl + R` - Reset to system settings (clears override)
  - `?` or `Cmd/Ctrl + /` - Show keyboard shortcuts help modal

### Using the Debug Panel

**With Mouse/Touch:**
1. Click the ⚙️ Settings icon in the bottom-left corner
2. The panel shows current animation state
3. Click "Enable Animations" or "Disable Animations" to toggle
4. Click "Reset to System Setting" to clear manual override
5. Close the panel with the X button (your settings persist)

**With Keyboard:**
- `Cmd/Ctrl + D` - Open/close the debug panel
- `Cmd/Ctrl + A` - Instantly toggle animations on/off
- `Cmd/Ctrl + R` - Reset to system settings (if override is active)
- `?` or `Cmd/Ctrl + /` - View all keyboard shortcuts

💡 **Tip**: Press `?` anytime to see all available keyboard shortcuts in a help modal!

## Visual Indicators

### Console Logs (Development)
- `✨ Accessibility: Full animations enabled` - Normal animation mode
- `🎯 Accessibility: Reduced motion mode is ACTIVE` - Simplified animations
- `🔧 Dev Override: Reduced motion manually set to ON/OFF` - Manual toggle used

### On-Screen Badge (Development)
A "Reduced Motion" badge appears above the chat button when reduced motion is active, helping you verify the current state at a glance.

### Onboarding Tooltip (First Visit)
On your first visit in development mode, an interactive tooltip appears to introduce you to:
- Debug panel features
- Keyboard shortcuts
- Quick start guide

The tooltip:
- Appears automatically after 1.5 seconds
- Can be dismissed with "Got It" or "Try It Now" buttons
- Never shows again (tracked in localStorage)
- Can be reset by clearing localStorage key: `debug-panel-onboarding-seen`

## Project Structure

```
src/
├── components/
│   └── ai/
│       ├── ResponsiveAIChatWidget.tsx  # Main chat widget
│       ├── DebugPanel.tsx              # Debug control panel
│       └── KeyboardShortcutsModal.tsx  # Shortcuts help modal
├── hooks/
│   └── usePrefersReducedMotion.ts     # Accessibility hook
├── test/
│   ├── setup.ts                        # Test configuration
│   └── globals.d.ts                    # TypeScript test types
└── ...

Tests:
├── src/hooks/usePrefersReducedMotion.test.ts  # Hook unit tests
└── src/components/ai/DebugPanel.test.tsx       # Component unit tests
```

## Testing

The project includes comprehensive unit tests and E2E tests for both the hook and components.

### Running Tests

```bash
# Unit Tests (Vitest)
npm test              # Run all unit tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report

# E2E Tests (Playwright)
npx playwright test              # Run all E2E tests
npx playwright test --ui         # Run with interactive UI
npx playwright test --debug      # Debug mode
npx playwright show-report       # View test report

# Accessibility Tests (axe-core)
npx playwright test e2e/accessibility.spec.ts    # Run accessibility audits
npx playwright test e2e/accessibility.spec.ts --ui # Interactive accessibility testing

# Visual Regression Tests
npx playwright test e2e/visual-regression.spec.ts           # Run visual tests
npx playwright test e2e/visual-regression-advanced.spec.ts  # Run advanced visual tests
bash scripts/visual-regression-report.sh                    # Run with detailed report

# Performance Tests (Lighthouse CI)
bash scripts/lighthouse-local.sh                            # Run Lighthouse CI locally
bash scripts/performance-report.sh                          # Generate performance report
npx lhci autorun                                            # Run with default config

# Update Visual Regression Baselines (when UI changes are intentional)
bash scripts/update-screenshots.sh                          # Update all baseline screenshots
npx playwright test --update-snapshots                      # Alternative: update all snapshots

# Local CI Checks
bash scripts/ci-local.sh                                    # Run all CI checks locally before pushing
bash scripts/ci-debug.sh                                    # Interactive CI debugging tool
```

### Test Coverage

#### Unit Tests
- ✅ **usePrefersReducedMotion Hook**
  - System preference detection
  - Manual override functionality
  - localStorage persistence
  - Override clearing
- ✅ **DebugPanel Component**
  - Panel visibility toggling
  - Animation state display
  - User interactions
  - Keyboard shortcuts

#### E2E Tests (Playwright)
- ✅ **Onboarding Flow** (`e2e/onboarding.spec.ts`)
  - First-visit tooltip display
  - Keyboard shortcut showcase
  - Dismissal and persistence
  - "Try It Now" functionality
- ✅ **Debug Panel** (`e2e/debug-panel.spec.ts`)
  - Panel opening/closing
  - Animation toggling
  - Manual override behavior
  - Settings persistence
  - Keyboard shortcuts integration
- ✅ **Chat Widget** (`e2e/chat-widget.spec.ts`)
  - Widget visibility and animations
  - Responsive behavior
  - Z-index stacking
  - Mobile viewport testing
- ✅ **Keyboard Shortcuts** (`e2e/keyboard-shortcuts.spec.ts`)
  - Modal opening/closing
  - Shortcut display
  - Category organization
- ✅ **Integration Tests** (`e2e/integration.spec.ts`)
  - Complete user journey
  - Keyboard-only navigation
  - Mobile user flow
  - State persistence
  - Multi-panel coexistence

#### Visual Regression Tests (Playwright)
- ✅ **Component Snapshots** (`e2e/visual-regression.spec.ts`)
  - Chat widget appearance (normal, hover, mobile)
  - Debug panel states (closed, open, with override)
  - Onboarding tooltip (desktop & mobile)
  - Keyboard shortcuts modal
  - Full page layouts
  - Dark mode vs Light mode comparison
  - State transition captures
- ✅ **Advanced Visual Tests** (`e2e/visual-regression-advanced.spec.ts`)
  - Component interaction states (hover, focus)
  - Layout combinations (multiple panels open)
  - Responsive breakpoints (7 viewport sizes)
  - Accessibility states (focus visible, high contrast)
  - Badge and indicator states
  - Typography and text rendering
  - Gradient and shadow effects
  - Edge cases (narrow/wide viewports, text overflow)

#### Performance Tests (Lighthouse CI)
- ✅ **Core Web Vitals** (`.github/workflows/lighthouse.yml`)
  - LCP (Largest Contentful Paint) < 2.5s
  - FID (First Input Delay) < 100ms
  - CLS (Cumulative Layout Shift) < 0.1
  - TBT (Total Blocking Time)
  - Speed Index
- ✅ **Performance Scores**
  - Overall performance score > 90%
  - Desktop and mobile testing
  - 3 runs per test (median value)
- ✅ **Accessibility Audits**
  - Color contrast checks
  - ARIA attributes validation
  - Semantic HTML verification
  - Keyboard navigation
  - Screen reader compatibility
- ✅ **SEO & Best Practices**
  - Meta tags validation
  - Mobile-friendliness
  - HTTPS usage
  - Best practices compliance
- ✅ **Resource Budgets**
  - HTML < 50KB, JS < 500KB, CSS < 100KB
  - Images < 1MB, Fonts < 200KB
  - Total page size < 2MB

### Test Structure

```
src/
├── hooks/
│   ├── usePrefersReducedMotion.ts
│   └── usePrefersReducedMotion.test.ts
├── components/
│   └── ai/
│       ├── DebugPanel.tsx
│       └── DebugPanel.test.tsx
└── test/
    ├── setup.ts        # Test configuration
    └── globals.d.ts    # TypeScript definitions

e2e/
├── onboarding.spec.ts                # Onboarding tooltip tests
├── debug-panel.spec.ts               # Debug panel tests
├── chat-widget.spec.ts               # Chat widget tests
├── keyboard-shortcuts.spec.ts        # Shortcuts modal tests
├── integration.spec.ts               # Full user flow tests
├── visual-regression.spec.ts         # Visual regression tests
└── visual-regression-advanced.spec.ts # Advanced visual tests

scripts/
├── update-screenshots.sh             # Update baseline screenshots
├── visual-regression-report.sh       # Run visual tests with report
├── lighthouse-local.sh               # Run Lighthouse CI locally
├── performance-report.sh             # Generate performance report
├── ci-local.sh                       # Run all CI checks locally
├── ci-debug.sh                       # Interactive CI debugger
└── generate-dashboard-data.sh        # Generate dashboard data locally

playwright.config.ts                  # Playwright configuration
lighthouserc.js                       # Lighthouse CI configuration

dashboard/                            # Test results dashboard
├── index.html                        # Dashboard HTML
├── styles.css                        # Dashboard styles
├── dashboard.js                      # Dashboard controller
├── charts.js                         # Chart configurations
├── data-loader.js                    # Data loading utilities
└── data/                             # Test data (generated)
```

### E2E Testing Features

- **Cross-browser testing**: Chromium, Firefox, WebKit, Mobile Safari, Mobile Chrome
- **Mobile testing**: iPhone and Android viewports
- **Visual regression testing**: Automated screenshot comparison to detect UI changes
- **Performance monitoring**: Lighthouse CI for Core Web Vitals and metrics
- **Trace viewer**: Debug failed tests with timeline
- **Parallel execution**: Fast test runs
- **Auto-wait**: Smart element waiting
- **HTML Reporter**: Beautiful test reports

### Performance Monitoring (Lighthouse CI)

Lighthouse CI automatically measures and tracks Core Web Vitals and performance metrics:

**What's measured:**
- **Core Web Vitals**: LCP, FID, CLS
- **Performance metrics**: FCP, TBT, Speed Index, TTI
- **Scores**: Performance, Accessibility, Best Practices, SEO
- **Resource budgets**: HTML, JS, CSS, images, fonts
- **Optimization opportunities**: Image optimization, caching, minification

**Running Lighthouse:**
```bash
# Interactive local test
bash scripts/lighthouse-local.sh

# Generate detailed report
bash scripts/performance-report.sh

# View results
open .lighthouseci/*.html
```

**Performance Budgets:**
- Performance Score: > 90% (desktop), > 85% (mobile)
- LCP: < 2.5s
- CLS: < 0.1
- Total Page Size: < 2MB
- JavaScript: < 500KB

**CI Integration:**
- Runs on every PR and deployment
- Comments scores on pull requests
- Fails build if budgets exceeded
- Tracks metrics over time

### Visual Regression Testing

The project includes comprehensive visual regression testing to automatically detect unintended UI changes:

**How it works:**
1. Baseline screenshots are captured for each component state
2. Future test runs compare new screenshots against baselines
3. Tests fail if visual differences exceed configured thresholds
4. Diff images highlight exact pixel differences

**What's tested:**
- Component appearance (normal, hover, focus states)
- Layout at 7+ responsive breakpoints
- Dark mode vs Light mode
- All interactive states (buttons, panels, modals)
- Typography and text rendering
- Gradients, shadows, and visual effects
- Edge cases (narrow viewports, text overflow)

**Managing baselines:**
```bash
# When you make intentional UI changes, update baselines:
bash scripts/update-screenshots.sh

# Or update a specific test:
npx playwright test e2e/visual-regression.spec.ts --update-snapshots

# Review differences in the HTML report:
npx playwright show-report
```

**Configuration:**
- `maxDiffPixels`: 100 pixels allowed difference
- `threshold`: 0.2 (20% color difference tolerance)
- Animations disabled for consistent captures
- Baselines stored in `e2e/*.spec.ts-snapshots/`

### Writing Tests

Unit tests are located next to the files they test with a `.test.ts` or `.test.tsx` extension. E2E tests are in the `e2e/` directory. All unit tests run in a jsdom environment with automatic cleanup after each test.

## 🔄 Automated Dependency Management

### Dependabot Configuration

This project uses **Dependabot** for automated dependency updates and security vulnerability scanning.

**Features:**
- 🔒 **Security Updates**: Automatic PRs for vulnerabilities
- 📦 **Grouped Updates**: Dependencies grouped by type (React, UI, Testing, etc.)
- 📅 **Weekly Schedule**: Updates checked every Monday at 9 AM UTC
- 🏷️ **Smart Labeling**: Automatic PR labels and commit message formatting
- 🎯 **Version Control**: Intelligent versioning strategy (auto)

**Configuration:**
- Location: `.github/dependabot.yml`
- Schedule: Weekly (Mondays, 9:00 UTC)
- Max open PRs: 10 for npm, 5 for GitHub Actions
- Update types: Both direct and indirect dependencies

**Dependency Groups:**
- `react`: React and related packages
- `ui-components`: Radix UI components
- `testing`: Testing frameworks (Playwright, Vitest)
- `build-tools`: Vite, TypeScript, build tools
- `backend`: Supabase, TanStack Query
- `styling`: Tailwind CSS and utilities
- `forms`: React Hook Form, Zod
- `ci-tools`: Lighthouse CI, axe-core
- And more...

**How It Works:**
1. Dependabot checks for updates weekly
2. Creates grouped PRs by dependency type
3. CI/CD runs all tests automatically
4. Security updates get priority
5. Review and merge when ready

**Manual Trigger:**
You can also trigger dependency updates manually from the GitHub "Insights" → "Dependency graph" → "Dependabot" tab.

For detailed Dependabot configuration and customization, see [CI/CD Setup Guide](docs/CI_CD_SETUP.md#automated-dependency-management).

## 📊 Bundle Size Tracking

### Automated Bundle Size Monitoring

This project uses **size-limit** to automatically track and enforce bundle size limits:

**Features:**
- ⚠️ **Automatic Build Failures**: Builds fail if bundle size exceeds thresholds
- 📈 **Historical Tracking**: Bundle size trends displayed in dashboard
- 🗜️ **Gzip Analysis**: Tracks both raw and compressed sizes
- 📦 **Per-Bundle Limits**: Separate limits for JS, CSS, and vendor chunks

**Configuration:**
- Location: `.size-limit.js`
- Limits: Total (500KB), Main (300KB), CSS (100KB), Vendor (250KB)
- All sizes measured with gzip compression

**Checking Bundle Size:**
```bash
# Check current bundle size against limits
npm run size
# OR if the script is not added to package.json:
npx size-limit
# OR use the provided script:
./scripts/size-check.sh

# Detailed analysis with visual breakdown
./scripts/bundle-size-check.sh

# Generate interactive bundle composition treemap
./scripts/bundle-analyze.sh
```

**Setup:**
To add bundle size checking to your npm scripts, add this to `package.json`:
```json
{
  "scripts": {
    "size": "size-limit"
  }
}
```

**How It Works:**
1. CI/CD runs size checks on every PR and push
2. Compares current size against base branch (for PRs)
3. Comments on PR with size changes and warnings
4. Fails build if limits are exceeded
5. Tracks historical data in test dashboard

**View in Dashboard:**
The bundle size section shows:
- Current total, gzipped, and CSS sizes
- Health status indicator
- Historical size trends with limit lines
- Size comparison over time

## Documentation

For detailed information about animations, performance optimizations, and accessibility features, see:

📖 [Full Documentation](docs/CHAT_WIDGET_ANIMATIONS.md)
📖 [CI/CD Setup Guide](docs/CI_CD_SETUP.md)
📖 [Performance Monitoring Guide](docs/PERFORMANCE_MONITORING.md)

## Technologies

- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Vite
- Vitest (Unit Testing)
- Playwright (E2E & Visual Regression Testing)
- GitHub Actions (CI/CD)

## CI/CD Pipeline

This project includes a comprehensive CI/CD pipeline using GitHub Actions:

### Workflows

#### 1. **CI - Pull Request Checks** (`.github/workflows/ci.yml`)
Runs on every pull request and push to `develop`:
- ✅ Unit tests with coverage reporting
- ✅ E2E tests across Chromium, Firefox, and WebKit
- ✅ Visual regression testing
- ✅ TypeScript type checking
- ✅ Build verification
- ✅ Automated test summary and PR comments

#### 2. **CD - Deploy to Production** (`.github/workflows/cd.yml`)
Runs on push to `main`:
- ✅ Full test suite execution
- ✅ Production build generation
- ✅ Automatic deployment via Lovable's GitHub integration
- ✅ Deployment status tracking
- ✅ Notification on related issues

#### 3. **Update Visual Baselines** (`.github/workflows/visual-baseline-update.yml`)
Manual workflow to update screenshot baselines:
- 🔄 Run via GitHub Actions UI
- 🔄 Updates baseline screenshots
- 🔄 Commits changes automatically

#### 4. **Scheduled Tests** (`.github/workflows/scheduled-tests.yml`)
Runs daily at 2 AM UTC:
- 📅 Full test suite across multiple Node versions
- 📅 Security audit (npm audit)
- 📅 Dependency update checks
- 📅 Automatic issue creation on failure

#### 5. **Lighthouse CI** (`.github/workflows/lighthouse.yml`)
Runs on every PR and push to `main`:
- 🔦 Core Web Vitals measurement (LCP, FID, CLS)
- 🔦 Performance scoring (desktop & mobile)
- 🔦 Accessibility audits
- 🔦 SEO & best practices checks
- 🔦 Resource budget enforcement
- 🔦 Automated PR comments with scores

### Setting Up CI/CD

1. **Connect to GitHub:**
   ```bash
   # In Lovable editor, click GitHub → Connect to GitHub
   # Authorize the Lovable GitHub App
   # Create repository
   ```

2. **Workflows are automatically enabled** when you push to GitHub

3. **Configure secrets (if needed):**
   - Go to GitHub repo → Settings → Secrets and variables → Actions
   - Add any required secrets (e.g., `CODECOV_TOKEN` for coverage reporting)

4. **Customize deployment:**
   - Edit `.github/workflows/cd.yml`
   - Enable custom hosting options (Vercel, Netlify, AWS S3)
   - Add required secrets for your hosting provider

### Local CI Checks

Run CI checks locally before pushing:

```bash
# Run all checks (recommended before pushing)
bash scripts/ci-local.sh

# Interactive debugging for specific checks
bash scripts/ci-debug.sh
```

### Visual Regression Management

When you intentionally change UI:

```bash
# Update baselines locally
bash scripts/update-screenshots.sh

# Or via GitHub Actions
# Go to Actions → Update Visual Baselines → Run workflow
```

### CI/CD Features

- **Fast execution**: Parallel test execution, smart caching
- **Cross-browser**: Tests run on Chromium, Firefox, WebKit
- **Visual regression**: Automatic screenshot comparison
- **Performance monitoring**: Lighthouse CI for Core Web Vitals
- **Code coverage**: Uploaded to Codecov (optional)
- **Test artifacts**: Screenshots, traces, and reports preserved
- **Smart notifications**: PR comments, issue mentions, deployment status
- **Multi-environment**: Test on Node 18, 20, and 21
- **Security scanning**: Daily dependency audits
- **Resource budgets**: Automatic enforcement of size limits

### Monitoring Test Results

- **GitHub Actions UI**: View all workflow runs
- **PR Checks**: See status directly on pull requests
- **Test Reports**: Download HTML reports from artifacts
- **Coverage Reports**: View coverage trends (if Codecov configured)
- **Deployment Status**: Track via GitHub Deployments
- **Test Dashboard**: Interactive dashboard at `https://<username>.github.io/<repo>/`

### Test Results Dashboard

An interactive dashboard displays comprehensive test metrics:

**Features:**
- 📊 Real-time test statistics and trends
- 🔦 Lighthouse performance scores over time
- ♿ Accessibility audit results
- 📈 Code coverage trends
- 👁️ Visual regression change gallery
- 📦 Build size tracking

**Accessing the Dashboard:**

The dashboard is automatically deployed to GitHub Pages after each test run:
```
https://<your-username>.github.io/<your-repo>/
```

**Local Dashboard:**
```bash
# Generate dashboard data from local tests
bash scripts/generate-dashboard-data.sh

# Open dashboard
open dashboard/index.html
```

**Dashboard Sections:**
1. **Overview**: Test pass/fail rates, duration trends
2. **Performance**: Lighthouse scores, Core Web Vitals
3. **Accessibility**: WCAG violations, audit results
4. **Coverage**: Line, branch, function coverage
5. **Visual Regression**: Screenshot diffs, failure gallery
6. **Build Size**: Bundle size trends, resource analysis

### Troubleshooting CI Failures

1. **View detailed logs** in GitHub Actions
2. **Download test artifacts** for screenshots and traces
3. **Run locally** using `bash scripts/ci-debug.sh`
4. **Check visual diffs** in test results artifacts
5. **Review the troubleshooting docs** for common issues



## Deployment

Click the **Publish** button in the top-right corner of the Lovable editor to deploy your app.

## Custom Domain

To connect a custom domain, navigate to: `Project > Settings > Domains`

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

Built with [Lovable](https://lovable.dev)
