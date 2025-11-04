# AI Chat Widget with Accessibility

A responsive, animated AI chat widget with full accessibility support including `prefers-reduced-motion` compliance and developer debug tools.

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

The project uses Vitest and React Testing Library for testing.

### Test Coverage

- **usePrefersReducedMotion Hook**: Tests system preference detection, manual override, localStorage persistence, and priority handling
- **DebugPanel Component**: Tests UI rendering, button interactions, keyboard shortcuts, and environment-based visibility

### Writing Tests

Tests are located next to the files they test with a `.test.ts` or `.test.tsx` extension. All tests run in a jsdom environment with automatic cleanup after each test.

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
