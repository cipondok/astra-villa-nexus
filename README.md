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
- **Keyboard Shortcut**: Press `Cmd/Ctrl + D` to instantly toggle the panel open/closed

### Using the Debug Panel

1. **Open the panel**:
   - Click the ⚙️ Settings icon in the bottom-left corner, OR
   - Press `Cmd/Ctrl + D` on your keyboard
2. The panel shows current animation state
3. Click "Enable Animations" or "Disable Animations" to toggle
4. Click "Reset to System Setting" to clear manual override
5. Close the panel with the X button or `Cmd/Ctrl + D` (your settings persist)

## Visual Indicators

### Console Logs (Development)
- `✨ Accessibility: Full animations enabled` - Normal animation mode
- `🎯 Accessibility: Reduced motion mode is ACTIVE` - Simplified animations
- `🔧 Dev Override: Reduced motion manually set to ON/OFF` - Manual toggle used

### On-Screen Badge (Development)
A "Reduced Motion" badge appears above the chat button when reduced motion is active, helping you verify the current state at a glance.

## Project Structure

```
src/
├── components/
│   └── ai/
│       ├── ResponsiveAIChatWidget.tsx  # Main chat widget
│       └── DebugPanel.tsx              # Debug control panel
├── hooks/
│   └── usePrefersReducedMotion.ts     # Accessibility hook
└── ...
```

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
