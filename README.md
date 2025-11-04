# AI Chat Widget with Accessibility

A responsive, animated AI chat widget with full accessibility support including `prefers-reduced-motion` compliance and developer debug tools.

[![Tests](https://img.shields.io/badge/tests-passing-brightgreen)](https://github.com)
[![E2E](https://img.shields.io/badge/e2e-playwright-green)](https://playwright.dev)

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

# Visual Regression Tests
npx playwright test e2e/visual-regression.spec.ts           # Run visual tests
npx playwright test e2e/visual-regression-advanced.spec.ts  # Run advanced visual tests
bash scripts/visual-regression-report.sh                    # Run with detailed report

# Update Visual Regression Baselines (when UI changes are intentional)
bash scripts/update-screenshots.sh                          # Update all baseline screenshots
npx playwright test --update-snapshots                      # Alternative: update all snapshots
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
└── visual-regression-report.sh       # Run visual tests with report

playwright.config.ts                  # Playwright configuration
```

### E2E Testing Features

- **Cross-browser testing**: Chromium, Firefox, WebKit, Mobile Safari, Mobile Chrome
- **Mobile testing**: iPhone and Android viewports
- **Visual regression testing**: Automated screenshot comparison to detect UI changes
- **Trace viewer**: Debug failed tests with timeline
- **Parallel execution**: Fast test runs
- **Auto-wait**: Smart element waiting
- **HTML Reporter**: Beautiful test reports

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

## Documentation

For detailed information about animations, performance optimizations, and accessibility features, see:

📖 [Full Documentation](docs/CHAT_WIDGET_ANIMATIONS.md)

## Technologies

- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Vite

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
