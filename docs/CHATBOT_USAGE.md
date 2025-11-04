# Chatbot Widget - Usage Guide

## Overview
A minimal, elegant, always-visible floating chatbot widget with **drag-and-drop repositioning** for real estate applications.

## Features

### 🎯 Drag-and-Drop Repositioning
- **Grab and move** the button anywhere on screen
- **Position persists** across sessions (saved in localStorage)
- **Smart positioning**: Chat window appears next to button
- **Viewport constraints**: Button stays within screen bounds
- **Touch support**: Works on mobile devices
- **Visual feedback**: Cursor changes and button scales when dragging

### ✨ Always Visible
- Fixed position (customizable via drag)
- Never hides on scroll
- Expandable popup interface

### 🔔 Unread Badge
- Automatic unread message counter
- Badge appears when chat is closed and AI responds
- Clears automatically when chat opens
- Red notification badge with count (shows "99+" for 100+ messages)

### 🎨 Button Variants
Three beautiful button styles to choose from:

1. **`pulse`** (default) - Blue-purple gradient with subtle pulse animation
2. **`glow`** - Purple-pink gradient with glowing shadow effect
3. **`subtle`** - Minimal dark theme with subtle hover effects

### ⌨️ Keyboard Shortcuts
- **`Ctrl+K`** (or `Cmd+K` on Mac) - Open chat
- **`Esc`** - Close chat
- **`Enter`** - Send message (in input field)

### 🖱️ Mouse Interactions
- **Click** - Open/close chat
- **Click & Drag** - Reposition button anywhere on screen
- **Hover** - Scale up with smooth animation
- **Drag handle** - Small grip icon appears on hover

### 📱 Mobile Responsive
- Fullscreen on mobile (90vh)
- Fixed width on desktop (420px)
- Smooth slide-in animations
- No layout shift on iPhone

### ♿ Accessible
- ARIA labels for screen readers
- Keyboard navigation support
- Focus management
- Role and status attributes

## Usage

### Basic Implementation
```tsx
import ResponsiveAIChatWidget from "@/components/ai/ResponsiveAIChatWidget";

function App() {
  return (
    <div>
      {/* Your app content */}
      <ResponsiveAIChatWidget />
    </div>
  );
}
```

### With Button Variant
```tsx
<ResponsiveAIChatWidget buttonVariant="glow" />
```

### With Property Context
```tsx
<ResponsiveAIChatWidget 
  propertyId="123"
  onTourControl={(action, target) => {
    console.log(`Tour control: ${action} -> ${target}`);
  }}
  buttonVariant="pulse"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `propertyId` | `string` | `undefined` | Optional property ID for context-aware responses |
| `onTourControl` | `(action: string, target: string) => void` | `undefined` | Callback for 3D tour control actions |
| `buttonVariant` | `"pulse" \| "glow" \| "subtle"` | `"pulse"` | Visual style of the floating button |

## Components

### ChatButton
The floating trigger button with unread badge.

```tsx
import ChatButton from "@/components/ai/ChatButton";

<ChatButton 
  onClick={() => setIsOpen(true)}
  unreadCount={3}
  variant="glow"
/>
```

### UnreadBadge
Notification badge showing unread count.

```tsx
import UnreadBadge from "@/components/ai/UnreadBadge";

<UnreadBadge count={5} />
```

## Hooks

### useChatKeyboardShortcuts
Manages keyboard shortcuts for the chat widget.

```tsx
import { useChatKeyboardShortcuts } from "@/hooks/useChatKeyboardShortcuts";

useChatKeyboardShortcuts({
  isOpen: chatOpen,
  onOpen: () => setChatOpen(true),
  onClose: () => setChatOpen(false),
});
```

### useDraggablePosition
Manages draggable element position with localStorage persistence.

```tsx
import { useDraggablePosition } from "@/hooks/useDraggablePosition";

const { position, isDragging, handleDragStart, resetPosition } = useDraggablePosition({
  defaultPosition: { x: 24, y: 24 },
  storageKey: "my-draggable-key",
  bounds: {
    minX: 8,
    maxX: window.innerWidth - 64,
    minY: 8,
    maxY: window.innerHeight - 64,
  }
});
```

## Animations

### Desktop
- **Open**: Slide in from right with fade
- **Close**: Slide out to right with fade
- **Button**: Subtle pulse animation (for "pulse" variant)

### Mobile
- **Open**: Slide up from bottom
- **Close**: Slide down to bottom
- **Button**: Reduced motion for better mobile performance

## Architecture

### File Structure
```
src/components/ai/
├── ResponsiveAIChatWidget.tsx    # Main widget component
├── ChatButton.tsx                 # Floating button with variants
├── UnreadBadge.tsx               # Notification badge
├── AIChatMessages.tsx            # Message display
├── AIChatInput.tsx               # Input field
├── AIChatQuickActions.tsx        # Quick action buttons
└── types.ts                      # TypeScript types

src/hooks/
├── useChatKeyboardShortcuts.ts   # Keyboard shortcut logic
└── useDraggablePosition.ts       # Drag-and-drop logic
```

### State Management
- **Position**: Saved in localStorage, loads on mount
- **Unread Count**: Increments when AI responds while chat is closed
- **Messages**: Full conversation history
- **Conversation ID**: Persists across session
- **Loading States**: UI feedback for async operations
- **Drag State**: Tracks active dragging, prevents click during drag

## How Drag-and-Drop Works

### User Experience
1. **Hover** over the button - cursor changes to `grab`
2. **Click and hold** - cursor changes to `grabbing`, button scales up
3. **Move mouse** - button follows cursor smoothly
4. **Release** - position saves to localStorage automatically
5. **Chat window** opens next to button's new position

### Technical Details
- Uses `mousedown`/`touchstart` to initiate drag
- `mousemove`/`touchmove` updates position in real-time
- `mouseup`/`touchend` saves position to localStorage
- Position is constrained to viewport bounds (8px padding)
- Chat window intelligently positions left or right of button
- If not enough space on left, opens on right side

## Customization

### Custom Button Colors
Edit `ChatButton.tsx` to add more variants:

```tsx
const variantStyles: Record<ChatButtonVariant, string> = {
  pulse: "...",
  glow: "...",
  subtle: "...",
  custom: "bg-gradient-to-r from-green-600 to-teal-600 hover:shadow-xl"
};
```

### Custom Drag Bounds
Constrain dragging to specific area:

```tsx
const { position, handleDragStart } = useDraggablePosition({
  defaultPosition: { x: 24, y: 24 },
  bounds: {
    minX: 100,
    maxX: 500,
    minY: 100,
    maxY: 400,
  }
});
```

### Reset Position Programmatically
```tsx
const { resetPosition } = useDraggablePosition();

// Reset to default position
<button onClick={resetPosition}>Reset Chatbot Position</button>
```

### Custom Keyboard Shortcuts
Edit `useChatKeyboardShortcuts.ts`:

```tsx
// Add Ctrl+Shift+C to toggle
if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'c') {
  e.preventDefault();
  isOpen ? onClose() : onOpen();
}
```

## Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari (iOS 13+)
- Chrome Mobile (Android 10+)

## Performance
- Lazy loading for chat UI
- Debounced scroll handlers removed (always visible)
- GPU-accelerated animations
- Minimal re-renders with memoization

## Troubleshooting

### Button not appearing
- Check z-index conflicts (button uses `z-[9999]`)
- Verify component is rendered in DOM
- Check for CSS conflicts with `fixed` positioning
- Clear localStorage if position is saved off-screen: `localStorage.removeItem('chatbot-button-position')`

### Dragging not working
- Ensure `onDragStart` handler is passed to `ChatButton`
- Check console for errors during drag events
- Verify touch events work on mobile devices
- Test with different browsers (some may block mouse events)

### Position resets on refresh
- Check if localStorage is enabled
- Verify storage key is consistent
- Look for localStorage clear in app code
- Test in incognito mode (localStorage persists separately)

### Chat window appears off-screen
- Window auto-constrains to viewport bounds
- Reset position: `localStorage.removeItem('chatbot-button-position')`
- Check `getChatWindowPosition()` logic

### Keyboard shortcuts not working
- Check for conflicting browser shortcuts
- Verify focus is not trapped in input field
- Test with `disabled={false}` prop

## Best Practices

1. **Single Instance**: Only render one `ResponsiveAIChatWidget` per page
2. **Lazy Loading**: Use React.lazy() for better performance
3. **Error Handling**: Implement error boundaries around the widget
4. **Testing**: Mock keyboard events, drag events, and test all variants
5. **Accessibility**: Test with keyboard-only navigation and screen readers
6. **Position Limits**: Set reasonable bounds to prevent button going off-screen
7. **Visual Feedback**: Use cursor changes and animations to indicate draggability

## Future Enhancements
- [x] ~~Drag to reposition button~~ ✅ Implemented!
- [ ] Double-click to reset position to default
- [ ] Snap to grid or edges
- [ ] Magnetic corners (auto-snap to corners)
- [ ] Position presets (top-left, top-right, bottom-left, bottom-right)
- [ ] Sound notifications for new messages
- [ ] Minimize to compact mode
- [ ] Chat history persistence
- [ ] Multi-language support
